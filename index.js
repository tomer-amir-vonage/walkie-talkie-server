'use strict';

const Tcp = require('./tcp')
const Udp = require('./udp')

// TCP Sockets
const tcp = new Tcp(6000);

// UDP Sockets
const rtp = new Udp(6001);
const rtcp = new Udp(6002);
