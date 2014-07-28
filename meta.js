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

"use strict"

var _ = require("./helpers.js")
var assert = require("assert")

/**
 *  This represents the Thing data in the graph.
 *  Typically this comes from IOTDB
 */
var Meta = function(iot, thing) {
    var self = this;

    self.iot = iot
    self.thing = thing

    self.thing_iri = self.thing.thing_iri()

    // updated metadata
    self.updated = {}
}

/**
 *  Return the metadata
 */
Meta.prototype.state = function() {
    var self = this;

    var metad = {}
    metad[_.expand('iot:thing')] = self.thing_iri
    metad[_.expand('iot:model')] = self.thing.model_code_iri()

    if (!self.iot.gm.has_subject(self.thing_iri)) {
        _.extend(metad, self.thing.driver_meta())
    } else {
        var tds = self.iot.gm.get_triples(self.thing_iri, null, null)
        for (var tx in tds) {
            var td = tds[tx]
            if (td.predicate == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
                continue
            } else if (td.predicate == 'rdfs:type') {
                continue
            }

            metad[td.predicate] = td.object_value
        }
    }

    _.extend(metad, self.updated)

    return metad
}

/**
 *  Returns meta value for the key. 
 *
 *  @param {string} key
 *  An IRI or expandable string 
 *
 *  @param {*} otherwise
 *  The value to return if the key is not for
 */
Meta.prototype.get = function(key, otherwise) {
    var self = this;
    assert.ok(self.thing_iri)

    key = _.expand(key)

    var object = self.updated[key]
    if (object !== undefined) {
        return object
    }

    if (!self.iot.gm.has_subject(self.thing_iri)) {
        var metad = self.thing.driver_meta()
        var value = metad[key]
        if (value === undefined) {
            return otherwise
        } else {
            return value
        }
    }

    var object = self.iot.gm.get_object(self.thing_iri, key)
    if (object === null) {
        return otherwise
    }

    return object
}

/**
 *  Set a metavalue
 *
 *  @param {string} key
 *  An IRI or expandable string 
 *
 *  @param {*} value
 *  Value to set (should be simple or an Array of simple). Not expanded.
 */
Meta.prototype.set = function(key, value) {
    var self = this;
    assert.ok(self.thing_iri)

    key = _.expand(key)

    self.updated[key] = value
    self.thing.meta_changed()
}

exports.Meta = Meta
