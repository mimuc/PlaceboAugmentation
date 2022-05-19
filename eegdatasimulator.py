import sys
import getopt

import time
from random import random as rand

from pylsl import StreamInfo, StreamOutlet, local_clock, IRREGULAR_RATE



srate = 100
name = 'EEGDATA'
type = 'EEG'
n_channels = 2
help_string = 'SendData.py -s <sampling_rate> -n <stream_name> -t <stream_type>'


# last value would be the serial number of the device or some other more or
# less locally unique identifier for the stream as far as available (you
# could also omit it but interrupted connections wouldn't auto-recover)
info = StreamInfo(name, type, n_channels, srate, 'float32', 'myuid342245')
# next make an outlet
outlet = StreamOutlet(info)


start_time = local_clock()
sent_samples = 0

while True:
    elapsed_time = local_clock() - start_time


    outlet.push_sample([rand(), rand()])

    time.sleep(0.01)