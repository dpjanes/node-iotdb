/*
 *  drivers/upnp.js
 *
 *  David Janes
 *  IOTDB.org
 *  2013-12-30
 *
 *  Talk to Philips Hue devices
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
var Color = require("../libs/color").Color
var hc = require('./libs/hue-colors.js')

var unirest = require('unirest');

var driver = require('../driver')
var upnp = require('./upnp')
var FIFOQueue = require('../queue').FIFOQueue
var UPnPDriver = require('./upnp').Driver

var queue = new FIFOQueue("HueDriver")

/**
 *  Typically this will be created by one of
 *  the discover_* functions
 */
var HueDriver = function(upnp_device, light, username) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    if (upnp_device !== undefined) {
        self.upnp_device = upnp_device;
        self.light = light;
        self.api = "http://" + self.upnp_device.host + ":" + self.upnp_device.port;
        self.username = username
    }

    return self;
}

HueDriver.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  Find Hue Hubs and associate an account name with them.
 */
HueDriver.prototype.configure = function(ad, callback) {
    var self = this;

    var cp = UPnPDriver.cp();
    cp.on("device", function(upnp_device) {
        self._configure_device(upnp_device, callback);
    });
    cp.search();
}

HueDriver.prototype._configure_device = function(upnp_device, callback) {
    var self = this;

    var crypto = require('crypto');
    var timers = require('timers');

    var matchd = {
        deviceType: 'urn:schemas-upnp-org:device:Basic:1',
        manufacturer: 'Royal Philips Electronics',
        modelNumber: '929000226503'
    }
    if (!(_.d_contains_d(upnp_device, matchd))) {
        return;
    }

    // we use '+' for logging because this is effectively the top of the application
    var account_key = "HueDriver:" + upnp_device.uuid
    var account_value = self.cfg_get(account_key)
    if (account_value && account_value.length) {
        console.log("+ HueDriver.configure: this hub is already configured")
        console.log("  username:", account_value)
        console.log("  no work to do")
        return
    }

    console.log("+ HueDriver.configure: configuring Philips Hue hub: ", upnp_device.uuid)
    console.log("  - you _must_ have physical access to the hub to configure it")
    console.log("  - it's a white round circular device")
    console.log("  - when prompted, you will press the button in the center")

    var hasher = crypto.createHash('md5');
    hasher.update("Hue")
    hasher.update("" + Math.random())
    account_value = "hue" + hasher.digest("hex").substring(0, 16)
    
    var count = 5;
    var timerId = timers.setInterval(function() {
        if (count == 0) {
            timers.clearTimeout(timerId)

            var url = "http://" + upnp_device.host + ":" + upnp_device.port + "/api"
            unirest
                .post(url)
                .headers({ 'Accept': 'application/json' })
                .type('json')
                .send({
                    devicetype: "test user",
                    username: account_value
                })
                .end(function(result) {
                    if (!result.ok) {
                        console.log("# HueDriver.configure", "not ok", "url", url, "result", result.text);
                    } else if (result.body && result.body.length && result.body[0].error) {
                        console.log("# HueDriver.configure", "not ok", "url", url, "result", result.body);
                    } else {
                        console.log("+ HueDriver.configure", result.body);

                        var updated = {}
                        updated[account_key] = account_value
                        callback(updated)

                        console.log("+ HueDriver.configure", "SUCCESS!")
                    }
                })
            ;
        } else {
            console.log("+ Press the button and keep it pressed!", count)
            count--;
        }
    }, 1000)
}

/**
 *  See {@link Driver#discover Driver.discover}
 *  - Scan the local network for Hues
 */
HueDriver.prototype.discover = function(paramd, discover_callback) {
    var self = this;

    var cp = UPnPDriver.cp();
    cp.on("device", function(upnp_device) {
        self._foundDevice(discover_callback, upnp_device);
    });
    cp.search();
}

/**
 *  This does the work of creating a new device and calling the callback
 *  (which is usally IOT)
 */
HueDriver.prototype._foundDevice = function(discover_callback, upnp_device) {
    var self = this;

    console.log("- HueDriver._foundDevice", "device", upnp_device.deviceType);

    var matchd = {
        deviceType: 'urn:schemas-upnp-org:device:Basic:1',
        manufacturer: 'Royal Philips Electronics',
        modelNumber: '929000226503'
    }
    if (!(_.d_contains_d(upnp_device, matchd))) {
        return;
    }

    // has this hub been set up?
    var account_key = "HueDriver:" + upnp_device.uuid
    var account_value = self.cfg_get(account_key)
    if (!account_value) {
        console.log("# HueDriver._foundDevice: This Philips Hue Hub is not set up yet")
        console.log("  Please enter the following command and follow the instructions given")
        console.log("")
        console.log("  iotdb-control configure-driver hue --project=$HOME")
        console.log("")
        return
    }

    var url = "http://" + upnp_device.host + ":" + upnp_device.port + "/api/" + account_value + "/lights"
    unirest
        .get(url)
        .set('Accept', 'application/json')
        .end(function(result) {
            if (!result.ok) {
                console.log("not ok", "url", url, "result", result.text);
                return
            }

            for (var light in result.body) {
                console.log("- HueDriver._foundDevice", "make-light", light);
                discover_callback(new HueDriver(upnp_device, light, account_value));
            }
        })
    ;
}

HueDriver.prototype._service_by_urn = function(service_urn) {
    var self = this;

    for (s_name in self.upnp_device.services) {
        var service = self.upnp_device.services[s_name];
        if (service.serviceType == service_urn) {
            return service;
        }
    }

    return null;
}

/* --- --- */
/**
 *  See {@link Driver#identity}
 */
HueDriver.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver_iri"] = _.expand("iot-driver:hue")

        if (self.upnp_device) {
            identityd["deviceType"] = self.upnp_device.deviceType
            identityd["udn"] = self.upnp_device.udn
            identityd["light"] = self.light;
        }

        _.thing_id(identityd);

        self.__identityd = identityd;
    }

    if (kitchen_sink && self.upnp_device) {
        var identityd = _.deepCopy(self.__identityd)
        var keys = _.keys(self.upnp_device)
        for (var kx in keys) {
            var key = keys[kx]
            if (identityd[key] !== undefined) {
                continue;
            }

            var value = self.upnp_device[key];
            if (!_.isString(value)) {
                continue;
            }

            identityd[key] = value;
        }

        return identityd;
    }

    return self.__identityd;
}

/**
 *  See {@link Driver#setup Driver.setup}
 */
HueDriver.prototype.setup = function(paramd) {
    var self = this;
    console.log("- UPnDriver.setup", paramd.setupd);

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    return self;
}

/**
 *  See {@link Driver#push}
 */
HueDriver.prototype.push = function(paramd) {
    var self = this;

    console.log("- HueDriver.push called", paramd.driverd);

    var putd = {
    }

    if (paramd.driverd.on !== undefined) {
        putd.on = paramd.driverd.on;
    }

    if (_.isString(paramd.driverd.color)) {
        c2h(putd, paramd.driverd.color);
        putd.on = true
        self.pulled({
            on: true
        })
        /*
        var rgb = parseInt(paramd.driverd.color.substring(1), 16);
        if (!isNaN(rgb)) {
            var r = ( rgb >> 16 ) & 0xFF;
            var g = ( rgb >> 8 ) & 0xFF;
            var b = ( rgb >> 0 ) & 0xFF;

            rgb2hsb(putd, r, g, b);
            putd.on = true
        }
        */
    }

    console.log("- HueDriver.push", "putd", putd)

    var qitem = {
        id: self.light,
        run: function() {
            var url = self.api + "/api/" + self.username + "/lights/" + self.light + "/state/";
            console.log("- do", url);
            unirest
                .put(url)
                .headers({ 'Accept': 'application/json' })
                .type('json')
                .send(putd)
                .end(function(result) {
                    queue.finished(qitem);
                    if (!result.ok) {
                        console.log("# HueDriver.push", "not ok", "url", url, "result", result.text);
                        return
                    }

                    console.log("- HueDriver.push", result.body);
                })
            ;
        }
    }
    queue.add(qitem);

    return self;
}

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
HueDriver.prototype.pull = function() {
    var self = this;

    console.log("- HueDriver.pull called");
    var qitem = {
        id: self.light,
        run: function() {
            var url = self.api + "/api/" + self.username + "/lights/" + self.light;
            console.log("- do", url);
            unirest
                .get(url)
                .headers({ 'Accept': 'application/json' })
                .end(function(result) {
                    queue.finished(qitem);
                    if (!result.ok) {
                        console.log("# HueDriver.pull", "not ok", "url", x);
                        return
                    }

                    if (result.body && result.body.state) {
                        var driverd = {}
                        var state = result.body.state;
                        if (state.on !== undefined) {
                            driverd.on = state.on  ? true : false
                        }
                        if ((state.xy !== undefined) && (state.bri !== undefined)) {
                            h2c(driverd, state)
                            // xybri2rgb(driverd, state.xy[0], state.xy[1], state.bri);
                        }

                        self.pulled(driverd)
                        console.log("- HueDriver.pull", "driverd=", driverd, "\n state=", state)
                    }
                })
            ;
        }
    }
    queue.add(qitem);
    return self;
}

/* --- internals --- */
function rgb2hsb(outd, red, green, blue) {
    var h = 0
        , s = 0
        , l = 0
        , r = parseFloat(red) / 255
        , g = parseFloat(green) / 255
        , b = parseFloat(blue) / 255;

    var min = Math.min(r, g, b);
    var max = Math.max(r, g, b);
    var delta = max - min;
    var add = min + max;

    if (min === max) {
        h = 0;
    }
    else if (r === max) {
        h = ((60 * (g - b) / delta) + 360) % 360;
    }
    else if (g === max) {
        h = (60 * (b - r) / delta) + 120;
    }
    else {
        h = (60 * (r - g) / delta) + 240;
    }

    l = 0.5 * add;
    if (l === 0) {
        s = 0;
    }
    else if (l === 1) {
        s = 1;
    }
    else if (l <= 0.5) {
        s = delta / add;
    }
    else {
        s = delta / (2 - add);
    }

    h = Math.round(h);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    var hue = Math.floor(_getBoundedValue(h, 0, 359) * 182.5487); 
    var saturation = Math.floor(_getBoundedValue(s, 0, 100) * (255 / 100)); 
    var luminosity = _convertBrightPercentToHueValue(l);

    outd["hue"] = _getBoundedValue(hue, 0, 65535)
    outd["sat"] = _getBoundedValue(saturation, 0, 254)
    outd["bri"] = _getBrightnessValue(luminosity)
}

// http://stackoverflow.com/questions/16052933/convert-philips-hue-xy-values-to-hex
function xybri2rgb(outd, x, y, bri) {
    var z = 1.0 - x - y;
    var Y = bri / 255.0;
    var X = (Y / y) * x;
    var Z = (Y / y) * z;

    var r = X * 1.612 - Y * 0.203 - Z * 0.302;
    var g = -X * 0.509 + Y * 1.412 + Z * 0.066;
    var b = X * 0.026 - Y * 0.072 + Z * 0.962;

    var r = r <= 0.0031308 ? 12.92 * r : (1.0 + 0.055) * Math.pow(r, (1.0 / 2.4)) - 0.055;
    var g = g <= 0.0031308 ? 12.92 * g : (1.0 + 0.055) * Math.pow(g, (1.0 / 2.4)) - 0.055;
    var b = b <= 0.0031308 ? 12.92 * b : (1.0 + 0.055) * Math.pow(b, (1.0 / 2.4)) - 0.055;

    var maxValue = Math.max(r,g,b);
    var r = r / maxValue;
    var g = g / maxValue;
    var b = b / maxValue;

    var c = new Color()
    c.set_rgb_1(r, g, b)

    outd['color'] = c.get_hex()
}

function _convertBrightPercentToHueValue(percentage) {
    return Math.floor(_getBoundedValue(percentage, 0, 100) * (255 / 100));
}

function _getBrightnessValue(value) {
    return Math.floor(_getBoundedValue(value, 1, 255));
}

function _getBoundedValue(value, min, max) {
    if (isNaN(value)) {
        value = min;
    }

    if (value < min) {
        return min;
    } else if (value > max) {
        return max;
    } else {
        return value;
    }
}

function c2h(outd, hex) {
    var color = new Color(hex)

    outd.xy = hc.rgbToCIE1931(color.r, color.g, color.b)
    outd.bri = Math.max(color.r, color.g, color.b) * 255
}

var hueds = null;

// hack!
function h2c(outd, state) {
    state.bri1 = state.bri / 255.0

    if (hueds == null) {
        hueds = []
        for (var name in _.colord) {
            var hex = _.colord[name];

            var hued = {}
            c2h(hued, hex)

            hued.bri1 = hued.bri / 255.0
            hued.hex = hex

            hueds.push(hued)
        }
    }

    var best = null
    var distance = 0
    for (var hi in hueds) {
        var hued = hueds[hi]
        var xd = state.xy[0] - hued.xy[0]
        var yd = state.xy[1] - hued.xy[1]
        var bd = state.bri1 - hued.bri1
        var d = Math.sqrt(xd*xd + yd*yd + bd*bd)

        if ((best == null) || (d < distance)) {
            best = hued;
            distance = d;
        }
    }

    if (best) {
        outd.color = best.hex
    }
}

/*
 *  API
 */
exports.Driver = HueDriver
