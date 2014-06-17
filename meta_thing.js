/*
 *  meta_thing.js
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

/**
 *  This represents the Thing data in the graph.
 *  Typically this comes from IOTDB
 */
var MetaThing = function(iot, model) {
    var self = this;

    self.iot = iot
    self.model = model

    self.thing_iri = self.model.device_iri()
}

/**
 *  Return a dictionary of the Thing data.
 *  Ignores the fact that objects can repeat
 */
MetaThing.prototype.dictionary = function() {
    var self = this;

    var d = []
    var tds = self.iot.gm.get_triples(self.thing_iri, null, null)
    for (var tx in tds) {
        var td = tds[tx]
        if (td.predicate == 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
            continue
        } else if (td.predicate == 'rdfs:type') {
            continue
        }

        d[td.predicate] = td.object_value
    }

    return d
}

/**
 *  Returns Thing value for the key.
 */
MetaThing.prototype.get = function(key, otherwise) {
    var self = this;

    if (!self.thing_iri) {
        console.log("# Thing.get: no iotdb object")
        return otherwise
    }

    var object = self.iot.gm.get_object(self.thing_iri, key)
    if (object === null) {
        return otherwise
    }

    return object
}

exports.MetaThing = MetaThing
