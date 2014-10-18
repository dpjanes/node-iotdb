/*
 *  drivers/proto.js
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

var _ = require("../helpers");
var driver = require('../driver');
var FIFOQueue = require('../queue').FIFOQueue;

var queue = new FIFOQueue("ProtoDriver");

/**
 */
var ProtoDriver = function(paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: "iot-driver:proto",
        initd: {}
    })

    self.verbose = paramd.verbose
    self.driver = _.expand(paramd.driver)

    self._init(paramd.initd)

    return self;
};

ProtoDriver.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
ProtoDriver.prototype._init = function(initd) {
    var self = this;

    if (!initd) {
        return
    }
    if (initd.iri) {
        self.iri = initd.iri
    }
};

/**
 *  See {@link Driver#identity Driver.identity}
 */
ProtoDriver.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver"] = self.driver

        _.thing_id(identityd);
        
        self.__identityd = identityd;
    }

    return self.__identityd;
};

/**
 *  See {@link Driver#setup Driver.setup}
 */
ProtoDriver.prototype.setup = function(paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd)

    return self;
};

/*
 *  See {@link Driver#discover Driver.discover}
 */
ProtoDriver.prototype.discover = function(paramd, discover_callback) {
    discover_callback(new ProtoDriver());
};

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
ProtoDriver.prototype.push = function(paramd) {
    var self = this;

    console.log("- ProtoDriver.push", 
        "\n  driverd", paramd.driverd, 
        "\n  initd", paramd.initd)

    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
ProtoDriver.prototype.pull = function() {
    var self = this;

    console.log("- ProtoDriver.pull", 
        "\n  initd", paramd.initd
    )

    return self;
};


/*
 *  API
 */
exports.Driver = ProtoDriver
