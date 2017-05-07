'use strict';

const _ = require('lodash');

let clients = [];

function Client(uuid, name) {
    this.uuid = uuid;
    this.name = name;

    this.compare = (other) => {
        return this.uuid === other.uuid;
    };

    this.addPort = function(role, port, address) {
        if (role === 'tcp')
            this.tcp = port;
        else {
            this[role] = {
                port: port,
                address: address
            };
        }
    }
}

function getBySocket(socket) {
    return _.find(clients, (curr) => {
        return curr.tcp === socket;
    });
}

module.exports.clients = clients;

module.exports.createClient = function(uuid, name, role, port, address) {
    let client = _.find(clients, (curr) => {
        return curr.uuid === uuid;
    });

    if (client) {
        client.addPort(role, port, address);

        if (name)
            client.name = name;

        return client;
    }


    console.log("new client: " + uuid);
    client = new Client(uuid, name);
    client.addPort(role, port, address);

    clients.push(client);

    console.log("++ # of clients: " + clients.length);

    return client;
};

module.exports.removeClient = function(socket) {
    let client = getBySocket(socket);

    if (client) {
        console.log("Client disconnecting: " + client.uuid);
        clients.splice(client, 1);
    }

    console.log("-- # of clients: " + clients.length);
};

module.exports.getBySocket = getBySocket;
