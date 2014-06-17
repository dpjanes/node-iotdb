/*
 *  drivers/feed.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-04-03
 *
 *  Connect to RSS / Atom feeds
 */

"use strict"

var FeedParser = require('feedparser')
var unirest = require('unirest')
var stream = require('stream')
var timers = require('timers');

var _ = require("../helpers");
var driver = require('../driver')
var FIFOQueue = require('../queue').FIFOQueue

var queue = new FIFOQueue("FeedDriver");

/**
 */
var FeedDriver = function(paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver_iri: "iot-driver:feed"
    })

    self.verbose = paramd.verbose
    self.driver_iri = _.expand(paramd.driver_iri)
    self.api = null
    self.reload = 120
    self.seend = {}
    self.fresh = true
    self.track_links = true
    self.started = new Date()

    self.reloadTimerId = null;

    self._init(paramd.initd)

    return self;
}

FeedDriver.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
FeedDriver.prototype._init = function(initd) {
    var self = this;

    if (!initd) {
        return
    }
    if (initd.api !== undefined) {
        self.api = initd.api
    }
    if (initd.fresh !== undefined) {
        self.fresh = initd.fresh
    }
    if (initd.track_links !== undefined) {
        self.track_links = initd.track_links
    }
}

/**
 *  See {@link Driver#identity Driver.identity}
 */
FeedDriver.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver_iri"] = self.driver_iri

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
FeedDriver.prototype.setup = function(paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd)
    self.pull()

    return self;
}

/*
 *  See {@link Driver#discover Driver.discover}
 */
FeedDriver.prototype.discover = function(paramd, discover_callback) {
    discover_callback(new FeedDriver());
}

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
FeedDriver.prototype.push = function(paramd) {
    var self = this;

    console.log("- FeedDriver.push", "inherently, this does nothing!")

    return self;
}

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
FeedDriver.prototype.pull = function() {
    var self = this;

    console.log("- FeedDriver.pull")

    self._fetch()

    return self;
}

/* --- Internals --- */
FeedDriver.prototype._fetch = function() {
    var self = this;

    console.log("- FeedDriver._fetch", "api", self.api)
    unirest
        .get(self.api)
        .end(function(result) {
            if (result.error) {
                console.log("# FeedDriver._fetch: can't get feed", result.error)
            } else {
                self._process(result.body)
            }

            if (self.reloadTimerId) {
                timers.clearTimeout(self.reloadTimerId);
            }

            self.reloadTimerId = timers.setInterval(function() {
                self._fetch()
            }, self.reload * 1000);
        })
}

FeedDriver.prototype._process = function(body) {
    var self = this;

    var s = new stream.Readable();
    s._read = function noop() {}; // redundant? see update below
    s.push(body)
    s.push(null);

    var fp = new FeedParser({
        feedurl: self.api
    })
    fp.on('error', function() {
    })
    fp.on('readable', function() {
        var stream = this
        var item = null;
        while (item = stream.read()) {
            if (item.guid === undefined) {
                continue
            }

            if (self.seend[item.guid] && self.track_links) {
                continue
            }
            self.seend[item.guid] = 1

            var date = item.date
            if (!date) {
                if (self.fresh) {
                    continue
                } 
            } else {
                var is_fresh = date.getTime() >= self.started.getTime()
                if (self.fresh && !is_fresh) {
                    continue
                }
            }

            item.fresh = is_fresh

            self.pulled(self._flatten(item))
        }
    })

    s.pipe(fp)
}

FeedDriver.prototype._flatten = function(od) {
    var self = this;

    var nd = {}

    for (var okey in od) {
        var ovalue = od[okey]
        var nkey = okey.toLowerCase().replace(/[^a-z0-9]/g, '_')

        if (_.isString(ovalue))  {
            if (ovalue.length !== 0) {
                nd[nkey] = ovalue
            }
        } else if (_.isArray(ovalue)) {
            if (ovalue.length !== 0) {
                nd[nkey] = ovalue
            }
        } else if (_.isDate(ovalue)) {
            nd[nkey] = ovalue
        } else if (_.isObject(ovalue)) {
            if (_.isEmpty(ovalue)) {
                continue
            }

            var ohash = ovalue['#']
            if (ohash === undefined) {
                continue
            } else {
                nd[nkey] = ovalue['#']
            }

            var oat = ovalue['@']
            if (oat !== undefined) {
                for (var skey in oat) {
                    var svalue = oat[skey]
                    skey = skey.toLowerCase().replace(/[^a-z0-9]/g, '_')
                    nd[nkey + "_" + skey] = svalue
                }
            }
        } else {
            nd[nkey] = ovalue
        }
    }

    return nd
}

/* --- API --- */
exports.Driver = FeedDriver

