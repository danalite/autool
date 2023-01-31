import json
import asyncio
import random

import websockets
from libauto import new_task_sch, download

# Manage application states
conns = dict()
ts = new_task_sch()


async def eventQueueListener(task_sch):
    while len(task_sch.event_proxy.o_queue) == 0:
        await asyncio.sleep(random.random() * 1)
    events = task_sch.event_proxy.o_queue.copy()
    task_sch.event_proxy.o_queue.clear()
    return events


async def loopMain(websocket):
    while True:
        userEvent = asyncio.ensure_future(websocket.recv())
        backendEvent = asyncio.ensure_future(
            eventQueueListener(ts))

        done, pending = await asyncio.wait(
            [userEvent, backendEvent],
            return_when=asyncio.FIRST_COMPLETED)

        if userEvent in done:
            message = json.loads(userEvent.result())
            # if message["event"] == "I_EVENT_WSS_REQUEST":
            #     action = message["action"]
            #     if action == "close":
            #         asyncio.get_event_loop().stop()
            #         break
            ts.event_proxy.resolve(message)

        else:
            userEvent.cancel()

        if backendEvent in done:
            events = backendEvent.result()
            # print("(O_Event)", events)
            for event in events:
                await websocket.send(json.dumps(event))

        elif backendEvent.done():
            events = backendEvent.result()
            # print("(O_Event)", events)
            for event in events:
                await websocket.send(json.dumps(event))

        else:
            backendEvent.cancel()

        await asyncio.sleep(random.random() * 0.2)


async def wssRegister(websocket):
    message = await websocket.recv()
    event = json.loads(message)

    # print(f"<<< {event}")
    data = event["value"]
    worker = data["worker"]

    if worker == "Main":
        # Register wss connection
        conns[worker] = {
            "ws": websocket,
        }
        await loopMain(websocket)

    elif worker == "DownloadWorker":
        try:
            download(data["url"])
            print("DownloadWorker: complete")
            await websocket.send(json.dumps({"type": "DownloadWorker", "value": "Done"}))

        except Exception as e:
            await websocket.send(json.dumps({"type": "DownloadWorker", "value": "Error"}))

        await websocket.close()


async def main():
    async with websockets.serve(wssRegister, "localhost", 5678):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
