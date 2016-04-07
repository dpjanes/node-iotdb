/*
 *  logger.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-04-07
 *
 *  Copyright [2013-2016] [David P. Janes]
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

const bunyan = require("bunyan");

/**
 *  Make a new logger. Clevel people could
 *  swap this out to replace bunyan. This is 
 *  always lazy called by "logger";
 */
const make = function(initd) {
    return bunyan.createLogger(initd);
};

const _logd = {
    debug: true,
    info: true,
    error: true,
    warn: true,
    trace: true,
    fatal: true,
};

/**
 *  Set the logging levels.
 *
 *  If d.all is set, everything in _logd
 *  is set to that value first.
 */
const levels = function(d) {
    if (d.all !== undefined) {
        for (k in _logd) {
            _logd[k] = d.all;
        }
    } 

    for (var k in d) {
        _logd[k] = d[k];
    }
};

/**
 *  Turn off all logging except
 *  for fatal error messages
 */
const silent = function() {
    levels({
        all: false,
        fatal: true,
    });
};

/**
 *  Create a logger. If you don't want
 *  to use bunyan, replace 'logger.make',
 *  not this
 */
const logger = function (initd) {
    const _logger = function() {
        let l = null;

        const _make = function() {
            if (l === null) {
                l = make(initd);
            }
        };

        return {
            debug: function() {
                if (!_logd.debug) {
                    return;
                }

                _make();
                return l.debug.apply(l, arguments);
            },
            info: function() {
                if (!_logd.info) {
                    return;
                }

                _make();
                return l.info.apply(l, arguments);
            },
            warn: function() {
                if (!_logd.warn) {
                    return;
                }

                _make();
                return l.warn.apply(l, arguments);
            },
            error: function() {
                if (!_logd.error) {
                    return;
                }

                _make();
                return l.error.apply(l, arguments);
            },
            trace: function() {
                if (!_logd.trace) {
                    return;
                }

                _make();
                return l.trace.apply(l, arguments);
            },
            fatal: function() {
                if (!_logd.fatal) {
                    return;
                }

                _make();
                return l.fatal.apply(l, arguments);
            },
        };
    };

    return _logger();
};

/* --- API --- */
exports.logger = {
    make: make,
    logger: logger,
    levels: levels,
    silent: silent,
};
