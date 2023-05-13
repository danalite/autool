import os
import json
import tempfile

# https://stackoverflow.com/a/57467550
import multiprocessing
multiprocessing.freeze_support()

import pygb
import requests
import asyncio
import random

from PIL import Image
import websockets
from libauto import new_task_sch, download

from io import BytesIO
from py_rust_search import get_similar_files

# websocket server states management
active_conns = dict()
global ts

async def send_http_request(websocket, params):
    files = {'json': ('params', json.dumps(
        params), 'application/json')}

    if "file" in params:
        files['file'] = ('file', open(
            params["file"], 'rb'), 'application/octet-stream')
    stream = params["stream"] if "stream" in params else False

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


async def search_files_from_dir(query, params):
    location = params["location"]
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
                    f"[WARNING] Mainloop ConnectionClosed {websocket}. Exiting MainLoop executor...")
                break

            frontend_event = asyncio.ensure_future(websocket.recv())
            backend_event = asyncio.ensure_future(
                event_queue_listener(ts))

            done, pending = await asyncio.wait(
                [frontend_event, backend_event],
                return_when=asyncio.FIRST_COMPLETED)

            if frontend_event in done:
                message = json.loads(frontend_event.result())
                if message["event"] == "I_EVENT_WSS_REQ":
                    action = message["action"]
                    if action == "Shutdown":
                        for conn in active_conns.keys():
                            await conn.close()
                        # asyncio.get_event_loop().stop()
                        break
                else:
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
        print(f"[WARNING] ConnectionClosed {websocket}")


async def websocket_handler(websocket):
    active_conns[websocket] = asyncio.get_event_loop().time()

    try:
        message = await websocket.recv()
        print(f"[INFO] Init {message} from {websocket}")
        message = json.loads(message)
        worker = message["value"]

    except websockets.exceptions.ConnectionClosed:
        del active_conns[websocket]

    else:
        if worker == "MainLoop":
            await loopMain(websocket)

        elif worker == "Download":
            try:
                download(message["appUrl"], message["appHome"])
                ack = "Success"
            except Exception as e:
                ack = "Error: " + str(e)

            await websocket.send(json.dumps({"event": "O_EVENT_WSS_RESP", "message": ack}))

        elif worker == "Files":
            q = await search_files_from_dir(message["query"], message["params"])
            await websocket.send(json.dumps(q))
        
        elif worker.startswith("cmd://"):
            out = pygb.run_cmd(worker[6:])
            await websocket.send(json.dumps(out))

        elif worker.startswith(("http://", "https://")):
            query = message["query"]
            params = message["params"]

            if "__PARENT_SEARCH_TYPE__" in params:
                # return JSON for extra GUI rendering
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
                # return a list of options
                # response = requests.get(worker)
                q = [{"label": "Hipoly 3D Model LoRA", "value": "tes5", "src": "https://imagecache.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/3e28cc7f-dd15-4dbf-0981-b840dc19fc00/width=450/01972-20230410094800-1041864763-models_02_25D_AlstroemeriaMix-fp16.jpeg", "description": "Realistic", "width": 100},
                     {
                    "label": "Cetus-Mix", "value": "xx", "src": "https://imagecache.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e8af6535-6ff6-4404-c6f9-63a28029bb00/width=450/00877-1649434158-(neko%20girl),hold%20a%20cat,%20%20cute,%20full%20of%20cats,%20(%20full%20body),%20,Cat%20litter%20boxes,%20cat%20paintings%20on%20the%20wall,%20(detailed%20face),.jpeg", "description": "Anime", "width": 100},
                    {
                    "label": "Firewatch Diffusion Model",
                    "value": "xx",
                    "src": "https://imagecache.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/cdfccd83-1f02-4580-4bbc-f11d665d8800/width=450/frozenl.jpeg",
                    "description": "Landscapes, Anime",
                    "width": 100
                },
                    {
                    "label": "2D Sprite style",
                    "value": "xx",
                    "src": "https://imagecache.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/0a93ad68-6798-4798-544e-18fe4df7ef00/width=450/330270.jpeg",
                    "description": "Characters, 2D",
                    "width": 100
                },
                ]
                q = [_ for _ in q if message["query"] in _["label"]]
                await websocket.send(json.dumps(q))


async def check_connections():
    # Check for active WebSocket connections
    while True:
        await asyncio.sleep(10)
        if len(active_conns) == 0:
            print("No active connections, exiting...")
            # asyncio.get_event_loop().stop()
            ts.stop()
            break


async def main():
    async with websockets.serve(websocket_handler, "localhost", 5678):
        # await asyncio.Future()  # run forever

        # Wait for the server and connection checking task to complete
        connection_check_task = asyncio.ensure_future(check_connections())
        await asyncio.gather(connection_check_task)


if __name__ == "__main__":
    ts = new_task_sch()
    asyncio.run(main())