/*
 *  thing_array.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-01
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

var _ = require("./helpers")
var attribute = require("./attribute")
var model = require("./model")
var events = require('events');
var util = require('util');

/* --- constants --- */
var VERBOSE = true;
var EVENT_NEW_THING = 'EVENT_NEW_THING'

/**
 *  An array for holding {@link Thing}s. When the
 *  methods
 *  {@link ThingArray#start start},
 *  {@link ThingArray#start set},
 *  {@link ThingArray#start end}, or
 *  {@link ThingArray#start get}
 *  are called, that exact method with all the 
 *  arguments are called on each item in the array.
 *
 *  @constructor
 */
var ThingArray = function(paramd) {
    var self = this

    paramd = _.defaults(paramd, {})

    self.depth = 0
    self.length = 0

    /*
     *  If paramd.persist is true, create an array for peristing commands
     */
    this._persistds = null
    if (paramd.persist) {
        this._persistds = []
    }

    events.EventEmitter.call(self);
}

ThingArray.prototype = new Array;
util.inherits(ThingArray, events.EventEmitter);
ThingArray.prototype._instanceof_ThingArray = true

/**
 *  Add a new thing to this ThingArray.
 */
ThingArray.prototype.push = function(thing) {
    var self = this

    Array.prototype.push.call(self, thing);

    /*
     *  event dispatch
     */
    self.emit(EVENT_NEW_THING, thing)

    /*
     *  Do persistent commands
     */
    if (self._persistds != null) {
        for (var pi in self._persistds) {
            var pd = self._persistds[pi]
            pd.f.apply(thing, Array.prototype.slice.call(pd.av));
        }
    }

    return self
}

/**
 */
ThingArray.prototype._persist_command = function(f, av) {
    var self = this

    if (self._persistds === null) {
        return
    }

    if (self.depth === 0) {
        self.perists = []
    }

    self._persistds.push({
        f: f,
        av: av
    })
}


/**
 *  Call {@link Thing#start Model.start} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.start = function() {
    var self = this;
    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.start.apply(item, Array.prototype.slice.call(arguments));
    }
    return self;
}

/**
 *  Call {@link Thing#end Model.end} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.end = function() {
    var self = this;
    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.end.apply(item, Array.prototype.slice.call(arguments));
    }
    return self;
}

/**
 *  Call {@link Thing#get Model.get} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.get = function() {
    var self = this;
    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.get.apply(item, Array.prototype.slice.call(arguments));
    }
    return self;
}

/**
 *  Call {@link Thing#set Model.set} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.set = function() {
    var self = this;
    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.set.apply(item, Array.prototype.slice.call(arguments));
    }

    self._persist_command(model.Model.prototype.set, arguments)

    return self;
}

/**
 *  Call {@link Thing#update Model.update} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.update = function() {
    var self = this;
    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.update.apply(item, Array.prototype.slice.call(arguments));
    }

    self._persist_command(model.Model.prototype.update, arguments)

    return self;
}

/**
 *  Call {@link Thing#pull Model.pull} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.pull = function() {
    var self = this;

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.pull.apply(item, Array.prototype.slice.call(arguments));
    }

    /*
     *  Apply to new things
     */
    var persist = this._persistds !== null
    if (persist) {
        events.EventEmitter.prototype.on.call(self, EVENT_NEW_THING, function(item) {
            item.pull.apply(item, Array.prototype.slice.call(arguments));
        })
    }

    return self;
}

/**
 *  Call {@link Thing#on Model.on} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.on = function() {
    var self = this;
    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.on.apply(item, Array.prototype.slice.call(arguments));
    }

    /*
     *  Apply to new things
     */
    var persist = this._persistds !== null
    if (persist) {
        events.EventEmitter.prototype.on.call(self, EVENT_NEW_THING, function(item) {
            item.on.apply(item, Array.prototype.slice.call(arguments));
        })
    }

    return self;
}

/**
 *  Call {@link Thing#on Model.on_change} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.on_change = function() {
    var self = this;
    var av = arguments

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.on_change.apply(item, Array.prototype.slice.call(av));
    }

    /*
     *  Apply to new things
     */
    var persist = this._persistds !== null
    if (persist) {
        events.EventEmitter.prototype.on.call(self, EVENT_NEW_THING, function(item) {
            item.on_change.apply(item, Array.prototype.slice.call(av));
        })
    }

    return self;
}

/**
 *  This will be called whenever a new thing is added to this array
 *
 *  @return {this}
 */
ThingArray.prototype.on_thing = function(callback) {
    var self = this;

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        callback(item)
    }

    events.EventEmitter.prototype.on.call(self, EVENT_NEW_THING, function(thing) {
        callback(thing)
    })

    return self;
}

ThingArray.prototype._filter_test = function(d, iot, thing) {
    var thing_place_iri = thing.place_iri();
    var thing_thing_iri = thing.thing_iri();
    var place_predicates = [
        _.expand("iot:place-location"),
        _.expand("iot:place-room"),
        _.expand("iot:place-floor"),
        _.expand("iot:place-placement"),
    ];

    for (var dpredicate in d) {
        var dobject = d[dpredicate];
        if (dpredicate == "_location") {
            dpredicate = _.expand("iot:place-location")
        } else if (dpredicate == "_room") {
            dpredicate = _.expand("iot:place-room")
        } else if (dpredicate == "_floor") {
            dpredicate = _.expand("iot:place-floor")
        } else if (dpredicate == "_driver") {
            var driver_got = thing.identity().driver
            var driver_want = dobject

            if (driver_got != driver_want) {
                return false
            }

            continue
        } else if (dpredicate == "_name") {
            dpredicate = _.expand("iot:name")
            /*
            if (thing.name != dobject) {
                ok = false;
                break;
            }
            continue
            */
        } else if (dpredicate == "_code") {
            if (thing.code != dobject) {
                return false
            }
            continue
        } else if (dpredicate == "_tag") {
            if (!thing.has_tag(dobject)) {
                return false
            }
            continue
        }

        dpredicate = _.expand(dpredicate);
        
        /* XXX BROKEN FIX */
        /*
        if (dpredicate == _.expand("iot:place-placement")) {
            continue
        }
        */

        var subject_url = thing_thing_iri;
        /*
        if (place_predicates.indexOf(dpredicate) > -1) {
            subject_url = thing_place_iri;
        }
         */
        
        var is_contained = iot.gm.contains_triple(subject_url, dpredicate, dobject)
        // console.log(subject_url, dpredicate, dobject, is_contained);
        if (!is_contained) {
            return false
        }
    }

    return true
}

/**
 */
ThingArray.prototype.filter = function(d) {
    var self = this;
    var persist = this._persistds !== null

    var out_items = new ThingArray({
        persist: persist
    });
    var iot = require('./iotdb').iot()

    for (var ii = 0; ii < self.length; ii++) {
        var thing = self[ii];

        if (self._filter_test(d, iot, thing)) {
            out_items.push(thing);
        }
    }

    if (out_items.length == 0) {
        console.log("# ThingArray.filter: warning - nothing matched", d)
    }

    /*
     */
    if (persist) {
        events.EventEmitter.prototype.on.call(self, EVENT_NEW_THING, function(thing) {
            if (self._filter_test(d, iot, thing)) {
                out_items.push(thing);
            }
        })
    }

    return out_items;
}

ThingArray.prototype.with_room = function(name) {
    return this.filter({ "iot:place-room" : name })
}

ThingArray.prototype.with_floor = function(name) {
    return this.filter({ "iot:place-floor" : name })
}

ThingArray.prototype.with_location = function(name) {
    return this.filter({ "iot:place-location" : name })
}

ThingArray.prototype.with_code = function(code) {
    return this.filter({ "_code" : code })
}

ThingArray.prototype.with_name = function(name) {
    return this.filter({ "_name" : name })
}

ThingArray.prototype.with_tag = function(tag) {
    return this.filter({ "_tag" : tag })
}

ThingArray.prototype.with_facet = function(facet) {
    if (facet.substring(0, 1) == '_') {
        facet = "iot-facet:" + facet.substring(1)
    }
    return this.filter({ "iot:facet" : _.expand(facet) })
}

ThingArray.prototype.with_driver = function(driver) {
    return this.filter({ "_driver" : _.expand(driver, "iot-driver:") })
}

ThingArray.prototype.with_model = function(model) {
    var iot = require('./iotdb').iot()

    var modeld = {}
    iot._clarify_model(modeld, model)

    return this.filter({ "_code" : modeld.model_code })
}


ThingArray.prototype.apply = function(paramd, f) {
    var self = this

    if (_.isFunction(paramd)) {
        f = paramd
        paramd = {}
    }

    var results = []
    for (var ii = 0; ii < self.length; ii++) {
        var in_item = self[ii];
        var result = f(in_item, paramd)
        if (result !== undefined) {
            results.push(result)
        }
    }
    return results;
}

ThingArray.prototype.after = function(delay, f) {
    var self = this;

    setTimeout(f, delay, self)
}

exports.ThingArray = ThingArray;
