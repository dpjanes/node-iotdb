/*
 *  drivers/proto.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-XX-XX
 *
 *  Connect to 
 */

"use strict"

var _ = require("../helpers");
var driver = require('../driver')
var FIFOQueue = require('../queue').FIFOQueue

var queue = new FIFOQueue("ProtoDriver");

/**
 */
var ProtoDriver = function(paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver_iri: "iot-driver:proto",
        initd: {}
    })

    self.verbose = paramd.verbose
    self.driver_iri = _.expand(paramd.driver_iri)

    self._init(paramd.initd)

    return self;
}

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
    if (initd.api) {
        self.api = initd.api
    }
}

/**
 *  See {@link Driver#identity Driver.identity}
 */
ProtoDriver.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver_iri"] = self.driver_iri

        _.thing_id(identityd);
        
        self.__identityd = identityd;
    }

    return self.__identityd;
}

/**
 *  See {@link Driver#setup Driver.setup}
 */
ProtoDriver.prototype.setup = function(paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd)

    return self;
}

/*
 *  See {@link Driver#discover Driver.discover}
 */
ProtoDriver.prototype.discover = function(paramd, discover_callback) {
    discover_callback(new ProtoDriver());
}

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
}

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
}


/*
 *  API
 */
exports.Driver = ProtoDriver
