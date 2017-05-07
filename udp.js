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

        let curr_client = addClient(msg, rinfo.port, rinfo.address);

        // if (curr_client.isBroadcasting())
            broadcast(msg, curr_client);
    });

    server.on('listening', () => {
        let address = server.address();
        console.log(`UDP server listening on port ${address.port}`);
    });

    function broadcast(message, curr_client) {
        clients.forEach((curr, index) => {

            if (curr.compare(curr_client))
                return;

            let socket = curr[role];

            // Check if client has finished connecting
            if (!role)
                return;

            server.send(message, socket.port, socket.address, (err) => {
                if (!err) {
                    return;
                }

                console.error("UDP ERROR: ", err);
                clients.splice(index, 1);
            });
        });
    }

    function addClient(msg, port, address) {
        let data;

        try {
            data = JSON.parse(msg);
        } catch (err) {}

        if (data && data.uuid) {
            console.log(role + " data received for client: " + data.uuid);
            return client.createClient(data.uuid, undefined, role, port, address);
        }

        return client.getByPortAddress(port, address, role);
    }

    server.bind(port);
}

module.exports = UDP;