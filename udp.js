'use strict';

function Client(port, address) {
    this.port = port;
    this.address = address;
}

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
        console.log(`server listening ${address.address}:${address.port}`);
    });

    function broadcast(message, client) {
        clients.forEach((curr, index) => {

            if (curr.address === client.address && curr.port === client.port)
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
        clients.push(client);

        return client;
    }

    server.bind(port);
}

module.exports = UDP;