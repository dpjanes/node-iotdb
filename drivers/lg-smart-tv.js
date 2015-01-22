/*
 *  drivers/lg-smart-tv.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-12-09
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

var _ = require("../helpers");
var driver = require('../driver');
var FIFOQueue = require('../queue').FIFOQueue;
var upnp = require('../upnp');

var LGClient = require('./libs/lg-client').LGClient;
var LG = require('./libs/lg-commands');

var queue = new FIFOQueue("LGSmartTVDriver");

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'LGSmartTVDriver',
});

/**
 */
var LGSmartTVDriver = function (paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: "iot-driver:lg/smart-tv",
        initd: {},
        metad: {}
    });

    if (paramd.upnp_device !== undefined) {
        self.upnp_device = paramd.upnp_device;
        self.iri = "http://" + self.upnp_device.host + ":" + self.upnp_device.port;
        self.host = self.upnp_device.host;
        self.uuid = self.upnp_device.uuid;
    }

    self.verbose = paramd.verbose;
    self.driver = _.ld.expand(paramd.driver);

    self.metad = {};
    if (paramd && paramd.metad) {
        self.metad = _.extend(paramd.metad);
    }
    self.metad[_.ld.expand("schema:manufacturer")] = "";
    self.metad[_.ld.expand("schema:model")] = "";

    return self;
};

LGSmartTVDriver.prototype = new driver.Driver();

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
LGSmartTVDriver.prototype._init = function (initd) {
    var self = this;

    if (!initd) {
        return;
    }
};

/**
 *  Request the Driver's metadata.
 *  <p>
 *  See {@link Driver#meta Driver.meta}
 */
LGSmartTVDriver.prototype.driver_meta = function () {
    return this.metad;
};

/**
 *  See {@link Driver#identity Driver.identity}
 */
LGSmartTVDriver.prototype.identity = function (kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {};
        identityd["driver"] = self.driver;
        identityd["uuid"] = self.uuid;

        _.thing_id(identityd);

        self.__identityd = identityd;
    }

    return self.__identityd;
};

/**
 *  See {@link Driver#setup Driver.setup}
 */
LGSmartTVDriver.prototype.setup = function (paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd);

    return self;
};

/*
 *  See {@link Driver#discover Driver.discover}
 */
LGSmartTVDriver.prototype.discover = function (paramd, discover_callback) {
    // discover_callback(new LGSmartTVDriver());
    var self = this;

    var cp = upnp.control_point();
    cp.on("device", function (upnp_device) {
        self._foundDevice(discover_callback, upnp_device);
    });
    cp.search();
};

var __message_configure = false;

/**
 *  This does the work of creating a new device and calling the callback
 *  (which is usally IOT)
 */
LGSmartTVDriver.prototype._foundDevice = function (discover_callback, upnp_device) {
    var self = this;

    logger.debug({
        method: "_foundDevice",
        device: upnp_device // .deviceType
    }, "found UPnP device");

    var matchd = {
        deviceType: 'urn:schemas-upnp-org:device:Basic:1',
        friendlyName: "LG Smart+ TV",
        // "modelNumber": "55LB6300-UQ",
    };
    if (!(_.d_contains_d(upnp_device, matchd))) {
        return;
    }

    logger.info({
        method: "_foundDevice",
        device: upnp_device.deviceType
    }, "found LG Smart TV");

    discover_callback(new LGSmartTVDriver({
        upnp_device: upnp_device,
    }));
};

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
LGSmartTVDriver.prototype.push = function (paramd) {
    var self = this;

    logger.info({
        method: "push",
        unique_id: self.unique_id,
        driverd: paramd.driverd
    }, "called");

    var client = new LGClient();
    client.connect(self.host, function (error) {
        if (error) {
            logger.info({
                method: "push/connect(error)",
                unique_id: self.unique_id,
                error: error,
            }, "called");
            return;
        }

        if (paramd.driverd.launch !== undefined) {
            LG.launch(client, paramd.driverd.launch, function (error, d) {
                logger.info({
                    method: "push/connect/launch",
                    unique_id: self.unique_id,
                    launch: paramd.driverd.launch,
                }, "called");
            });
        }

        if (paramd.driverd.channel !== undefined) {
            LG.setChannel(client, paramd.driverd.channel, function (error, d) {
                logger.info({
                    method: "push/connect/setChannel",
                    unique_id: self.unique_id,
                    channel: paramd.driverd.channel,
                }, "called");
            });
        }

        if (paramd.driverd.volume !== undefined) {
            LG.setVolume(client, paramd.driverd.volume, function (error, d) {
                logger.info({
                    method: "push/connect/setVolume",
                    unique_id: self.unique_id,
                    volume: paramd.driverd.volume,
                }, "called");
            });
        }

        if (paramd.driverd.mute !== undefined) {
            LG.setMute(client, paramd.driverd.mute, function (error, d) {
                logger.info({
                    method: "push/connect/setMute",
                    unique_id: self.unique_id,
                    mute: paramd.driverd.mute,
                }, "called");
            });
        }
    });

    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
LGSmartTVDriver.prototype.pull = function () {
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
exports.Driver = LGSmartTVDriver;
