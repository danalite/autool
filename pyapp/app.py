import json
import asyncio
import random
import websockets
from libauto import new_task_sch

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
        userReq = asyncio.ensure_future(websocket.recv())
        backendEvent = asyncio.ensure_future(
            eventQueueListener(ts))

        done, pending = await asyncio.wait(
            [userReq, backendEvent],
            return_when=asyncio.FIRST_COMPLETED)

        if userReq in done:
            message = userReq.result()
            print(f"(I_Event)", message)
            request = json.loads(message)
            ts.event_proxy.resolve(request)

        else:
            userReq.cancel()

        if backendEvent in done:
            events = backendEvent.result()
            print("(O_Event)", events)
            for event in events:
                await websocket.send(json.dumps(event))

        elif backendEvent.done():
            events = backendEvent.result()
            print("(O_Event)", events)
            for event in events:
                await websocket.send(json.dumps(event))

        else:
            backendEvent.cancel()
        await asyncio.sleep(random.random())


async def wssRegister(websocket):
    message = await websocket.recv()
    event = json.loads(message)

    print(f"<<< {event}")
    data = event["value"]
    worker = data["worker"]

    # Register wss connection
    conns[worker] = {
        "ws": websocket,
    }
    if worker == "Main":
        await loopMain(websocket)


async def main():
    async with websockets.serve(wssRegister, "localhost", 5678):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
