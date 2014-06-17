/*
 *  meta_thing.js
 *
 *  David Janes
 *  IOTDB
 *  2014-05-29
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
