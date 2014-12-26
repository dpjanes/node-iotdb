/*
 *  drivers/telnet.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-XX-XX
 *
 *  Connect to
 *
 *  Copyright [2013-2014] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var net = require('net');

var _ = require("../helpers");
var driver = require('../driver');
var FIFOQueue = require('../queue').FIFOQueue;

var queue = new FIFOQueue("TelnetDriver");

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'TelnetDriver',
});

/**
 */
var TelnetDriver = function (paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: "iot-driver:telnet",
        initd: {}
    });

    self.verbose = paramd.verbose;
    self.driver = _.expand(paramd.driver);

    self._init(paramd.initd);

    self.metad = {};
    if (paramd && paramd.metad) {
        self.metad = _.extend(paramd.metad);
    }
    self.metad[_.expand("schema:manufacturer")] = "";
    self.metad[_.expand("schema:model")] = "";

    return self;
};

TelnetDriver.prototype = new driver.Driver();

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
TelnetDriver.prototype._init = function (initd) {
    var self = this;

    if (!initd) {
        return;
    }
    if (initd.iri) {
        self.iri = initd.iri;
    }
    if (initd.host) {
        self.host = initd.host;
    }
};

/**
 *  Request the Driver's metadata.
 *  <p>
 *  See {@link Driver#meta Driver.meta}
 */
TelnetDriver.prototype.driver_meta = function () {
    return this.metad;
};

/**
 *  See {@link Driver#identity Driver.identity}
 */
TelnetDriver.prototype.identity = function (kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {};
        identityd["driver"] = self.driver;
        identityd["host"] = self.host;

        _.thing_id(identityd);

        self.__identityd = identityd;
    }

    return self.__identityd;
};

/**
 *  See {@link Driver#setup Driver.setup}
 */
TelnetDriver.prototype.setup = function (paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd);

    return self;
};

/*
 *  See {@link Driver#discover Driver.discover}
 */
TelnetDriver.prototype.discover = function (paramd, discover_callback) {
    if (paramd.initd.host) {
        discover_callback(new TelnetDriver({
            initd: paramd.initd
        }));
    }
};

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
TelnetDriver.prototype.push = function (paramd) {
    var self = this;

    logger.info({
        method: "push",
        unique_id: self.unique_id,
        initd: paramd.initd,
        driverd: paramd.driverd
    }, "called");

    if (paramd.driverd.commands) {
        var client = net.connect(23, self.host, function () {
            for (var ci in paramd.driverd.commands) {
                var command = paramd.driverd.commands[ci];
                if (command[0] === "send") {
                    logger.info({
                        method: "push/net.connect",
                        unique_id: self.unique_id,
                        send: command[1]
                    }, "send");

                    client.write(command[1]);
                }
            }
        });
        client.on('error', function (error) {
            logger.info({
                method: "push/net.connect",
                unique_id: self.unique_id,
                error: error,
            }, "error");
            
        });
        client.on('data', function (data) {
            console.log(data.toString());
            client.end();
        });
        client.on('end', function () {
            console.log('client disconnected');
        });

    }


    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
TelnetDriver.prototype.pull = function () {
    var self = this;

    logger.info({
        method: "pull",
        unique_id: self.unique_id
    }, "called");

    return self;
};


/*
 *  API
 */
exports.Driver = TelnetDriver;
