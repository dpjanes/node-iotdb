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

"use strict";

var _ = require("./helpers");
var attribute = require("./attribute");
var model = require("./model");
var events = require('events');
var util = require('util');
var assert = require('assert');

/* --- constants --- */
var VERBOSE = true;
var EVENT_THING_NEW = 'EVENT_THING_NEW';
var EVENT_THING_PUSHED = 'EVENT_THING_PUSHED';
var EVENT_THINGS_CHANGED = 'EVENT_THINGS_CHANGED';

var KEY_SETTER = 'SETTER';
var array_id = 0;

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
var ThingArray = function (paramd) {
    var self = this;

    paramd = _.defaults(paramd, {});

    self.array_id = '__thing_array_' + array_id++;
    self.length = 0;
    self.transaction_depth = 0;

    /*
     *  If paramd.persist is true, create an array for peristing commands
     */
    this._persistds = null;
    if (paramd.persist) {
        this._persistds = [];
    }

    events.EventEmitter.call(self);
};

ThingArray.prototype = new Array(); // jshint ignore:line
util.inherits(ThingArray, events.EventEmitter);
ThingArray.prototype._instanceof_ThingArray = true;

/**
 *  Add a new thing to this ThingArray.
 */
ThingArray.prototype.push = function (thing, paramd) {
    var self = this;

    /*
     *  If the Thing is already in the array
     *  we do nothing. There may be a deeper bug
     *  causing this to happen, but I can't find it
     */
    for (var ti = 0; ti < self.length; ti++) {
        var t = self[ti];
        if (t === thing) {
            logger.error({
                method: "push",
                thing_id: thing.thing_id(),
            }, "preventing same Thing from being pushed");
            return;
        }
    }

    /*
     */
    paramd = _.defaults(paramd, {
        emit_pushed: true,
        emit_new: true
    });

    thing[self.array_id] = self;
    Array.prototype.push.call(self, thing);

    /*
     *  event dispatch
     */
    if (paramd.emit_pushed) {
        self.emit(EVENT_THING_PUSHED, thing);
    }
    if (paramd.emit_new) {
        self.emit(EVENT_THING_NEW, thing);
    }

    /*
     *  Do persistent commands. Always within a transaction
     */
    if ((self._persistds != null) && (self._persistds.length > 0)) {
        thing.start();

        for (var pi in self._persistds) {
            var pd = self._persistds[pi];
            pd.f.apply(thing, Array.prototype.slice.call(pd.av));
        }

        thing.end();
    }

    return self;
};

/**
 *  Return true iff this is a persisting array
 */
ThingArray.prototype.is_persist = function () {
    return this._persistds != null;
}

/**
 *  @param {string} key - if used, only the latest command
 *  will be persisted with this key
 */
ThingArray.prototype._persist_command = function (f, av, key) {
    var self = this;

    if (self._persistds === null) {
        return;
    }

    var persistd = {
        f: f,
        av: av,
        key: key
    };

    /*
     *  If not in a transaction, there can only be one Setter
     */
    if ((self.transaction_depth === 0) && (key === KEY_SETTER)) {
        for (var pi = 0; pi < self._persistds.length; pi++) {
            var _persistd = self._persistds[pi];
            if (_persistd.key === KEY_SETTER) {
                self._persistds.splice(pi--, 1);
            }
        }

    }

    self._persistds.push(persistd);
};

/**
 */
ThingArray.prototype.splice = function (index, howmany, add1) {
    var self = this;

    // sorry
    assert.ok(add1 === undefined);

    if (howmany) {
        for (var i = 0; i < howmany; i++) {
            var x = index + i;
            if (x < self.length) {
                delete self[x][self.array_id];
            }
        }
    }

    Array.prototype.splice.apply(self, arguments);

    return self;
};

/**
 *  Return true iff thing is in this
 */
ThingArray.prototype.contains = function (thing) {
    var self = this;

    if (!thing) {
        return false;
    } else if (_.isModel(thing)) {
        return false;
    } else {
        return thing[self.array_id] = self;
    }
};


/**
 *  Call {@link Thing#start Model.start} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.start = function () {
    var self = this;

    self.transaction_depth++;

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.start.apply(item, Array.prototype.slice.call(arguments));
    }

    return self;
};

/**
 *  Call {@link Thing#end Model.end} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.end = function () {
    var self = this;

    self.transaction_depth--;
    assert.ok(self.transaction_depth >= 0);

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.end.apply(item, Array.prototype.slice.call(arguments));
    }
    return self;
};

var _merger = function (srcs, out_items) {
    var o;
    var oi;

    /**
     *  Existing things
     */
    var oidd = {};

    for (oi = 0; oi < out_items.length; oi++) {
        o = out_items[oi];
        oidd[o.thing_id()] = 1;
    }

    /**
     *  New things, from any of the srcs
     */
    for (var si in srcs) {
        var src = srcs[si];

        for (var ii = 0; ii < src.length; ii++) {
            var thing = src[ii];
            var thing_id = thing.thing_id();

            if (oidd[thing_id]) {
                delete oidd[thing_id];
            } else {
                out_items.push(thing, {
                    emit_pushed: false
                });
            }
        }
    }

    /**
     *  remove things that no longer match
     */
    for (oi = 0; oi < out_items.length; oi++) {
        o = out_items[oi];
        if (!oidd[o.thing_id()]) {
            continue;
        }

        out_items.splice(oi--, 1);
    }

    /*
     *  notify downstream - note that we always do this because
     *  even though this list may not have changed, filters
     *  downstream may have changed
     */
    out_items.things_changed();
};

/**
 *  Merge another array into this one
 */
ThingArray.prototype.merge = function (new_items) {
    var self = this;

    /*
     *  Merge (XXX: not sure if should always be persist)
     */
    var out_items = new ThingArray({
        persist: true
    });
    var srcs = [
        self,
        new_items
    ];

    _merger(srcs, out_items);

    /*
     *  Persist the merging
     */
    var _on_things_changed = function () {
        _merger(srcs, out_items);
    };

    for (var si in srcs) {
        var src = srcs[si];
        if (src._persistds === null) {
            continue;
        }

        events.EventEmitter.prototype.on.call(src, EVENT_THINGS_CHANGED, _on_things_changed);
    }

    return out_items;
};

/**
 *  Call IOT.connect() and join all the resulting 
 *  items into this ThingArray. This lets several
 *  connect() calls be chained.
 *
 *  <pre>
    things = iot
       .connect('SomeThing')
       .connect('AnotherThing')

    things = iot
        .connect('HueLight')
        .with_name('Hue Light 1')
        .connect('WeMoSwitch')
   </pre>
 *
 *  @return {this}
 */
ThingArray.prototype.connect = function () {
    var self = this;
    var iot = require('./iotdb').iot();

    return self.merge(iot.connect.apply(iot, Array.prototype.slice.call(arguments)));
};

/**
 *  Call {@link Thing#set Model.set} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.set = function () {
    var self = this;
    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.set.apply(item, Array.prototype.slice.call(arguments));
    }

    self._persist_command(model.Model.prototype.set, arguments, KEY_SETTER);

    return self;
};

/**
 *  Call {@link Thing#update Model.update} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.update = function () {
    var self = this;
    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.update.apply(item, Array.prototype.slice.call(arguments));
    }

    self._persist_command(model.Model.prototype.update, arguments, KEY_SETTER);

    return self;
};

/**
 *  Call {@link Thing#pull Model.pull} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.pull = function () {
    var self = this;

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.pull.apply(item, Array.prototype.slice.call(arguments));
    }

    self._persist_command(model.Model.prototype.pull, arguments);

    /*
     *  Apply to new things
     *  XXX - why isn't this using _persist_command
    var persist = this._persistds !== null
    if (persist) {
        events.EventEmitter.prototype.on.call(self, EVENT_THING_NEW, function(item) {
            item.pull.apply(item, Array.prototype.slice.call(arguments));
        })
    }
     */

    return self;
};

/**
 *  Call {@link Thing#pull Model.tag} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.tag = function () {
    var self = this;

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.tag.apply(item, Array.prototype.slice.call(arguments));
    }

    self._persist_command(model.Model.prototype.tag, arguments);

    return self;
};

/**
 *  Call {@link Thing#on Model.on} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.on = function () {
    var self = this;
    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.on.apply(item, Array.prototype.slice.call(arguments));
    }

    self._persist_command(model.Model.prototype.on, arguments);

    /*
     *  Apply to new things
    var persist = this._persistds !== null
    if (persist) {
        events.EventEmitter.prototype.on.call(self, EVENT_THING_NEW, function(item) {
            item.on.apply(item, Array.prototype.slice.call(arguments));
        })
    }
     */

    return self;
};

/**
 *  Call {@link Thing#on Model.on_change} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.on_change = function () {
    var self = this;
    var av = arguments;

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.on_change.apply(item, Array.prototype.slice.call(av));
    }

    self._persist_command(model.Model.prototype.on_change, arguments);

    /*
     *  Apply to new things
    var persist = this._persistds !== null
    if (persist) {
        events.EventEmitter.prototype.on.call(self, EVENT_THING_NEW, function(item) {
            item.on_change.apply(item, Array.prototype.slice.call(av));
        })
    }
     */

    return self;
};

/**
 *  Call {@link Thing#on Model.on_meta} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.on_meta = function () {
    var self = this;
    var av = arguments;

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        item.on_meta.apply(item, Array.prototype.slice.call(av));
    }

    self._persist_command(model.Model.prototype.on_meta, arguments);

    /*
     *  Apply to new things
    var persist = this._persistds !== null
    if (persist) {
        events.EventEmitter.prototype.on.call(self, EVENT_THING_NEW, function(item) {
            item.on_meta.apply(item, Array.prototype.slice.call(av));
        })
    }
     */

    return self;
};

/**
 *  The callback will be called whenever a new thing is added to this array
 *
 *  @return {this}
 */
ThingArray.prototype.on_thing = function (callback) {
    var self = this;

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        callback(item);
    }

    events.EventEmitter.prototype.on.call(self, EVENT_THING_NEW, function (thing) {
        callback(thing);
    });

    return self;
};

/**
 *  Call {@link Thing#update Model.meta} on
 *  every item in the ThingArray and return
 *  the result as an Array
 *
 *  @return
 */
ThingArray.prototype.metas = function (paramd) {
    var self = this;
    paramd = _.defaults(paramd, {});

    var metas = [];

    for (var ii = 0; ii < self.length; ii++) {
        var item = self[ii];
        metas.push(item.meta().state());
    }

    return metas;
};

/**
 *  Somehow or another, the underlying things were changed.
 *  This will bring all downstream ThingArrays into order
 */
ThingArray.prototype.things_changed = function () {
    var self = this;

    self.emit(EVENT_THINGS_CHANGED);
};


/* --- */

ThingArray.prototype._filter_test = function (d, iot, thing) {
    var thing_place_iri = thing.place_iri();
    var thing_thing_iri = thing.thing_iri();
    var place_predicates = [
        _.expand("iot:place-location"),
        _.expand("iot:place-room"),
        _.expand("iot:place-floor"),
        _.expand("iot:place-placement"),
    ];
    var meta = thing.meta();

    for (var dpredicate in d) {
        var dobject = d[dpredicate];
        if (dpredicate === "_location") {
            dpredicate = _.expand("iot:place-location");
        } else if (dpredicate === "_room") {
            dpredicate = _.expand("iot:place-room");
        } else if (dpredicate === "_floor") {
            dpredicate = _.expand("iot:place-floor");
        } else if (dpredicate === "_driver") {
            var driver_got = thing.identity().driver;
            var driver_want = dobject;

            if (driver_got !== driver_want) {
                return false;
            }

            continue;
        } else if (dpredicate === "_name") {
            var name = meta.get('iot:name');
            if (name !== dobject) {
                return false;
            }
            continue;
        } else if (dpredicate === "_code") {
            if (thing.code !== dobject) {
                return false;
            }
            continue;
        } else if (dpredicate === "_tag") {
            if (!thing.has_tag(dobject)) {
                return false;
            }
            continue;
        } else {
            dpredicate = _.expand(dpredicate);
        }


        var value = meta.get(dpredicate);
        if (value === undefined) {
            return false;
        } else if (_.isArray(value)) {
            return value.indexOf(dobject) > -1;
        } else {
            return value === dobject;
        }
    }

    return true;
};

/**
 */
ThingArray.prototype.filter = function (d) {
    var self = this;
    var persist = this._persistds !== null;
    var o;
    var oi;

    var out_items = new ThingArray({
        persist: persist
    });
    var iot = require('./iotdb').iot();

    for (var ii = 0; ii < self.length; ii++) {
        var thing = self[ii];

        if (self._filter_test(d, iot, thing)) {
            out_items.push(thing);
        }
    }

    if (out_items.length === 0) {
        // console.log("# ThingArray.filter: warning - nothing matched", d)
    }

    /*
     *  When 'Things Changed' && persist: update the list.
     */
    if (persist) {
        events.EventEmitter.prototype.on.call(self, EVENT_THINGS_CHANGED, function () {
            // existing things by ID
            var oidd = {};

            for (oi = 0; oi < out_items.length; oi++) {
                o = out_items[oi];
                oidd[o.thing_id()] = 1;
            }

            // find new things matching
            var is_updated = false;

            // console.log("! ThingArray.filter/things_changed: oidd (A)", oidd)
            // console.log("! ThingArray.filter/things_changed: filter", d)

            for (var ii = 0; ii < self.length; ii++) {
                var thing = self[ii];
                var thing_id = thing.thing_id();

                if (!self._filter_test(d, iot, thing)) {
                    continue;
                }

                if (oidd[thing_id]) {
                    // console.log("! ThingArray.filter/things_changed: pass", thing_id)
                    delete oidd[thing_id];
                } else {
                    // console.log("! ThingArray.filter/things_changed: found a new match", thing_id)
                    out_items.push(thing, {
                        emit_pushed: false
                    });
                    is_updated = true;
                }
            }

            // console.log("! ThingArray.filter/things_changed: oidd (B)", oidd)

            // remove things that no longer match
            for (oi = 0; oi < out_items.length; oi++) {
                o = out_items[oi];
                if (!oidd[o.thing_id()]) {
                    continue;
                }

                // console.log("! ThingArray.filter/things_changed: remove old match", o.thing_id())
                out_items.splice(oi--, 1);
                is_updated = true;
            }

            /*
             *  notify downstream - note that we always do this because
             *  even though this list may not have changed, filters
             *  downstream may have changed
             */
            out_items.things_changed();
        });

        /*
         *  Things being added propagates downstream. Note how
         *  above with { emit_pushed: false } we stop this from being
         *  unnecessarily being called
         */
        events.EventEmitter.prototype.on.call(self, EVENT_THING_PUSHED, function (thing) {
            out_items.things_changed();
        });
    }

    return out_items;
};

ThingArray.prototype.with_room = function (name) {
    return this.filter({
        "iot:place-room": name
    });
};

ThingArray.prototype.with_floor = function (name) {
    return this.filter({
        "iot:place-floor": name
    });
};

ThingArray.prototype.with_location = function (name) {
    return this.filter({
        "iot:place-location": name
    });
};

ThingArray.prototype.with_code = function (code) {
    return this.filter({
        "_code": code
    });
};

ThingArray.prototype.with_name = function (name) {
    return this.filter({
        "_name": name
    });
};

ThingArray.prototype.with_number = function (number) {
    return this.filter({
        "iot:number": parseInt(number)
    });
};

ThingArray.prototype.with_tag = function (tag) {
    return this.filter({
        "_tag": tag
    });
};

ThingArray.prototype.with_facet = function (facet) {
    return this.filter({
        "iot:facet": _.expand(facet, "iot-facet:")
    });
};

ThingArray.prototype.with_driver = function (driver) {
    return this.filter({
        "_driver": _.expand(driver, "iot-driver:")
    });
};

ThingArray.prototype.with_model = function (model) {
    var iot = require('./iotdb').iot();

    var modeld = {};
    iot._clarify_model(modeld, model);

    return this.filter({
        "_code": modeld.model_code
    });
};


ThingArray.prototype.apply = function (paramd, f) {
    var self = this;

    if (_.isFunction(paramd)) {
        f = paramd;
        paramd = {};
    }

    var results = [];
    for (var ii = 0; ii < self.length; ii++) {
        var in_item = self[ii];
        var result = f(in_item, paramd);
        if (result !== undefined) {
            results.push(result);
        }
    }
    return results;
};

ThingArray.prototype.after = function (delay, f) {
    var self = this;

    setTimeout(f, delay, self);
};

exports.ThingArray = ThingArray;
