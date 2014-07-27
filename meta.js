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

/**
 *  This represents the Thing data in the graph.
 *  Typically this comes from IOTDB
 */
var Meta = function(iot, thing) {
    var self = this;

    self.iot = iot
    self.thing = thing

    self.thing_iri = self.thing.thing_iri()
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

    return metad
}

/**
 *  Returns Thing value for the key.
 */
Meta.prototype.get = function(key, otherwise) {
    var self = this;

    if (!self.thing_iri) {
        console.log("# Meta.get: no iotdb object")
        return otherwise
    }

    key = _.expand(key)

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

exports.Meta = Meta
