import asyncio
import websockets

async def hello():
    async with websockets.connect("ws://localhost:8765") as websocket:
        await websocket.send("1")
        await websocket.recv()

asyncio.run(hello())