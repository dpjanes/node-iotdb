/*
 *  drivers/smartthings.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-26
 *
 *  Connect to SmartThings
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
var SmartThings = require('./libs/smartthingslib').SmartThings;
var mqtt = require('mqtt');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'SmartThingsDriver',
});

var queue = new FIFOQueue("SmartThingsDriver");
var st = null;

/**
 */
var SmartThingsDriver = function (paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: "iot-driver:smartthings",
        initd: {},
        metad: {}
    });

    self.verbose = paramd.verbose;
    self.driver = _.expand(paramd.driver);

    // smartthings values, setup in setup
    self.id = null;
    self.type = null;
    self._init(paramd.initd);

    self.metad = {};
    if (paramd && paramd.metad) {
        self.metad = _.extend(paramd.metad);
    }
    self.metad["schema:manufacturer"] = "http://www.smartthings.com/";

    return self;
};

SmartThingsDriver.prototype = new driver.Driver();

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
SmartThingsDriver.prototype._init = function (initd) {
    var self = this;

    if (!initd) {
        return;
    }
    if (initd.type) {
        self.type = initd.type;
    }
    if (initd.id) {
        self.id = initd.id;
    }

    self.mqtt_init(initd);
};

/**
 *  See {@link Driver#register Driver.register}
 */
SmartThingsDriver.prototype.register = function (iot) {
    var self = this;

    driver.Driver.prototype.register.call(self, iot);

    if (st === null) {
        st = new SmartThings();

        var oauthd = iot.cfg_get_oauthd("https://graph.api.smartthings.com/", null);
        if (oauthd === null) {
            console.log("############################## ");
            console.log("# SmartThingsDriver.register: SmartThings not configured");
            console.log("# (instructions coming)");
            console.log("############################## ");

            self.report_issue({
                section: "drivers",
                name: "smartthings",
                message: "not configured (instructions coming)"
            });
            return;
        }

        st.load_settings(oauthd);
        st.request_endpoint();
    }
};

/**
 *  See {@link Driver#identity Driver.identity}
 */
SmartThingsDriver.prototype.identity = function (kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {};
        identityd["driver"] = self.driver;
        if (self.id) {
            identityd["id"] = self.id;
        }
        if (self.type) {
            identityd["type"] = self.type;
        }

        _.thing_id(identityd);

        self.__identityd = identityd;
    }

    return self.__identityd;
};

var __message_no_username = false;

/**
 *  See {@link Driver#setup Driver.setup}
 */
SmartThingsDriver.prototype.setup = function (paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    var iot = require('../iotdb').iot();
    if (!iot.username || (iot.username === "nobody")) {
        if (!__message_no_username) {
            __message_no_username = true;

            console.log("############################## ");
            console.log("# SmartThings.setup: iot.username is not assigned");
            console.log("# - cannot use SmartThings with MQTT until this is done");
            console.log("# - updates will not be received!");
            console.log("# - run this command");
            console.log("#");
            console.log("#   iotdb-control iotdb-oauth");
            console.log("#");
            console.log("############################## ");
        }

        return;
    }

    if (paramd.initd) {
        self._init(paramd.initd);
    }

    if (self.type && self.id) {
        self.mqtt_topic = "u/" + iot.username + "/st/" + self.type + "/" + self.id;
        self.mqtt_subscribe();
    }

    return self;
};

/**
 *  See {@link Driver#handle_mqtt_message Driver.handle_mqtt_message}
 */
SmartThingsDriver.prototype.handle_mqtt_message = function (in_topic, in_message) {
    var self = this;

    if (in_topic.substring(0, self.mqtt_topic.length) !== self.mqtt_topic) {
        return;
    }

    try {
        var in_messaged = JSON.parse(in_message);
        delete in_messaged['timestamp'];
        self.pulled(in_messaged);
    } catch (x) {
        // console.log("# SmartThingsDriver.handle_mqtt_message: MQTT receive: exception ignored", x, "\n ", x.stack)
        logger.error(x, {
            method: "handle_mqtt_message",
            in_topic: in_topic,
            in_message: in_message
        }, "exception processing MQTT message");
    }

    // console.log("- SmartThingsDriver.handle_mqtt_message: MQTT receive:", in_topic, in_message)
    logger.info({
        method: "handle_mqtt_message",
        in_topic: in_topic,
        in_message: in_message
    }, "MQTT receive");
};

/**
 *  See {@link Driver#discover Driver.discover}
 */
SmartThingsDriver.prototype.discover = function (paramd, discover_callback) {
    var self = this;

    st.on("devices", function (device_type, devices) {
        for (var di in devices) {
            var device = devices[di];
            var driver = new SmartThingsDriver({
                initd: {
                    type: device.type,
                    id: device.id,
                },
                metad: {
                    "iot:name": device.label,
                    "iot:dsid": _.expand("iot-driver:smartthings/" + device.id)
                }
            });

            discover_callback(driver);
        }
    });

    if (!st.endpointd.url) {
        st.on("endpoint", function () {
            self._request_all_devices();
        });
    } else {
        self._request_all_devices();
    }
};

SmartThingsDriver.prototype._request_all_devices = function () {
    var dtypes = [
        "switch",
        "contact",
        "battery",
        "temperature",
        "threeAxis",
        "motion"
    ];

    for (var dti in dtypes) {
        var dtype = dtypes[dti];
        st.request_devices(dtype);
    }
};

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
SmartThingsDriver.prototype.push = function (paramd) {
    var self = this;

    logger.info({
        method: "push",
        unique_id: self.unique_id,
        driverd: paramd.driverd,
        initd: paramd.initd,
        smarthings_id: self.id,
        smarthings_type: self.type
    }, "called");

    st.device_request({
        id: self.id,
        type: self.type
    }, paramd.driverd);

    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
SmartThingsDriver.prototype.pull = function () {
    var self = this;

    logger.info({
        method: "pull",
        unique_id: self.unique_id
    }, "called");

    return self;
};

/**
 *  Request the Driver's metadata.
 *  <p>
 *  See {@link Driver#meta Driver.meta}
 */
SmartThingsDriver.prototype.driver_meta = function () {
    return this.metad;
};


/*
 *  API
 */
exports.Driver = SmartThingsDriver;
