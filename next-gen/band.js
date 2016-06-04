/*
 *  band.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-13
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

const events = require('events');
const util = require('util');

const _ = require("../helpers");

const Band = function () {
};

util.inherits(Band, events.EventEmitter);

Band.prototype._init = function(thing, d, band) {
    const self = this;

    self._thing = thing;
    self._d = d;
    self._band = band;
    self._timestamp = null;

    events.EventEmitter.call(self);
};

Band.prototype.set = function(key, value) {
    const self = this;

    var ud = {};
    ud[key] = value;

    self.update(ud, {
        add_timestamp: true,
    });
};

Band.prototype.get = function(key, otherwise) {
    return _.d.get(self._d, key, otherwise);
};

Band.prototype.first = function(key, otherwise) {
    return _.d.first(self._d, key, otherwise);
};

Band.prototype.list = function(key, otherwise) {
    return _.d.list(self._d, key, otherwise);
};

Band.prototype.update = function(updated, paramd) {
    paramd = _.d.compose.shallow(paramd, {
        add_timestamp: true,
        check_timestamp: true,
        notify: true,
    });

    var utimestamp = updated["@timestamp"];
    if (paramd.add_timestamp && !utimestamp) {
        utimestamp = _.timestamp.make();
    }

    if (paramd.check_timestamp && !_.timestamp.check.values(self._timestamp, utimestamp)) {
        return;
    }

    updated = _.d.transform(updated, {
        key: function(key) {
            if (key.match(/^@/)) {
                return;
            }

            return key;
        },
    });

    var is_changed = false;

    for (var ukey in updated) {
        var uvalue = updated[ukey];
        var ovalue = self._d[ukey];

        if (_.is.Equal(uvalue, ovalue)) {
            continue;
        }

        self._d[ukey] = uvalue;
        is_changed = true;

        if (paramd.emit) {
            process.nextTick(function() {
                self.emit(ukey, uvalue);
            });
        }
    }

    if (is_changed && paramd.emit) {
        process.nextTick(function() {
            self._thing.emit(self._band);
        });
    }

    return is_changed;
};

Band.prototype.timestamp = function() {
    return self._timestamp;
};

Band.prototype.state = function() {
    return _.d.clone.deep(self._d);
};

/**
 *  API
 */
exports.Band = Band;
