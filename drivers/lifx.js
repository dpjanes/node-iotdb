/*
 *  drivers/lifx.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-12-01
 *
 *  Connect to LIFX Bulb
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
var Color = require("../libs/color").Color;
var hc = require('./libs/hue-colors.js');
var driver = require('../driver');
var FIFOQueue = require('../queue').FIFOQueue;
var lifx = require('lifx');

var queue = new FIFOQueue("LIFXDriver");

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'LIFXtypeDriver',
});

/**
 */
var LIFXDriver = function (paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: "iot-driver:lifx",
        bulb: null,
        initd: {}
    });

    self.verbose = paramd.verbose;
    self.driver = _.expand(paramd.driver);
    self.bulb = paramd.bulb;
    // bulb looks like this:
    // {addr:pkt.preamble.bulbAddress, name:pkt.payload.bulbLabel};

    self._init(paramd.initd);

    self.metad = {};
    if (paramd && paramd.metad) {
        self.metad = _.extend(paramd.metad);
    }
    self.metad[_.expand("schema:manufacturer")] = "http://lifx.co/";
    if (self.bulb) {
        self.metad[_.expand("iot:name")] = self.bulb.name;
    }

    return self;
};

LIFXDriver.prototype = new driver.Driver();

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
LIFXDriver.prototype._init = function (initd) {
    var self = this;

    if (!initd) {
        return;
    }
    if (initd.iri) {
        self.iri = initd.iri;
    }
};

/**
 *  See {@link Driver#identity Driver.identity}
 */
LIFXDriver.prototype.identity = function (kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {};
        identityd["driver"] = self.driver;

        if (self.bulb) {
            identityd["ip-addr"] = self.bulb.addr;
        }

        _.thing_id(identityd);

        self.__identityd = identityd;
    }

    return self.__identityd;
};

/**
 *  Request the Driver's metadata.
 *  <p>
 *  See {@link Driver#meta Driver.meta}
 */
LIFXDriver.prototype.driver_meta = function () {
    return this.metad;
};

/**
 *  See {@link Driver#setup Driver.setup}
 */
LIFXDriver.prototype.setup = function (paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd);

    return self;
};

/*
 *  See {@link Driver#discover Driver.discover}
 */
LIFXDriver.prototype.discover = function (paramd, discover_callback) {
    var self = this;

    /* once created we don't search again */
    var _lifx = self._lifx(true);
    if (!_lifx) {
        return;
    }

    logger.info({
        method: "discover",
        unique_id: self.unique_id,
        initd: paramd.initd,
        driverd: paramd.driverd
    }, "discovering LIFX bulbs");

    /* this is very barebones AND TOTALLY NEEDS TO BE UPDATED */
    _lifx.on('bulb', function (bulb) {
        paramd = _.clone(paramd);
        paramd.bulb = bulb;

        discover_callback(new LIFXDriver(paramd));
    });

    return _lifx;
};

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
LIFXDriver.prototype.push = function (paramd) {
    var self = this;

    logger.info({
        method: "push",
        unique_id: self.unique_id,
        initd: paramd.initd,
        driverd: paramd.driverd
    }, "called");

    var putd = {};

    if (paramd.driverd.on !== undefined) {
        putd.on = paramd.driverd.on;
    }

    if (paramd.driverd.brightness !== undefined) {
        var color = new Color();
        color.set_rgb_1(paramd.driverd.brightness, paramd.driverd.brightness, paramd.driverd.brightness);
        paramd.driverd.color = color.get_hex();
    }

    if (_.isString(paramd.driverd.color)) {
        c2h(putd, paramd.driverd.color);
        putd.on = true;
        self.pulled({
            on: true
        });
    }

    logger.info({
        method: "push",
        putd: putd
    }, "push");

    var qitem = {
        id: self.light,
        run: function () {
            var _lifx = self._lifx();

            if (putd.on) {
                _lifx.lightsOn();
            } else {
                _lifx.lightsOff();
            }

            if (putd.h !== undefined) {
                // _lifx.lightsColour(putd.h, putd.s, putd.l, 0x0dac);
                _lifx.lightsColour(putd.h, putd.s, putd.l, putd.brightness, 0x25); // 0x0513);
            }

            queue.finished(qitem);
        }
    };
    queue.add(qitem);

    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
LIFXDriver.prototype.pull = function () {
    var self = this;

    logger.info({
        method: "pull",
        unique_id: self.unique_id
    }, "called");

    return self;
};

/* --- internals --- */
var __lifx;

/**
 */
LIFXDriver.prototype._lifx = function (no_create) {
    var self = this;

    if (no_create && __lifx) {
        return null;
    } else if (!__lifx) {
        __lifx = lifx.init();
    }

    return __lifx;
};

function c2h(outd, hex) {
    var color = new Color(hex);

    outd.h = Math.round(color.h * 0xFFFF);
    outd.s = Math.round(color.s * 0xFFFF);
    outd.l = Math.round(color.l * 0xFFFF);
    outd.brightness = Math.max(color.r, color.g, color.b) * 0xFFFF;
}

/*
 *  API
 */
exports.Driver = LIFXDriver;
