/*
 *  drivers/skynet.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-05-15
 *
 *  Connect to Skynet
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

var skynet = require("skynet")

var _ = require("../helpers");
var driver = require('../driver')
var FIFOQueue = require('../queue').FIFOQueue

var queue = new FIFOQueue("SkyNet");

/**
 */
var SkyNet = function(paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver_iri: "iot-driver:skynet",
        initd: {}
    })

    self.verbose = paramd.verbose
    self.driver_iri = _.expand(paramd.driver_iri)
    self.connection = null
    self.device_uuid = null
    self.device_token = null

    self._init(paramd.initd)

    return self;
}

SkyNet.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
SkyNet.prototype._init = function(initd) {
    var self = this;

    if (!initd) {
        return
    }
    if (initd.uuid) {
        self.device_uuid = initd.uuid
    }
    if (initd.token) {
        self.device_token = initd.token
    }
}

/**
 *  See {@link Driver#identity Driver.identity}
 */
SkyNet.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver_iri"] = self.driver_iri
        if (self.device_uuid) {
            identityd["uuid"] = self.device_uuid
        }

        _.thing_id(identityd);
        
        self.__identityd = identityd;
    }

    return self.__identityd;
}

/**
 *  See {@link Driver#setup Driver.setup}
 */
SkyNet.prototype.setup = function(paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd)

    if (!self.device_uuid) {
        console.log("# SkyNet.setup: no 'uuid', cannot connect")
        return
    }

    var sd = {
        uuid: self.device_uuid,
        protocol: "websocket"

    }
    if (self.device_token) {
        sd.token = self.device_token
    }

    self.connection = skynet.createConnection(sd)
    self.connection.on('notReady', function(data) {
        console.log("# SkyNet.setup: failed to connect", data) 
    });
    self.connection.on('ready', function(data) {
        console.log("- SkyNet.setup: connected")

        self.connection.subscribe(sd, function (data) {
            console.log("- SkyNet.setup: subscribed", self.device_uuid, data)
        });

        self.connection.on('message', function(message) {
            console.log("- SkyNet.setup: received message", message.fromUuid)
            self.pulled(message.payload)
        });
    })

    return self;
}

/*
 *  See {@link Driver#discover Driver.discover}
 */
SkyNet.prototype.discover = function(paramd, discover_callback) {
    discover_callback(new SkyNet());
}

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
SkyNet.prototype.push = function(paramd) {
    var self = this;

    console.log("- SkyNet.push", 
        "\n  driverd", paramd.driverd, 
        "\n  initd", paramd.initd)

    self.connection.message({
        devices: self.device_uuid,
        payload: paramd.driverd
    })

    return self;
}

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
SkyNet.prototype.pull = function() {
    var self = this;

    console.log("- SkyNet.pull", 
        "\n  initd", paramd.initd
    )

    return self;
}


/*
 *  API
 */
exports.Driver = SkyNet
