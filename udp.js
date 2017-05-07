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
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

        let client = addClient(msg, rinfo.port, rinfo.address);
        broadcast(msg,client);
    });

    server.on('listening', () => {
        let address = server.address();
        console.log(`UDP server listening on port ${address.port}`);
    });

    function broadcast(message, client) {
        clients.forEach((curr, index) => {

            if (curr.compare(client))
                return;

            let socket = curr[role];

            server.send(message, socket.port, socket.address, (err) => {
                if (!err) {
                    return;
                }

                console.log(err);
                clients.splice(index, 1);
            });
        });
    }

    function addClient(msg, port, address) {
        let data;
        let new_client;

        try {
            data = JSON.parse(msg);
        } catch (err) {}

        if (data && data.uuid) {
            new_client = client.createClient(data.uuid, undefined, role, port, address);
        }

        return new_client;
    }

    server.bind(port);
}

module.exports = UDP;