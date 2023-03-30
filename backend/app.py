import os
import json
import asyncio
import random

import websockets
from libauto import new_task_sch, download
from py_rust_search import get_similar_files

# Manage application states
active_conns = dict()
ts = new_task_sch()


async def eventQueueListener(task_sch):
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

            userEvent = asyncio.ensure_future(websocket.recv())
            backendEvent = asyncio.ensure_future(
                eventQueueListener(ts))

            done, pending = await asyncio.wait(
                [userEvent, backendEvent],
                return_when=asyncio.FIRST_COMPLETED)

            if userEvent in done:
                message = json.loads(userEvent.result())
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
                userEvent.cancel()

            if (backendEvent in done) or backendEvent.done():
                events = backendEvent.result()
                # print("(O_Event)", events)
                for event in events:
                    await websocket.send(json.dumps(event))

            else:
                backendEvent.cancel()

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
        if worker == "Download":
            ack = "Success."
            try:
                download(message["appUrl"], message["appHome"])
            except Exception as e:
                ack = "Error: " + str(e)

            await websocket.send(json.dumps({"event": "O_EVENT_WSS_RESP", "message": ack}))

        elif worker == "MainLoop":
            await loopMain(websocket)

        elif worker == "SearchFile":
            q = [{"label": _.split(os.sep)[-1], "value": _, "ext": os.path.splitext(_)[-1]} for _ in get_similar_files(
                message["query"], message["params"]["location"])]
            await websocket.send(json.dumps(q))


async def check_connections():
    # Check for active WebSocket connections
    while True:
        await asyncio.sleep(10)
        if len(active_conns) == 0:
            print("No active connections, exiting...")
            # asyncio.get_event_loop().stop()
            break


async def main():
    async with websockets.serve(websocket_handler, "localhost", 5678):
        # await asyncio.Future()  # run forever

        # Wait for the server and connection checking task to complete
        connection_check_task = asyncio.ensure_future(check_connections())
        await asyncio.gather(connection_check_task)


if __name__ == "__main__":
    asyncio.run(main())
