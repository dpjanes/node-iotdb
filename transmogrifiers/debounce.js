/*
 *  transmogrifiers/debounce.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-11-18
 *
 *  Debounce events by some period of time
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

var iotdb = require('iotdb');
var _ = require("../helpers");
var transmogrifier = require('../transmogrifier');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'transmogrifier/debounce',
});

/**
 */
var DebounceTransmogrifier = function (initd) {
    var self = this;
    
    initd = _.defaults(initd, {
        timeout: 100
    });

    self.___debounce = initd.timeout;
    self.___timeoutId = null;
    self.___d = {};
};

DebounceTransmogrifier.prototype = new transmogrifier.Transmogrifier();
DebounceTransmogrifier.prototype.transmogrifier_id = "iot-transmogrifier:debounce";

/**
 *  Changing the way 'on' works
 */
DebounceTransmogrifier.prototype.on = function(key, callback) {
};

/**
 *  Changing the way 'on_bounce' works
 */
DebounceTransmogrifier.prototype.on_change = function(callback) {
};

exports.Transmogrifier = DebounceTransmogrifier;
