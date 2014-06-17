/*
 *  drivers/net.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-03-06
 *
 *  Connect by pinging Nets
 */

"use strict"

var _ = require("../helpers");
var driver = require('../driver')
var FIFOQueue = require('../queue').FIFOQueue
var unirest = require('unirest');

var queue = new FIFOQueue("Net");

/**
 */
var Net = function(paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver_iri: "iot-driver:net",
        initd: {}
    })

    self.verbose = paramd.verbose;
    self.driver_iri = _.expand(paramd.driver_iri)

    return self;
}

Net.prototype = new driver.Driver;

/* --- class methods --- */

Net.prototype._init = function(initd) {
    var self = this;

    if (!initd) {
        return;
    }

    if (initd.api) {
        self.api = initd.api;
    }
}

/**
 *  See {@link Driver#identity Driver.identity}
 */
Net.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver_iri"] = self.driver_iri

        // once the driver is 'setup' this will have a value
        if (self.api) {
            identityd["api"] = self.api
        }

        _.thing_id(identityd);
        
        self.__identityd = identityd;
    }

    return self.__identityd;
}

/**
 *  See {@link Driver#setup Driver.setup}
 */
Net.prototype.setup = function(paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    if (paramd) {
        self._init(paramd.initd)
    }

    return self;
}

/**
 *  See {@link Driver#discover Driver.discover}
 */
Net.prototype.discover = function(paramd, discover_callback) {
    discover_callback(new Net());
}

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
Net.prototype.push = function(paramd) {
    var self = this;

    console.log("- Net.push", 
        "\n  api", self.api, 
        "\n  driverd", paramd.driverd, 
        "\n  initd", paramd.initd)

    var qitem = {
        id: self.light,
        run: function() {
            unirest
                .get(self.api)
                .query(paramd.driverd)
                // .headers({'Accept': 'application/json'})
                .end(function(result) {
                    queue.finished(qitem);
                    if (!result.ok) {
                        console.log("# Net.push/.end", "not ok", "url", self.api, "result", result.text);
                        return
                    }

                    console.log("- Net.push/.end.body", result.body);
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
Net.prototype.pull = function() {
    var self = this;

    console.log("- Net.pull", 
        "\n  api", self.api, 
        "\n  initd", paramd.initd
    )

    return self;
}


/*
 *  API
 */
exports.Driver = Net
