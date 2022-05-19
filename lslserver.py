"""Python Lsl Server helper for streaming markers from javascript to a local lsl network @Steeven """
# %%

import sys
import getopt

import time
from random import random as rand
import socket


import asyncio
import websockets

from pylsl import StreamInfo, StreamOutlet, local_clock, IRREGULAR_RATE, cf_int8

# %% Websocket


srate = IRREGULAR_RATE
name = 'CCT'
type = 'Markers'
n_channels = 1

info = StreamInfo(name, type, n_channels, srate, 'string', 'myuid34234')
# next make an outlet
outlet = StreamOutlet(info)


async def echo(websocket, other):
    async for message in websocket:
        outlet.push_sample(message)
        print(message) 

async def main():
    async with websockets.serve(echo, "localhost", 8765):
        await asyncio.Future()  # run forever


asyncio.run(main())
# %%


#HOST = "127.0.0.1"  # Standard loopback interface address (localhost)
#PORT = 65432  # Port to listen on (non-privileged ports are > 1023)
#
#srate = IRREGULAR_RATE
#name = 'CCT'
#type = 'Markers'
#n_channels = 1
#
# last value would be the serial number of the device or some other more or
# less locally unique identifier for the stream as far as available (you
# could also omit it but interrupted connections wouldn't auto-recover)
#info = StreamInfo(name, type, n_channels, srate, 'string', 'myuid34234')
## next make an outlet
#outlet = StreamOutlet(info)
#
#
#start_time = local_clock()
#sent_samples = 0
#
#
#with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
#    s.bind((HOST, PORT))
#    s.listen()
#    conn, addr = s.accept()
#    with conn:
#        print(f"Connected by {addr}")
#        print('Noda')
#        while True:
#            print('Nodas')
#            data = conn.recv(1024)
#            if not data:
#                print('breaking')
#                break
#            #conn.sendall(data)
#            print("Pushing")
#            outlet.push_sample("2")

# while True:
#     elapsed_time = local_clock() - start_time
# 
# 
#     outlet.push_sample("2")
# 
#     time.sleep(1)