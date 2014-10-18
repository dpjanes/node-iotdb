/*
 *  drivers/null.js
 *
 *  David Janes
 *  IOTDB.org
 *  2013-12-31
 *
 *  Do nothing
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

var bunyan = require('bunyan');
var logger = bunyan.createLogger({ 
    name: 'iotdb',
    module: 'NullDriver',
})

/**
 *  Typically this will be created by one of
 *  the discover_* functions
 */
var NullDriver = function(verbose) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    self.verbose = verbose;

    return self;
};

NullDriver.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  See {@link driver#push}
 */
NullDriver.prototype.push = function(paramd) {
    var self = this;

    if (self.verbose) {
        console.log("- NullDriver.push", paramd.driverd);
    }

    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
NullDriver.prototype.pull = function() {
    var self = this;

    return self;
};


/*
 *  API
 */
exports.Driver = NullDriver
