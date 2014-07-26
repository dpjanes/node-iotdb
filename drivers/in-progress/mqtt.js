/*
 *  drivers/mqtt.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-03-20
 *
 *  Receive MQTT messages
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

"use strict"

var _ = require("../helpers");
var driver = require('../driver')
var FIFOQueue = require('../queue').FIFOQueue
var unirest = require('unirest');
var mqtt = require('mqtt');

var queue = new FIFOQueue("MQTT");

/**
 */
var MQTT = function(paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: _.expand("iot-driver:mqtt"),
        initd: {},

        discover_callback: null,
        device_index: -1
    })

    self.driver = paramd.driver

    /*
     *  Will create more MQTT drivers / things
     *  based on the prototype topic
     */
    self.deviced = {}
    self.device_index = paramd.device_index
    self.discover_callback = paramd.discover_callback

    self._init(paramd.initd)

    return self;
}

MQTT.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
MQTT.prototype._init = function(initd) {
    var self = this;

    if (!initd) {
        return
    }

    self.mqtt_init(initd)
}

/**
 *  See {@link Driver#identity Driver.identity}
 */
MQTT.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver"] = self.driver

        if (self.mqtt_host) {
            identityd["mqtt_host"] = self.mqtt_host
        }
        if (self.mqtt_port) {
            identityd["mqtt_port"] = self.mqtt_port
        }
        if (self.mqtt_topic) {
            identityd["mqtt_topic"] = self.mqtt_topic
        }
        if (self.mqtt_json) {
            identityd["mqtt_json"] = self.mqtt_json ? 1 : 0
        }
        if (self.mqtt_device) {
            identityd["mqtt_device"] = self.mqtt_device
        }

        _.thing_id(identityd);
        
        self.__identityd = identityd;
    }

    return self.__identityd;
}

/**
 *  See {@link Driver#setup Driver.setup}
 */
MQTT.prototype.setup = function(paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd)

    self.mqtt_subscribe()

    return self;
}

/**
 *  See {@link Driver#discover Driver.discover}
 */
MQTT.prototype.discover = function(paramd, discover_callback) {
    if (!paramd.initd) {
        console.log("# MQTTDriver.discover: no nearby discovery (not a problem)")
        return
    }

    var mqtt_topic = paramd.initd.mqtt_topic;
    var parts = mqtt_topic.split("/")
    var device_index = -1;

    for (var pi in parts) {
        var part = parts[pi]
        if (part !== "+device") {
            continue;
        }

        device_index = pi;
        break
    }

    if (device_index > -1) {
        var initd = _.deepCopy(paramd.initd)

        parts[device_index] = "+"
        initd.mqtt_topic = parts.join("/")

        var ndriver = new MQTT({
            initd: initd,
            discover_callback: discover_callback,
            device_index: device_index
        })
        ndriver.mqtt_subscribe()
    } else {
        discover_callback(new MQTT());
    }

}

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
MQTT.prototype.push = function(paramd) {
    var self = this;

    console.log("- MQTT.push", 
        "\n  iri", self.iri, 
        "\n  initd", paramd.initd)

    return self;
}

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
MQTT.prototype.pull = function() {
    var self = this;

    console.log("- MQTT.pull", 
        "\n  iri", self.iri, 
        "\n  initd", paramd.initd
    )

    return self;
}

/**
 *  See {@link Driver.on_mqtt_message}
 */
MQTT.prototype.on_mqtt_message = function(in_topic, in_message) {
    var self = this;

    if (self.device_index > -1) {
        var parts = in_topic.split("/")
        if (parts.length <= self.device_index) {
            return
        }

        var mqtt_device = parts[self.device_index]
        if (self.deviced[mqtt_device] !== undefined) {
            return
        }

        console.log("- MQTT.on_mqtt_message: new mqtt_device:", mqtt_device, in_topic)

        // we've found a new device at this point
        parts = self.mqtt_topic.split("/")
        parts[self.device_index] = mqtt_device

        var ndriver = new MQTT({
            initd: {
                mqtt_topic: parts.join("/"),
                mqtt_host: self.mqtt_host,
                mqtt_port: self.mqtt_port,
                mqtt_json: self.mqtt_json,
                mqtt_device: mqtt_device
            }
        })
        self.deviced[mqtt_device] = ndriver

        self.discover_callback(ndriver)
    } else {
        // console.log("- MQTT.on_mqtt_message", in_message)
        self.handle_mqtt_message(in_topic, in_message)
    }
}

/*
 *  API
 */
exports.Driver = MQTT
