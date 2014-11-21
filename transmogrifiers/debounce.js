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

    self.___initd = _.defaults(initd, {
        timeout: 100
    });

    self.___timeoutId = null;
    self.___d = {};
};

DebounceTransmogrifier.prototype = new transmogrifier.Transmogrifier();
DebounceTransmogrifier.prototype.transmogrifier_id = "iot-transmogrifier:debounce";

DebounceTransmogrifier.prototype.___make = function () {
    var self = this;
    return new DebounceTransmogrifier({
        timeout: self.___initd.timeout
    });
}

DebounceTransmogrifier.prototype.___on = function (key, callback, av) {
    var self = this

    self.___d[key] = {
        callback: callback,
        av: av
    };

    if (self.___timeoutId) {
        return;
    }

    self.___timeoutId = setTimeout(function() {
        for (key in self.___d) {
            var vd = self.___d[key];
            // console.log("HERE:A", vd);
            vd.callback.apply(self.___wrapped, vd.av);
        }

        self.___timeoutId = null;
        self.___d = {};
    }, self.___initd.timeout);
}

/**
 *  Changing the way 'on' works
 */
DebounceTransmogrifier.prototype.on = function (key, callback) {
    var self = this;

    return self.___wrapped.on(key, function() {
        self.___on(key, callback, arguments);
    });
};

/**
 *  Changing the way 'on_bounce' works
 */
DebounceTransmogrifier.prototype.on_change = function (callback) {
    var self = this;
    
    return self.___wrapped.on_change(key, function() {
        self.___on("*", callback, arguments);
    });
};

exports.Transmogrifier = DebounceTransmogrifier;
