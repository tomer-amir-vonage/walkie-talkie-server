'use strict';

function Client(port, address, name) {
    this.port       = port;
    this.address    = address;
    this.name       = name;

    this.compare = (other) => {
        return this.port === other.port && this.address === other.address;
    }
}

module.exports = Client;