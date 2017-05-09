'use strict';

const _ = require('lodash');
const client = require('./client');

const clients = client.clients;

function UDP(port, role) {

    const dgram = require('dgram');
    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        server.close();
    });

    server.on('message', (msg, rinfo) => {
        // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
        if ((msg + "").startsWith('PUT / HTTP/1.1')) {
            return;
        }

        let data;

        try {
            data = JSON.parse(msg);
        } catch (err) {}

        let curr_client = addClient(data, rinfo.port, rinfo.address);

        if (!data && curr_client.isBroadcasting())
            broadcast(msg, curr_client);
    });

    server.on('listening', () => {
        let address = server.address();
        console.log(`UDP server listening on port ${address.port}`);
    });

    let sending = false;
    let message_queue = [];

    function broadcast(message, curr_client) {
        clients.forEach((curr, index) => {

            if (curr.compare(curr_client))
                return;

            let socket = curr[role];

            // Check if client has finished connecting
            if (!role || !socket)
                return;

            message_queue.push({ message: message, port: socket.port, address: socket.address, index: index });

            if (!sending) {
                sending = true;
                sendMessages();
            }
        });
    }

    function sendMessages() {
        let message = message_queue.splice(-1,1)[0];

        if (!message) {
            sending = false;
            return;
        }

        server.send(message.message, message.port, message.address, (err) => {
            if (!err) {
                sendMessages();
                return;
            }

            console.error("UDP ERROR: ", err);
            clients.splice(message.index, 1);
        });
    }

    function addClient(data, port, address) {

        if (data && data.uuid) {
            console.log(role + " data received for client: " + data.uuid);
            return client.createClient(data.uuid, undefined, role, port, address);
        }

        return client.getByPortAddress(port, address, role);
    }

    server.bind(port);
}

module.exports = UDP;