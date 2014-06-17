/*
 *  drivers/debug.js
 *
 *  David Janes
 *  IOTDB.org
 *  2013-12-25
 *
 *  Just log / echo things
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
}

DebugDriver.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  See {@link Driver#discover Driver.discover}
 */
DebugDriver.prototype.discover = function(paramd, discover_callback) {
    var self = this;

    discover_callback(new DebugDriver(self.identityd));
}

DebugDriver.prototype.identity = function(kitchen_sink) {
    return {}
}

/**
 *  Push
 */
DebugDriver.prototype.push = function(paramd) {
    var self = this;

    console.log("DebugDriver.push called", paramd.initd, paramd.driverd);
    return self;
}

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
}


/*
 *  API
 */
exports.Driver = DebugDriver
