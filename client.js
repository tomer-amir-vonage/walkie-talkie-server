'use strict';

const _ = require('lodash');

let clients = [];
let broadcasting;

function Client(uuid, name) {
    this.uuid = uuid;
    this.name = name;

    this.compare = (other) => {
        return other && this.uuid === other.uuid;
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
    };

    this.isBroadcasting = function() {
        return this.compare(broadcasting);
    };
}

function getBySocket(socket) {
    let res = _.find(clients, (curr) => {
        return curr.tcp === socket;
    });

    return res;
}

function getByPortAddress(port, address, role) {
    return _.find(clients, (curr) => {
        let connection = curr[role];
        return connection && connection.port === port && connection.address === address;
    });
}

function createClient(uuid, name, role, port, address) {
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
}

function removeClient(client) {
    if (client) {
        console.log("Client disconnecting: " + client.uuid);
        clients.splice(clients.indexOf(client), 1);
    } else {
        console.error('client is undefined');
    }

    console.log("-- # of clients: " + clients.length);
}

function setBroadcasting(client) {
    if (broadcasting)
        return false;

    broadcasting = client;
    console.log('set broadcasting: ' + client.name);

    return true;
}

function releaseBroadcast(client) {
    if (!client.compare(broadcasting)) {
        return false;
    }

    broadcasting = undefined;

    console.log('release broadcasting: ' + client.name);

    return true;
}

function getBroadcasting() {
    return broadcasting;
}

module.exports.clients = clients;

module.exports.createClient = createClient;

module.exports.removeClient = removeClient;

module.exports.getBySocket = getBySocket;

module.exports.getByPortAddress = getByPortAddress;

module.exports.setBroadcasting = setBroadcasting;

module.exports.releaseBroadcast = releaseBroadcast ;

module.exports.getBroadcasting = getBroadcasting;
