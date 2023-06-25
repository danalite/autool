# https://stackoverflow.com/a/57467550
from multiprocessing import freeze_support
freeze_support()

import os
import json
import tempfile
from copy import deepcopy

import pygb
import requests
import asyncio
import random

import websockets
from libauto import new_task_sch, download

from io import BytesIO
from py_rust_search import get_similar_files


# websocket server states management
active_conns = dict()
global ts


def get_dict_value(obj, keys):
    if isinstance(keys, str):
        return obj[keys]
    elif isinstance(keys, list):
        v = obj
        for k in keys:
            v = v[k]
        return v
    else:
        raise Exception("Invalid key type")


async def send_web_request(websocket, url, query, params):
    search_type = params.get("__QUERY_TYPE__", "GET")
    search_key = params.get("__QUERY_KEY__")
    mapping = params.get("__RESPONSE_MAP__")

    user_params = {
        k: v for k, v in params.items()
        if not (k.startswith("__") and k.endswith("__"))}
    if search_key:
        user_params[search_key] = query

    ret = []
    if search_type == "GET":
        resp = requests.get(url, params=user_params)
        r = resp.json()
        if mapping:
            r = get_dict_value(r, mapping.get("prologue", []))
            if not isinstance(r, list):
                print("Error: WEB response is not a list", r)
                await websocket.send(json.dumps([]))

            key_mapping = mapping.get("mapping", [])
            if key_mapping:
                for _ in r:
                    r_new = deepcopy(mapping.get("base", {}))
                    for pair in key_mapping:
                        k, v = pair
                        r_new[v] = get_dict_value(_, k)
                    ret.append(r_new)
            else:
                ret = r

            print("Processed GET response:", ret)
            await websocket.send(json.dumps(ret))

    elif search_type == "POST":
        files = {'json': ('params', json.dumps(
            user_params), 'application/json')}

        if "file" in user_params:
            files['file'] = ('file', open(
                user_params["file"], 'rb'), 'application/octet-stream')
        stream = user_params.get("stream", False)

        response = requests.post(
            params["server"], files=files, stream=stream)

        if response.status_code == 200:
            if stream:
                for chunk in response.iter_content(chunk_size=30):
                    if chunk:
                        v = chunk.decode('utf-8')
                        print(v, end='', flush=True)
                        await websocket.send(json.dumps({'text': v}))

            else:
                ret = response.json()
                await websocket.send(json.dumps(ret))
        else:
            print("[ ERROR ]", response.status_code, response)


def process_window_capture(params):
    image = pygb.screenshot(
        window=params["windowId"]).convert('RGB')
    byte_io = BytesIO()
    image.save(byte_io, 'PNG')
    byte_io.seek(0)

    cord = {'x': params["mouseX"],
            'y': params["mouseY"]}
    files = {
        'json': ('params', json.dumps(cord), 'application/json'),
        'image': ('image', byte_io.read(), 'application/octet-stream')
    }
    response = requests.post(
        params["server"], files=files)

    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
        f.write(response.content)
        output_path = f.name

    ret = {"image": output_path, **params}


async def search_files_from_dir(location, query, params):
    resp = []
    for _ in get_similar_files(query, location):
        ext = os.path.splitext(_)[-1]
        entry = {"label": _.split(os.sep)[-1], "value": _, "ext": ext}
        resp.append(entry)
    return resp


async def event_queue_listener(task_sch):
    while len(task_sch.event_proxy.o_queue) == 0:
        await asyncio.sleep(random.random() * 1)
    events = task_sch.event_proxy.o_queue.copy()
    task_sch.event_proxy.o_queue.clear()
    return events


async def loopMain(websocket):
    try:
        while True:
            # Check if the connection is still active
            try:
                await websocket.ping()
            except websockets.exceptions.ConnectionClosed:
                print(
                    f"[WARNING] {websocket} no longer alive. Exiting...")
                print(f"[INFO] Active connections: {active_conns}")
                break

            frontend_event = asyncio.ensure_future(websocket.recv())
            backend_event = asyncio.ensure_future(
                event_queue_listener(ts))

            done, pending = await asyncio.wait(
                [frontend_event, backend_event],
                return_when=asyncio.FIRST_COMPLETED)

            if frontend_event in done:
                message = json.loads(frontend_event.result())
                ts.event_proxy.resolve(message)

            else:
                frontend_event.cancel()

            if (backend_event in done) or backend_event.done():
                events = backend_event.result()
                # print("(O_Event)", events)
                for event in events:
                    await websocket.send(json.dumps(event))

            else:
                backend_event.cancel()

            await asyncio.sleep(random.random() * 0.2)

    except websockets.exceptions.ConnectionClosed:
        print(
            f"[WARNING] ConnectionClosed {websocket}. Exiting __MAIN__ executor...")
        print(f"[INFO] Active connections: {active_conns}")


async def websocket_handler(websocket):
    active_conns[websocket] = asyncio.get_event_loop().time()

    try:
        message = await websocket.recv()
        print(f"[INFO] Init {message} from {websocket}")
        message = json.loads(message)
        worker = message["value"]

    except websockets.exceptions.ConnectionClosed:
        print(f"[WARNING] ConnectionClosed {websocket}. Exiting...")

    else:
        if worker == "__MAIN__":
            await loopMain(websocket)

        elif worker == "__DOWNLOAD__":
            success = True
            try:
                url = message["appUrl"]
                download(url, message["appHome"])
                ack = f"Successfully downloaded {url}"

            except Exception as e:
                success = False
                ack = "Error: " + str(e)

            await websocket.send(json.dumps({
                "event": "O_EVENT_WSS_RESP",
                "message": ack, "success": success}))

        elif worker.startswith("file://"):
            location = worker[7:]
            if location.startswith("localhost/"):
                location = location[10:]
                q = await search_files_from_dir(location, message["query"], message["params"])
                await websocket.send(json.dumps(q))

        elif worker.startswith("cmd://"):
            out = pygb.run_cmd(worker[6:])
            await websocket.send(json.dumps(out))

        elif worker.startswith(("http://", "https://")):
            query = message["query"]
            params = message["params"]

            if "__PARENT_SEARCH_TYPE__" in params:
                # postSearch request
                for i in range(10):
                    await asyncio.sleep(0.5)
                    q = {
                        "type": "text",
                        "label": "Return for " + query,
                        "stream": True if i < 9 else False,
                        "content": "text example "
                    }
                    await websocket.send(json.dumps(q))

            else:
                # [{ label, value, src, description, width } ]
                await send_web_request(websocket, worker, query, params)
    try:
        del active_conns[websocket]
    except KeyError:
        print(f"[WARNING] {websocket} not found in active_conns")
    print(f"[INFO] Active connections: {active_conns}")


async def check_connections():
    # Check for active WebSocket connections
    while True:
        await asyncio.sleep(15)
        if len(active_conns) == 0:
            print("No active connections, exiting...")
            # asyncio.get_event_loop().stop()
            ts.stop()
            break

        elif len(active_conns) > 1:
            print("===== Multiple Wss Connections =====")
            sockets = list(active_conns.keys())
            for socket in sockets:
                await socket.close()
            active_conns.clear()


def is_port_in_use(port: int) -> bool:
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


async def main():
    async with websockets.serve(websocket_handler, "localhost", 5678):
        # await asyncio.Future()  # run forever

        # Wait for the server and connection checking task to complete
        connection_check_task = asyncio.ensure_future(check_connections())
        await asyncio.gather(connection_check_task)


if __name__ == "__main__":
    if is_port_in_use(5678):
        exit("Port 5678 is already in use. Exiting...")

    ts = new_task_sch()
    asyncio.run(main())
