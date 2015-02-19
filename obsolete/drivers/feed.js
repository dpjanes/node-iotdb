/*
 *  drivers/feed.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-04-03
 *
 *  Connect to RSS / Atom feeds
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

var FeedParser = require('feedparser');
var unirest = require('unirest');
var stream = require('stream');
var timers = require('timers');

var _ = require("../helpers");
var driver = require('../driver');
var FIFOQueue = require('../queue').FIFOQueue;

var queue = new FIFOQueue("FeedDriver");

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'FeedDriver',
});

/**
 */
var FeedDriver = function (paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: "iot-driver:feed"
    });

    self.verbose = paramd.verbose;
    self.driver = _.ld.expand(paramd.driver);
    self.iri = null;
    self.seend = {};
    self.fresh = true;
    self.track_links = true;
    self.started = new Date();

    self._init(paramd.initd);

    return self;
};

FeedDriver.prototype = new driver.Driver();

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
FeedDriver.prototype._init = function (initd) {
    var self = this;

    initd = _.defaults(initd, {
        poll: 120
    });

    if (!initd) {
        return;
    }
    if (initd.iri !== undefined) {
        self.iri = initd.iri;
    }
    if (initd.fresh !== undefined) {
        self.fresh = initd.fresh;
    }
    if (initd.track_links !== undefined) {
        self.track_links = initd.track_links;
    }

    self.poll_init(initd);
};

/**
 *  See {@link Driver#identity Driver.identity}
 */
FeedDriver.prototype.identity = function (kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {};
        identityd["driver"] = self.driver;

        if (self.iri) {
            identityd["iri"] = self.iri;
        }
        _.thing_id(identityd);

        self.__identityd = identityd;
    }

    return self.__identityd;
};

/**
 *  See {@link Driver#setup Driver.setup}
 */
FeedDriver.prototype.setup = function (paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd);
    self.pull();

    return self;
};

/*
 *  See {@link Driver#discover Driver.discover}
 */
FeedDriver.prototype.discover = function (paramd, discover_callback) {
    if (paramd.nearby) {
        logger.warn({
            method: "discover",
            cause: "not a problem"
        }, "no nearby discovery");
        return;
    }

    discover_callback(new FeedDriver());
};

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
FeedDriver.prototype.push = function (paramd) {
    var self = this;

    logger.info({
        method: "push",
        unique_id: self.unique_id,
        initd: paramd.initd,
        driverd: paramd.driverd
    }, "called - but inherently does nothing");

    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
FeedDriver.prototype.pull = function () {
    var self = this;

    logger.info({
        method: "pull",
        unique_id: self.unique_id
    }, "called");

    self._fetch();

    return self;
};

/* --- Internals --- */
FeedDriver.prototype._fetch = function () {
    var self = this;

    console.log("- FeedDriver._fetch", "iri", self.iri);
    unirest
        .get(self.iri)
        .end(function (result) {
            if (result.error) {
                console.log("# FeedDriver._fetch: can't get feed", result.error);
            } else {
                self._process(result.body);
            }

            self.poll_reschedule();
        });
};

FeedDriver.prototype._process = function (body) {
    var self = this;

    var s = new stream.Readable();
    s._read = function noop() {}; // redundant? see update below
    s.push(body);
    s.push(null);

    var fp = new FeedParser({
        feedurl: self.iri
    });
    fp.on('error', function () {});
    fp.on('readable', function () {
        var stream = this;
        var item = null;
        while (item = stream.read()) {
            if (item.guid === undefined) {
                continue;
            }

            if (self.seend[item.guid] && self.track_links) {
                continue;
            }
            self.seend[item.guid] = 1;

            var date = item.date;
            if (!date) {
                if (self.fresh) {
                    continue;
                }
            } else {
                item.is_fresh = date.getTime() >= self.started.getTime();
                if (self.fresh && !item.is_fresh) {
                    continue;
                }
            }

            self.pulled(self._flatten(item));
        }
    });

    s.pipe(fp);
};

FeedDriver.prototype._flatten = function (od) {
    var self = this;

    var nd = {};

    for (var okey in od) {
        var ovalue = od[okey];
        var nkey = okey.toLowerCase().replace(/[^a-z0-9]/g, '_');

        if (_.isString(ovalue)) {
            if (ovalue.length !== 0) {
                nd[nkey] = ovalue;
            }
        } else if (_.isArray(ovalue)) {
            if (ovalue.length !== 0) {
                nd[nkey] = ovalue;
            }
        } else if (_.isDate(ovalue)) {
            nd[nkey] = ovalue;
        } else if (_.isObject(ovalue)) {
            if (_.isEmpty(ovalue)) {
                continue;
            }

            var ohash = ovalue['#'];
            if (ohash === undefined) {
                continue;
            } else {
                nd[nkey] = ovalue['#'];
            }

            var oat = ovalue['@'];
            if (oat !== undefined) {
                for (var skey in oat) {
                    var svalue = oat[skey];
                    skey = skey.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    nd[nkey + "_" + skey] = svalue;
                }
            }
        } else {
            nd[nkey] = ovalue;
        }
    }

    return nd;
};

/* --- API --- */
exports.Driver = FeedDriver;
