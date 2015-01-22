/*
 *  meta.js
 *
 *  David Janes
 *  IOTDB
 *  2014-05-29
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
var Meta = function (iot, thing) {
    var self = this;

    self.iot = iot;
    self.thing = thing;

    self.thing_iri = self.thing.thing_iri();

    // updated metadata
    self.updated = {};
};

/**
 *  Return the metadata
 */
Meta.prototype.state = function () {
    var self = this;

    var metad = {};
    metad[_.expand('iot:thing')] = self.thing_iri;
    metad[_.expand('iot:model')] = self.thing.model_code_iri();
    metad[_.expand('iot:name')] = self.thing.name;   // ultimate fallback

    if (!self.iot.gm.has_subject(self.thing_iri)) {
        _.extend(metad, self.thing.driver_meta());

        _.ld.extend(metad, _.expand("iot:facet"), _.ld.expand(self.thing.__facets));
    } else {
        var tds = self.iot.gm.get_triples(self.thing_iri, null, null);
        for (var tx in tds) {
            var td = tds[tx];
            if (td.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                continue;
            } else if (td.predicate === 'rdfs:type') {
                continue;
            }

            metad[td.predicate] = td.object_value;
        }
    }

    _.extend(metad, self.updated);

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
    assert.ok(self.thing_iri);

    key = _.expand(key);

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
    assert.ok(self.thing_iri);

    key = _.expand(key);

    if (self.updated[key] !== value) {
        self.updated[key] = value;
        self.thing.meta_changed();
    }
};

/**
 *  'ind' must be expanded!
 */
Meta.prototype.update = function (ind) {
    var self = this;
    assert.ok(self.thing_iri);

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

        self.updated[in_key] = in_value;
        changed = true;
    }

    if (changed) {
        self.thing.meta_changed();
        return true;
    }

    return false;
};

exports.Meta = Meta;
