/*
 *  drivers/ble.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-01-05
 *
 *  Connect to Bluetooth Low Energy (AKA Bluetooth Smart) devices.
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
var noble = require('noble');
var util = require('util');
var events = require('events');

var n = null;

/**
 */
var BLEDriver = function(paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        p: null,
        s: null
    })

    self.verbose = paramd.verbose;
    self.p = paramd.p
    self.s = paramd.s
    self.cd = null

    self.subscribes = null
    self.to_thing_callback = null

    /* */
    self.queue = new FIFOQueue("BLEDriver");
    self.queue.pause()

    events.EventEmitter.call(self);

    /* */
    if (self.s) {
        self.s.discoverCharacteristics(null, function(err, cs) {
            self.cd = {}
            if (cs) {
                for (var ci in cs) {
                    var c = cs[ci]
                    self.cd[c.uuid] = c
                }
            }

            console.log("- BLEDriver: characteristics discovered")

            if (self.subscribes) {
                for (var si in self.subscribes) {
                    var subscribe_uuid = self.subscribes[si];
                    var c = self.cd[subscribe_uuid]
                    if (c) {
                        console.log("- BLEDriver:", "subscribe", subscribe_uuid)
                        c.on('read', function(data, isNotification) {
                            console.log("- BLEDriver:", "notified", data)
                            if (self.to_thing_callback) {
                                var driverd = {};
                                driverd[subscribe_uuid] = data;

                                self.to_thing_callback(driverd)

                                console.log("- UPnPDriver.setup: stateChange", driverd);
                            }
                        })
                        c.notify(true, function(err) {
                            console.log("- BLEDriver:", "notify", err)
                        })
                    }
                }
            }

            self.queue.resume()
        })
    }

    return self;
}
util.inherits(BLEDriver, events.EventEmitter);

BLEDriver.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  See {@link Driver#identity Driver.identity}
 */
BLEDriver.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver"] = _.expand("iot-driver:ble")
        if (self.p && self.p.advertisement) {
            identityd["localName"] = self.p.advertisement.localName;
        }
        if (self.s && self.s.uuid) {
            identityd["serviceUuid"] = self.s.uuid;
        }

        _.thing_id(identityd);

        if (kitchen_sink && (self.p !== undefined)) {
            if (self.p.advertisement.serviceData !== undefined) {
                identityd["serviceData"] = self.p.advertisement.serviceData;
            }
            if (self.p.advertisement.manufacturerData !== undefined) {
                identityd["manufacturerData"] = self.p.advertisement.manufacturerData;
            }
            if (self.p.rssi !== undefined) {
                identityd["rssi"] = self.p.rssi;
            }
            if (self.p.uuid !== undefined) {
                identityd["uuid"] = self.p.uuid;
            }
        }
        
        self.__identityd = identityd;
    }

    return self.__identityd;
}

/**
 *  See {@link Driver#setup Driver.setup}
 */
BLEDriver.prototype.setup = function(paramd, to_thing_callback) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self.subscribes = paramd.setupd.subscribes;
    self.to_thing_callback = to_thing_callback

    return self;
}

/**
 *  See {@link Driver#discover Driver.discover}
 */
BLEDriver.prototype.discover = function(paramd, discover_callback) {
    var self = this;

    // Only do scanning once
    if (n !== null) {
        return;
    }
    
    n = noble;
    n.on('discover', function(p) {
        console.log("- p-discover", 
            "uuid", p.uuid, 
            "localName", p.advertisement.localName, 
            "advertisement", p.advertisement.manufacturerData ? p.advertisement.manufacturerData.toString('hex') : null
        );

        p.on('connect', function() {
            console.log("- p-connect", "uuid", p.uuid);
            p.discoverServices();
        });
        p.on('servicesDiscover', function(ss) {
            console.log("- p-serviceDiscover", "p-uuid", p.uuid, "#ss", ss.length);
            ss.map(function(s) {
                console.log("- p-serviceDiscover", "p-uuid", p.uuid, "s-uuid", s.uuid);
                discover_callback(new BLEDriver({
                    verbose: self.verbose,
                    p: p,
                    s: s
                }))
            });
        });
        console.log("- BLEDriver.discover_nearby", "calling p.connect", "p-uuid", p.uuid);
        p.connect();
    });

    console.log("- BLEDriver.discover_nearby", "n.startScanning");
    n.startScanning();
}

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
BLEDriver.prototype.push = function(paramd) {
    var self = this;

    var qitem = {
        run: function() {
            console.log("- BLEDriver.push", paramd.driverd, paramd.initd)
            for (var uuid in paramd.driverd) {
                var c = self.cd[uuid]
                if (!c) {
                    console.log("- BLEDriver.push: uuid not found", uuid)
                    continue
                }

                var value = paramd.driverd[uuid]
                if (value) {
                    c.write(new Buffer(value))
                }
            }

            self.queue.finished(qitem);
        }
    }
    self.queue.add(qitem);

    return self;
}

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
BLEDriver.prototype.pull = function() {
    var self = this;

    return self;
}


/*
 *  API
 */
exports.Driver = BLEDriver
