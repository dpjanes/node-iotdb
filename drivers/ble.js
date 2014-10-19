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

"use strict";

var _ = require("../helpers");
var driver = require('../driver');
var FIFOQueue = require('../queue').FIFOQueue;
var noble = require('noble');
var util = require('util');
var fs = require('fs');
var events = require('events');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'BLEDriver',
});

var n = null;

/**
 */
var BLEDriver = function (paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        p: null,
        s: null
    });

    self.verbose = paramd.verbose;
    self.p = paramd.p;
    self.s = paramd.s;
    self.cd = null;

    self.driver = _.expand("iot-driver:ble");
    self.subscribes = null;

    /* */
    self.queue = new FIFOQueue("BLEDriver");
    self.queue.pause();

    events.EventEmitter.call(self);

    /* */
    if (self.p) {
        self.p.on('disconnect', function () {
            if (!self.p) {
                return;
            }

            logger.info({
                method: "/on(disconnect)"
            }, "disconnected");
            self.disconnect();
        });
    }

    /* */
    if (self.s) {
        self.s.discoverCharacteristics(null, function (err, cs) {
            if (!self.p || !self.s) {
                return;
            }

            self.cd = {};
            if (cs) {
                for (var ci in cs) {
                    var ca = cs[ci];
                    self.cd[ca.uuid] = ca;
                }
            }

            // console.log("- BLEDriver", "characteristics discovered")
            logger.info({
                method: "/discoverCharacteristics"
            }, "characteristics discovered");
            self.emit("found-characteristics");

            if (self.subscribes) {
                for (var si in self.subscribes) {
                    var subscribe_uuid = self.subscribes[si];
                    var c = self.cd[subscribe_uuid];
                    if (c) {
                        // console.log("- BLEDriver", "subscribe", subscribe_uuid)
                        logger.info({
                            method: "/discoverCharacteristics",
                            subscribe_uuid: subscribe_uuid
                        }, "subscribe");
                        c.on('notify', function (data, isNotification) {
                            // console.log("- BLEDriver/on(notify)", "notified", data);
                            logger.info({
                                method: "/on(notify)",
                                data: data
                            }, "called");
                        });
                        c.on('read', function (data, isNotification) {
                            var driverd = {};
                            driverd[subscribe_uuid] = Array.prototype.slice.call(data, 0);

                            self.pulled(driverd);

                            // console.log("- BLEDriver/on(read)", "read", driverd) // , isNotification, c.notify);
                            logger.info({
                                method: "/on(read)",
                                driverd: driverd
                            }, "called");
                        });
                        c.notify(true, function (err) {
                            /*
                            if (err) {
                                console.log("- BLEDriver/notify", "err", err)
                            } else {
                                console.log("- BLEDriver/notify", "notify set up correctly")
                            }
                            */
                            logger.info({
                                method: "/notify",
                                err: err
                            }, "called");
                        });
                    }
                }
            }

            self.queue.resume();
        });
    }

    return self;
};
util.inherits(BLEDriver, events.EventEmitter);

BLEDriver.prototype = new driver.Driver();

/* --- class methods --- */

/**
 *  See {@link Driver#identity Driver.identity}
 */
BLEDriver.prototype.identity = function (kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {};
        identityd["driver"] = self.driver;

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
};

/**
 */
BLEDriver.prototype.configure = function (ad, callback) {
    var self = this;

    if (ad['make-models']) {
        self._discover_drivers();
    } else {
        console.log("# BLEDriver.configure: try adding '--make-models'");
        process.exit(1);
    }
};

/**
 *  Handle disconnects
 */
BLEDriver.prototype.disconnect = function () {
    var self = this;

    // console.log("- BLEDriver.disconnect", "uuid", self.s ? self.s.uuid : null)
    logger.info({
        method: "disconnect",
        uuid: self.s ? self.s.uuid : null
    }, "called");
    driver.Driver.prototype.disconnect.call(self);

    self.p = null;
    self.s = null;
};

/**
 *  Handle shutdown
 */
BLEDriver.prototype.shutdown = function () {
    var self = this;

    if (self.p) {
        self.p.disconnect();
        self.p.removeAllListeners();
        self.p = null;
        self.s = null;
    }

    noble.stopScanning();

    return 2000;
};

/**
 */
BLEDriver.prototype._discover_drivers = function (driver) {
    var self = this;

    // Folder for discovered devices
    var discover_folder = ".ble";
    try {
        fs.mkdirSync(discover_folder);
    } catch (err) {}

    self.discover({}, function (driver) {
        self._discover_driver(driver, {
            discover_folder: discover_folder
        });
    });
};

/**
 */
BLEDriver.prototype._discover_driver = function (driver, paramd) {
    var self = this;

    paramd.dirname = paramd.discover_folder + "/" + driver.p.uuid;
    try {
        fs.mkdirSync(paramd.dirname);
    } catch (err) {}

    paramd.filename = paramd.discover_folder + "/" + driver.p.uuid + "/" + driver.s.uuid;

    driver.on("found-characteristics", function () {
        self._write_driver(driver, paramd);
    });
};

BLEDriver.prototype._write_driver = function (driver, paramd) {
    var iotdb = require('../iotdb');
    var attr;
    var uuid;

    var lines = [];

    console.log(util.inspect(driver, true, 10));

    lines.push(util.format("/*"));
    lines.push(util.format(" * Note: this was automatically created"));
    lines.push(util.format(" * and really should be used as a reference"));
    lines.push(util.format(" * than anything else. The attribute 'a*' codes"));
    lines.push(util.format(" * should be renamed to something more useful at"));
    lines.push(util.format(" * least but make sure you rename the corresponding"));
    lines.push(util.format(" * values in driver_in/driver_out"));
    lines.push(util.format(" *"));
    lines.push(util.format(" * Peripheral UUID: %s", driver.p.uuid));

    if (driver.p.advertisement && driver.p.advertisement.localName) {
        lines.push(util.format(" * Advertisement Name: %s", driver.p.advertisement.localName));
    }

    lines.push(util.format(" * Service UUID: %s", driver.s.uuid));
    if (driver.s.name) {
        lines.push(util.format(" * Service Name: %s", driver.s.name));
    }
    if (driver.s.type) {
        lines.push(util.format(" * Service Type: %s", driver.s.type));
    }
    lines.push(util.format(" */"));
    lines.push(util.format(""));
    lines.push(util.format("'use strict'"));
    lines.push(util.format("var iotdb = require('iotdb')"));

    lines.push(util.format("exports.Model = iotdb.make_model('BLE_%s')", driver.s.uuid));
    lines.push(util.format("    .driver_identity({"));
    lines.push(util.format("        driver_iri: 'iot-driver:ble',"));
    if (driver.p.advertisement && driver.p.advertisement.localName) {
        lines.push(util.format("        localName: '%s',", driver.p.advertisement.localName));
    }
    lines.push(util.format("        serviceUuid: '%s'", driver.s.uuid));
    lines.push(util.format("    })"));

    var code_mapping = [];
    var notifys = [];
    var reads = [];
    var writes = [];

    var count = 0;
    for (var cuuid in driver.cd) {
        count += 1;
        var c = driver.cd[cuuid];

        lines.push(util.format("    .attribute("));
        lines.push(util.format("        iotdb.make_integer(':value')"));
        lines.push(util.format("            .code('a%d')", count));
        code_mapping.push(['a' + count, c.uuid]);
        if (c.name) {
            lines.push(util.format("            .name('%s')", c.name));
        } else {
            lines.push(util.format("            .name('%s')", c.uuid));
        }
        if (c.type) {
            lines.push(util.format("            .description('BLE type %s')", c.type));
        }

        var is_read = false;
        var is_write = false;
        var is_notify = false;
        for (var pi in c.properties) {
            var property = c.properties[pi];
            if (property === "read") {
                is_read = true;
            } else if (property === "write") {
                is_write = true;
            } else if (property === "writeWithoutResponse") {
                is_write = true;
            } else if (property === "indicate") {
                is_notify = true;
            } else if (property === "notify") {
                is_notify = true;
            } else {
                // console.log("UNKNOWN", property)
                logger.error({
                    method: "_write_driver",
                    property: property,
                    cause: "probably not serious, but could be revisited in BLEDriver"
                }, "unknown property");
            }
        }

        if (is_read) {
            lines.push(util.format("            .reading()"));
        }
        if (is_write) {
            lines.push(util.format("            .control()"));
        }
        if (is_notify) {
            notifys.push(c.uuid);
        }

        lines.push(util.format("    )"));
    }

    // notifications
    lines.push(util.format("    .driver_setup(function(paramd) {"));
    lines.push(util.format("        paramd.initd.subscribes = ["));
    for (var ni in notifys) {
        lines.push(util.format("           '%s'%s", notifys[ni], ni < (notifys.length - 1) ? "," : ""));
    }
    lines.push("        ]");
    lines.push(util.format("    })"));

    // values going to the BLE thing
    lines.push(util.format("    .driver_out(function(paramd) {"));
    for (var wi in writes) {
        attr = writes[wi][0];
        uuid = writes[wi][1];
        lines.push(util.format("        if (paramd.thingd['%s'] !== undefined) {", attr));
        lines.push(util.format("        }"));
    }
    lines.push(util.format("    })"));

    // values from the BLE thing
    lines.push(util.format("    .driver_in(function(paramd) {"));
    for (var ri in reads) {
        attr = reads[ri][0];
        uuid = reads[ri][1];
        lines.push(util.format("        if (paramd.driverd['%s'] !== undefined) {", uuid));
        lines.push(util.format("            paramd.thingd['%s'] = paramd.driverd['%s'].readUInt8()", attr, uuid));
        lines.push(util.format("        }"));
    }
    lines.push(util.format("    })"));

    lines.push(util.format("    .make();"));

    console.log("- BLEDriver._write_driver", "wrote", paramd.filename);
    fs.writeFileSync(paramd.filename, lines.join("\n") + "\n");
};

/**
 *  See {@link Driver#setup Driver.setup}
 */
BLEDriver.prototype.setup = function (paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    if (paramd.initd) {
        self.subscribes = paramd.initd.subscribes;
        self.poll_init(paramd.initd);
    }

    if (self.p) {
        self.p.__driver_reconnectable = true;
    }


    return self;
};

/**
 *  See {@link Driver#reachable}
 */
BLEDriver.prototype.reachable = function () {
    var self = this;

    if (!self.p) {
        return false;
    }

    return true;
};

/**
 *  Request the Driver's metadata.
 *  <p>
 *  See {@link Driver#meta Driver.meta}
 */
BLEDriver.prototype.driver_meta = function () {
    var self = this;

    if (!self.p) {
        return;
    }

    var metad = {};
    metad["iot:dsid"] = _.expand("iot-driver:ble/" + self.p.uuid);

    if (self.p.advertisement && self.p.advertisement.localName) {
        metad["iot:name"] = self.p.advertisement.localName;
    }

    return metad;
};

var p_active = {};

/**
 *  See {@link Driver#discover Driver.discover}
 */
BLEDriver.prototype.discover = function (paramd, discover_callback) {
    var self = this;

    // Only do scanning once
    if (n !== null) {
        return;
    }

    n = noble;
    n.on('discover', function (p) {
        if (p.__driver_connected) {
            return;
        }

        /*
        console.log("- BLEDriver.discover", "p-discover", 
            "\n  uuid", p.uuid, 
            "\n  localName", p.advertisement.localName, 
            "\n  advertisement", p.advertisement.manufacturerData ? p.advertisement.manufacturerData.toString('hex') : null,
            "\n  connected", p.__driver_connected ? true : false,
            "\n  discovered", p.__driver_discovered ? true : false
        );
        */
        logger.info({
            method: "discover/on(discover)",
            "p-uuid": p.uuid,
            "localName": p.advertisement.localName,
            "advertisement": p.advertisement.manufacturerData ? p.advertisement.manufacturerData.toString('hex') : null,
            "connected": p.__driver_connected ? true : false,
            "discovered": p.__driver_discovered ? true : false
        }, "p.discover");

        if (!p.__driver_discovered) {
            p.__driver_discovered = true;
        }

        p.on('connect', function () {
            if (p.__driver_connected) {
                return;
            }
            // console.log("- BLEDriver.discover", "p-connect", "uuid", p.uuid);
            logger.info({
                method: "discover/on(connect)",
                "p-uuid": p.uuid,
            }, "p.connect");

            p.__driver_connected = true;
            p.__driver_services = false;
            p.discoverServices();
        });
        p.on('disconnect', function () {
            if (!p.__driver_connected) {
                return;
            }

            // console.log("- BLEDriver.discover", "p-disconnect", "uuid", p.uuid);
            logger.info({
                method: "discover/on(disconnect)",
                "p-uuid": p.uuid,
            }, "p.disconnect");
            p.__driver_connected = false;
        });
        p.on('servicesDiscover', function (ss) {
            if (!p.__driver_connected) {
                return;
            }
            if (p.__driver_services) {
                return;
            }
            p.__driver_services = true;

            // console.log("- BLEDriver.discover", "p-serviceDiscover", "p-uuid", p.uuid, "#ss", ss.length);
            logger.info({
                method: "discover/on(servicesDiscover)",
                "p-uuid": p.uuid,
                "#ss": ss.length
            }, "p.serviceDiscover");
            if (ss.length === 0) {
                p.disconnect();
                return;
            }

            ss.map(function (s) {
                // console.log("- BLEDriver.discover", "p-serviceDiscover", "p-uuid", p.uuid, "s-uuid", s.uuid);
                logger.info({
                    method: "discover/on(servicesDiscover)",
                    "p-uuid": p.uuid,
                    "s-uuid": s.uuid
                }, "p.serviceDiscover");

                discover_callback(new BLEDriver({
                    verbose: self.verbose,
                    p: p,
                    s: s
                }));
            });
        });

        p.connect();
    });

    logger.info({
        method: "discover"
    }, "n.startScanning");
    // console.log("- BLEDriver.discover", "n.startScanning");
    n.startScanning([], true);
};

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
BLEDriver.prototype.push = function (paramd) {
    var self = this;
    if (!self.p) {
        return;
    }

    var qitem = {
        run: function () {
            logger.info({
                method: "push/qitem(run)",
                unique_id: self.unique_id,
                initd: paramd.initd,
                driverd: paramd.driverd
            }, "called");
            for (var uuid in paramd.driverd) {
                var c = self.cd[uuid];
                if (!c) {
                    // console.log("- BLEDriver.push", "uuid not found", uuid)
                    logger.error({
                        method: "push",
                        uuid: uuid
                    }, "uuid not found");
                    continue;
                }

                var value = paramd.driverd[uuid];
                if (value) {
                    if (Buffer.isBuffer(value)) {
                        c.write(value);
                    } else {
                        c.write(new Buffer(value));
                    }
                }
            }

            self.queue.finished(qitem);
        }
    };
    self.queue.add(qitem);

    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
BLEDriver.prototype.pull = function () {
    var self = this;

    if (!self.p) {
        return;
    }

    /*
     *  Some BLE devices (Bean Temperature) will do
     *  pulls that are actually pushes for requests.
     *  This gets called as part of the process
     */
    self.poll_reschedule();

    return self;
};


/*
 *  API
 */
exports.Driver = BLEDriver;
