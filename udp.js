'use strict';

const _ = require('lodash');
const Client = require('./client')

function UDP(port) {

    const dgram = require('dgram');
    const server = dgram.createSocket('udp4');

    let clients = [];

    server.on('error', (err) => {
        console.log(`server error:\n${err.stack}`);
        server.close();
    });

    server.on('message', (msg, rinfo) => {
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);

        let client = addClient(rinfo.port, rinfo.address);
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

            server.send(message, curr.port, curr.address, (err) => {
                if (!err) {
                    return;
                }

                console.log(err);
                clients.splice(index, 1);
            });
        });
    }

    function addClient(port, address) {
        let client = new Client(port, address);

        if (_.find(clients, (curr) => curr.compare(client))) {
            return client;
        }

        clients.push(client);

        return client;
    }

    server.bind(port);
}

module.exports = UDP;