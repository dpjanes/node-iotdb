/*
 *  meta.js
 *
 *  David Janes
 *  IOTDB
 *  2014-05-29
 *
 *  Copyright [2013-2015] [David P. Janes]
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

var _ = require("./helpers.js");
var assert = require("assert");

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'meta',
});

/**
 *  This represents the Thing data in the graph.
 *  Typically this comes from IOTDB
 */
var Meta = function (thing) {
    var self = this;

    self.thing = thing;
    self._updated = {};
};

/**
 *  Return the metadata
 */
Meta.prototype.state = function () {
    var self = this;

    var metad = {};
    metad[_.ld.expand('iot:thing')] = self.thing.thing_id();
    metad[_.ld.expand('schema:name')] = self.thing.name;

    if (self.thing.bridge_instance) {
        _.extend(metad, _.ld.expand(self.thing.bridge_instance.meta()));

        if (!self.thing.bridge_instance.reachable()) {
            metad[_.ld.expand('iot:reachable')] = false;
        }
    }
    _.extend(metad, self._updated);

    return metad;
};

/**
 *  Returns meta value for the key.
 *
 *  @param {string} key
 *  An IRI or expandable string
 *
 *  @param {*} otherwise
 *  The value to return if the key is not for
 */
Meta.prototype.get = function (key, otherwise) {
    var self = this;

    key = _.ld.expand(key);

    var stated = self.state();
    var value = stated[key];
    if (value !== undefined) {
        return value;
    } else {
        return otherwise;
    }
};

/**
 *  Set a metavalue
 *
 *  @param {string} key
 *  An IRI or expandable string
 *
 *  @param {*} value
 *  Value to set (should be simple or an Array of simple). Not expanded.
 */
Meta.prototype.set = function (key, value) {
    var self = this;

    key = _.ld.expand(key);

    if (self._updated[key] !== value) {
        self._updated[key] = value;
        self.thing.meta_changed();
    }

    self._updated["@timestamp"] = (new Date()).toISOString();
};

/**
 *  Update the metadata. Return 'true' if there's
 *  a change.
 *
 *  paramd.set_timestamp: anything changed, set the timestamp
 *  paramd.check_timestamp: see timestamp-conflict below
 *
 *  Timestamp-conflict - see helpers/d.js
 */
Meta.prototype.update = function (ind, paramd) {
    var self = this;
    var in_timestamp = ind["@timestamp"];

    if (!_.isObject(ind)) {
        throw new Error("not an object");
    }

    paramd = _.defaults(paramd, {
        emit: true,
        set_timestamp: false,
        check_timestamp: false,
    });

    ind = _.ld.expand(ind);
    
    if (paramd.check_timestamp && !_.d.check_timestamp(self._updated, ind)) {
        return;
    }

    var state = self.state();
    var changed = false;

    var in_keys = _.keys(ind);
    for (var ki in in_keys) {
        var in_key = in_keys[ki];
        var in_value = ind[in_key];

        var old_value = state[in_key];
        if (_.isEqual(in_value, old_value)) {
            continue;
        }

        self._updated[in_key] = in_value;
        changed = true;
    }

    if (changed && paramd.set_timestamp) {
        if (in_timestamp) {
            self._updated["@timestamp"] = in_timestamp;
        } else {
            self._updated["@timestamp"] = self._make_timestamp();
        }
    }

    if (changed) {
        if (paramd.emit) {
            self.thing.meta_changed();
        }

        return true;
    }

    return false;
};

/**
 *  Return all local updates
 */
Meta.prototype.updates = function () {
    return this._updated;
};

Meta.prototype._make_timestamp = function () {
    return (new Date()).toISOString();
};

exports.Meta = Meta;
