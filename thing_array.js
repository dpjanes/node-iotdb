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
var assert = require('assert');

/* --- constants --- */
var VERBOSE = true;
var EVENT_THING_NEW = 'EVENT_THING_NEW'
var EVENT_THING_PUSHED = 'EVENT_THING_PUSHED'
var EVENT_THINGS_CHANGED = 'EVENT_THINGS_CHANGED'

var KEY_SETTER = 'SETTER'

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

    self.length = 0
    self.transaction_depth = 0

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
ThingArray.prototype.push = function(thing, paramd) {
    var self = this

    paramd = _.defaults(paramd, {
        emit_pushed: true,
        emit_new: true
    })

    Array.prototype.push.call(self, thing);

    /*
     *  event dispatch
     */
    if (paramd.emit_pushed) {
        self.emit(EVENT_THING_PUSHED, thing)
    }
    if (paramd.emit_new) {
        self.emit(EVENT_THING_NEW, thing)
    }

    /*
     *  Do persistent commands. Always within a transaction
     */
    if ((self._persistds != null) && (self._persistds.length > 0)) {
        thing.start()

        for (var pi in self._persistds) {
            var pd = self._persistds[pi]
            pd.f.apply(thing, Array.prototype.slice.call(pd.av));
        }

        thing.end()
    }

    return self
}

/**
 *  @param {string} key - if used, only the latest command
 *  will be persisted with this key
 */
ThingArray.prototype._persist_command = function(f, av, key) {
    var self = this

    if (self._persistds === null) {
        return
    }

    var persistd = {
        f: f,
        av: av,
        key: key
    }

    /*
     *  If not in a transaction, there can only be one Setter
     */
    if ((self.transaction_depth === 0) && (key == KEY_SETTER)) {
        for (var pi = 0; pi < self._persistds.length; pi++) {
            var _persistd = self._persistds[pi]
            if (_persistd.key == KEY_SETTER) {
                self._persistds.splice(pi--, 1)
            }
        }
        
    }

    self._persistds.push(persistd)
}

/**
 */
ThingArray.prototype.splice = function() {
    var self = this

    Array.prototype.splice.apply(self, arguments)

    return self
}


/**
 *  Call {@link Thing#start Model.start} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.start = function() {
    var self = this;

    self.transaction_depth++

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

    self.transaction_depth--
    assert.ok(self.transaction_depth >= 0)

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
 *
ThingArray.prototype.get = function() {
    var self = this;
    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.get.apply(item, Array.prototype.slice.call(arguments));
    }
    return self;
}
 */

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

    self._persist_command(model.Model.prototype.set, arguments, KEY_SETTER)

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

    self._persist_command(model.Model.prototype.update, arguments, KEY_SETTER)

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
        events.EventEmitter.prototype.on.call(self, EVENT_THING_NEW, function(item) {
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
        events.EventEmitter.prototype.on.call(self, EVENT_THING_NEW, function(item) {
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
        events.EventEmitter.prototype.on.call(self, EVENT_THING_NEW, function(item) {
            item.on_change.apply(item, Array.prototype.slice.call(av));
        })
    }

    return self;
}

/**
 *  Call {@link Thing#on Model.on_meta} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.on_meta = function() {
    var self = this;
    var av = arguments

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.on_meta.apply(item, Array.prototype.slice.call(av));
    }

    /*
     *  Apply to new things
     */
    var persist = this._persistds !== null
    if (persist) {
        events.EventEmitter.prototype.on.call(self, EVENT_THING_NEW, function(item) {
            item.on_meta.apply(item, Array.prototype.slice.call(av));
        })
    }

    return self;
}

/**
 *  The callback will be called whenever a new thing is added to this array
 *
 *  @return {this}
 */
ThingArray.prototype.on_thing = function(callback) {
    var self = this;

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        callback(item)
    }

    events.EventEmitter.prototype.on.call(self, EVENT_THING_NEW, function(thing) {
        callback(thing)
    })

    return self;
}

/**
 *  Call {@link Thing#update Model.meta} on
 *  every item in the ThingArray and return
 *  the result as an Array
 *
 *  @return 
 */
ThingArray.prototype.metas = function(paramd) {
    var self = this;
    var paramd = _.defaults(paramd, {})

    var metas = []

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        metas.push(item.meta().state())
    }

    return metas;
}

/**
 *  Somehow or another, the underlying things were changed.
 *  This will bring all downstream ThingArrays into order
 */
ThingArray.prototype.things_changed = function() {
    var self = this;

    self.emit(EVENT_THINGS_CHANGED)
}


/* --- */

ThingArray.prototype._filter_test = function(d, iot, thing) {
    var thing_place_iri = thing.place_iri();
    var thing_thing_iri = thing.thing_iri();
    var place_predicates = [
        _.expand("iot:place-location"),
        _.expand("iot:place-room"),
        _.expand("iot:place-floor"),
        _.expand("iot:place-placement"),
    ];
    var meta = thing.meta()

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
            var name = meta.get('iot:name')
            if (name != dobject) {
                return false
            }
            continue
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

        // dpredicate = _.expand(dpredicate);
        var value = meta.get(dpredicate)
        if (value != dobject) {
            return false
        }
        
        /* XXX BROKEN FIX */
        /*
        if (dpredicate == _.expand("iot:place-placement")) {
            continue
        }
        */

        /*
        var subject_url = thing_thing_iri;
        if (place_predicates.indexOf(dpredicate) > -1) {
            subject_url = thing_place_iri;
        }
        
        var is_contained = iot.gm.contains_triple(subject_url, dpredicate, dobject)
        console.log(subject_url, dpredicate, dobject, is_contained);
        if (!is_contained) {
            return false
        }
         */
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
     *  When 'Things Changed' && persist: update the list.
     */
    if (persist) {
        events.EventEmitter.prototype.on.call(self, EVENT_THINGS_CHANGED, function() {
            // existing things by ID
            var oidd = {}

            for (var oi = 0; oi < out_items.length; oi++) {
                var o = out_items[oi]
                oidd[o.thing_id()] = 1
            }

            // find new things matching
            var is_updated = false

            // console.log("! ThingArray.filter/things_changed: oidd (A)", oidd)
            // console.log("! ThingArray.filter/things_changed: filter", d)

            for (var ii = 0; ii < self.length; ii++) {
                var thing = self[ii];
                var thing_id = thing.thing_id()

                if (!self._filter_test(d, iot, thing)) {
                    continue
                }

                if (oidd[thing_id]) {
                    // console.log("! ThingArray.filter/things_changed: pass", thing_id)
                    delete oidd[thing_id]
                } else {
                    // console.log("! ThingArray.filter/things_changed: found a new match", thing_id)
                    out_items.push(thing, { emit_pushed: false })
                    is_updated = true
                }
            }

            // console.log("! ThingArray.filter/things_changed: oidd (B)", oidd)

            // remove things that no longer match
            for (var oi = 0; oi < out_items.length; oi++) {
                var o = out_items[oi]
                if (!oidd[o.thing_id()]) {
                    continue
                }

                // console.log("! ThingArray.filter/things_changed: remove old match", o.thing_id())
                out_items.splice(oi--, 1)
                is_updated = true
            }

            /*
             *  notify downstream - note that we always do this because
             *  even though this list may not have changed, filters 
             *  downstream may have changed
             */
            out_items.things_changed()
        })

        /*
         *  Things being added propagates downstream. Note how
         *  above with { emit_pushed: false } we stop this from being
         *  unnecessarily being called
         */
        events.EventEmitter.prototype.on.call(self, EVENT_THING_PUSHED, function(thing) {
            out_items.things_changed()
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

ThingArray.prototype.with_number = function(number) {
    return this.filter({ "iot:number" : parseInt(number) })
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
