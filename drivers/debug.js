/*
 *  drivers/debug.js
 *
 *  David Janes
 *  IOTDB.org
 *  2013-12-25
 *
 *  Just log / echo things
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

/**
 *  Typically this will be created by one of
 *  the discover_* functions
 */
var DebugDriver = function(identityd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    self.identityd = identityd ? identityd : {};

    return self;
};

DebugDriver.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  See {@link Driver#discover Driver.discover}
 */
DebugDriver.prototype.discover = function(paramd, discover_callback) {
    var self = this;

    if (paramd.initd === undefined) {
        console.log("# DebugDriver.discover: no nearby discovery (not a problem)")
        return
    }

    discover_callback(new DebugDriver(self.identityd));
};

DebugDriver.prototype.identity = function(kitchen_sink) {
    return {}
};

/**
 *  Push
 */
DebugDriver.prototype.push = function(paramd) {
    var self = this;

    console.log("DebugDriver.push called", paramd.initd, paramd.driverd);
    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
DebugDriver.prototype.pull = function() {
    var self = this;

    console.log("DebugDriver.pull called");
    return self;
};


/*
 *  API
 */
exports.Driver = DebugDriver
