/*
 *  drivers/null.js
 *
 *  David Janes
 *  IOTDB.org
 *  2013-12-31
 *
 *  Do nothing
 */

"use strict"

var _ = require("../helpers");
var driver = require('../driver')

/**
 *  Typically this will be created by one of
 *  the discover_* functions
 */
var NullDriver = function(verbose) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    self.verbose = verbose;

    return self;
}

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
}

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
NullDriver.prototype.pull = function() {
    var self = this;

    return self;
}


/*
 *  API
 */
exports.Driver = NullDriver
