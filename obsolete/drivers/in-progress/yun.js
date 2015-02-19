/*
 *  drivers/yun.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-25
 *
 *  Connect to Yun using its "REST" webservice
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
var FIFOQueue = require('../queue').FIFOQueue
var unirest = require('unirest');
var url = require('url');
var dns = require('dns');

var queue = new FIFOQueue("YunDriver");

/**
 */
var YunDriver = function(paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: _.expand("iot-driver:yun"),
        initd: {}
    })

    self.verbose = paramd.verbose
    self.api = null
    self.api_scrubbed = false
    self.driver = paramd.driver

    self.pindd = {}
    self._init(paramd.initd)

    return self;
}

YunDriver.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
YunDriver.prototype._init = function(initd) {
    var self = this;

    if (!initd) {
        return
    }

    if (initd.api) {
        self.api = initd.api
        self.api_scrubbed = false;
    }

    for (var ikey in initd) {
        var ivalue = initd[ikey]
        if (ikey == "api") {
            continue
        }

        self._setup_key_value(ikey, ivalue)
    }
}

/**
 *  See {@link Driver#identity Driver.identity}
 */
YunDriver.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver"] = self.driver
        if (self.api) {
            identityd["api"] = self.api
        }

        _.thing_id(identityd);
        
        self.__identityd = identityd;
    }

    return self.__identityd;
}

/**
 */
YunDriver.prototype._setup_key_value = function(ikey, ivalue) {
    var self = this;

    if (!_.isString(ivalue)) {
        return
    }

    var parts = ivalue.split(",")
    for (var pi in parts) {
        var part = parts[pi]
        var kv = part.split("=")
        if (kv.length == 2) {
            if (kv[0] == "dout") {
                self.pindd[ikey] = {
                    digital: true,
                    out: true,
                    pin: kv[1],
                    initialzed: false
                }
            } else if (kv[1] == "din") {
                self.pindd[ikey] = {
                    digital: true,
                    out: false,
                    pin: kv[1],
                    initialzed: false
                }
            } else if (kv[0] == "aout") {
                self.pindd[ikey] = {
                    digital: false,
                    out: true,
                    pin: kv[1],
                    initialzed: false
                }
            } else if (kv[1] == "ain") {
                self.pindd[ikey] = {
                    digital: false,
                    out: false,
                    pin: kv[1],
                    initialzed: false
                }
            }
        }
    }
}

/**
 *  We look up DNS names in the API to speed
 *  up things like 'amarone.local'
 */
YunDriver.prototype._scrub_api = function()
{
    var self = this;

    if (!self.api) {
        return
    } else if (self.api_scrubbed) {
        return;
    } else {
        self.api_scrubbed = true;
    }

    var u = url.parse(self.api)
    if (/[^0-9.]/.exec(u) == null) {
        return;
    }

    dns.lookup(u.hostname, function(err, address) {
        if (err) {
            console.log("# YunDriver._scrub_api/dns.lookup", err)
            return;
        }

        var u = url.parse(self.api)
        u.host = null
        u.hostname = address

        var newapi = url.format(u).replace(/\/*$/, "");
        console.log("- YunDriver._scrub_api/dns.lookup: changed API using DNS lookup", 
            "\n  was", self.api,
            "\n  now", newapi
        )

        self.api = newapi
    })

}

/**
 *  Call a URL
 */
YunDriver.prototype._hit = function(url, callback)
{
    var self = this;
    var qitem = {
        id: url,
        run: function() {
            console.log("- YunDriver._hit/run", "url=", url);
            unirest
                .get(url)
                .end(function(result) {
                    queue.finished(qitem);

                    if (!result.ok) {
                        console.log("# YunDriver._hit/end: not ok", "url", url, "result", result.text);
                        return
                    }

                    console.log("- YunDriver.hit/end: body", result.body);
                })
            ;
        }
    }
    queue.add(qitem);
}

/**
 *  See {@link Driver#setup Driver.setup}
 */
YunDriver.prototype.setup = function(paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    if (paramd.initd) {
        self._init(paramd.initd)
    }

    console.log("- YunDriver.setup", 
        "\n  api", self.api, 
        "\n  initd", paramd.initd,
        "\n  pindd", self.pindd
    )

    if (!self.api_scrubbed) {
        self._scrub_api()
    }

    return self;
}

/*
 *  See {@link Driver#discover Driver.discover}
 */
YunDriver.prototype.discover = function(paramd, discover_callback) {
    if (paramd.initd === undefined) {
        console.log("# YunDriver.discover: no nearby discovery (not a problem)")
        return
    }

    discover_callback(new YunDriver());
}

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
YunDriver.prototype.push = function(paramd) {
    var self = this;

    console.log("- YunDriver.push", 
        "\n  api", self.api, 
        "\n  driverd", paramd.driverd, 
        "\n  initd", paramd.initd
        // ,"\n  paramd", paramd
    )

    for (var key in paramd.driverd) {
        var value = paramd.driverd[key]
        var pind = self.pindd[key]
        if (!pind) {
            console.log("# YunDriver.push: no 'pind' for key", key)
            continue;
        }

        console.log("- YunDriver.push", 
            "\n  key", key,
            "\n  value", value,
            "\n  pind", pind
            // "\n  attribute", attribute
        )

        if (!pind.initialized) {
            pind.initialized = true;
            var url = self.api + "/arduino/mode/" + pind.pin + "/" + ( pind.out ? "output" : "input" );
            self._hit(url)
        }

        if (pind.digital) {
            var url = self.api + "/arduino/digital/" + pind.pin + "/" + ( value ? "1" : "0" );
            self._hit(url)
        }

    }

    return self;
}

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
YunDriver.prototype.pull = function() {
    var self = this;

    console.log("- YunDriver.pull", 
        "\n  api", self.api, 
        "\n  initd", paramd.initd
    )

    /*
    var qitem = {
        run: function() {
            request
                .get(self.api)
                .set('Accept', 'application/json')
                .on('error', function(x) {
                    queue.finished(qitem);
                    console.log("- YunDriver.pull/on.error", x);
                })
                .end(function(result) {
                    queue.finished(qitem);
                    if (!result.ok) {
                        console.log("- YunDriver.pull/.end - not ok", "\n  url", url, "\n  result", result.text);
                        return
                    }

                    callback(result.body)
                })
            ;
        }
    }
    queue.add(qitem);
    */

    return self;
}


/*
 *  API
 */
exports.Driver = YunDriver
