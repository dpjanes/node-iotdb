/*
 *  thing_set.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-01
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

const _ = require("./helpers");
const attribute = require("./attribute");
const model = require("./model");
const events = require('events');
const util = require('util');
const assert = require('assert');

const logger = _.logger.make({
    name: 'iotdb',
    module: 'thing_set',
});

/* --- constants --- */
const VERBOSE = true;
const EVENT_THING_NEW = 'EVENT_THING_NEW';
const EVENT_THING_PUSHED = 'EVENT_THING_PUSHED';
const EVENT_THINGS_CHANGED = 'EVENT_THINGS_CHANGED';

const KEY_TAG = 'TAG';
const KEY_SETTER = 'SETTER';
const PRE_KEYS = [KEY_TAG, ];
let array_id = 0;

/**
 *  An array for holding and operating on many {@link Thing}s
 *  at one time.
 *
 *  @constructor
 */
const ThingArray = function() {
    const self = this;

    self.length = 0;
    self._array_id = '__thing_set_' + array_id++;
    self._persistds = [];
    self._underlying = [];

    events.EventEmitter.call(self);
    self.setMaxListeners(0);
};

util.inherits(ThingArray, events.EventEmitter);
ThingArray.prototype._isThingArray = true;

const make = () => new ThingArray();

/**
 */
ThingArray.prototype.any = function () {
    return this._underlying.length ? this._underlying[0] : null;
};

/**
 *  This will apply the function to every element
 *  of the ThingArray. If non-undefined is returned,
 *  this will be placed in result array.
 */
ThingArray.prototype.map = function (f) {
    const self = this;
    var rs = [];
    for (var ti = 0; ti < self._underlying.length; ti++) {
        var t = self._underlying[ti];
        var r = f(t);
        if (r !== undefined) {
            rs.push(r);
        }
    }

    return rs;
};

ThingArray.prototype.forEach = function (f) {
    const self = this;
    for (var ti = 0; ti < self._underlying.length; ti++) {
        f(self._underlying[ti]);
    }
};

ThingArray.prototype.filter = function (f) {
    const self = this;

    var rs = [];
    for (var ti = 0; ti < self._underlying.length; ti++) {
        var t = self._underlying[ti];
        if (f(t)) {
            rs.push(r);
        }
    }

    return rs;
};


/**
 *  Add a new thing to this ThingArray.
 */
ThingArray.prototype.add = function (thing, paramd) {
    const self = this;

    if (!_.is.Thing(thing)) {
        throw new Error("attempt to add a non-Thing on a ThingArray");
    }

    /*
     *  If the Thing is already in the array
     *  we do nothing. There may be a deeper bug
     *  causing this to happen, but I can't find it
     */
    if (self.filter(t => t === thing).length) {
        return;
    }

    //  
    self._persist_pre(thing);

    // actual add
    paramd = _.defaults(paramd, {
        emit_pushed: true,
        emit_new: true
    });

    thing[self._array_id] = self; // TD: see if this is still necessary
    self._underlying.push(thing);
    self.length = self._underlying.length;

    // event dispatch
    var changed = false;
    if (paramd.emit_pushed) {
        self.emit(EVENT_THING_PUSHED, thing);
        changed = true;
    }
    if (paramd.emit_new) {
        self.emit(EVENT_THING_NEW, thing);
        changed = true;
    }

    if (changed) {
        self.things_changed();
    }

    // 
    self._persist_post(thing);

    return self;
};

ThingArray.prototype._persist_post = function (thing) {
    const self = this;


    self._persistds.map(function (pd) {
        if (PRE_KEYS.indexOf(pd.key) !== -1) {
            return;
        }

        pd.f.apply(thing, Array.prototype.slice.call(pd.av));
    });
};

ThingArray.prototype._persist_pre = function (thing) {
    const self = this;

    self._persistds.map(function (pd) {
        if (PRE_KEYS.indexOf(pd.key) === -1) {
            return;
        }

        pd.f.apply(thing, Array.prototype.slice.call(pd.av));
    });
};

ThingArray.prototype._persist_command = function (f, av, key) {
    const self = this;

    var persistd = {
        f: f,
        av: av,
        key: key
    };

     // there can only be one Setter
    if (key === KEY_SETTER) {
        self._persistds = self._persistds.filter(p => p.key !== key);
    }

    self._persistds.push(persistd);
};

/**
 *  Apply the command to everything in the ThingArray right now.
 */
ThingArray.prototype._apply_command = function (f, av) {
    this.forEach(thing => f.apply(thing, Array.prototype.slice.call(av)));
};


/**
 */
ThingArray.prototype.splice = function (index, howmany, add1) {
    const self = this;

    // sorry
    assert.ok(add1 === undefined);

    if (howmany) {
        for (var i = 0; i < howmany; i++) {
            var x = index + i;
            if (x < self.length) {
                delete self._underlying[x][self._array_id];
            }
        }
    }

    self._underlying.splice(index, howmany, add1);
    self.length = self._underlying.length;

    return self;
};

const _merger = function (srcs, out_items) {
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
    const self = this;

    /*
     *  Merge (XXX: not sure if should always be persist)
     */
    var out_items = make({
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
        logger.trace({
            method: "merge/_on_things_changed",
            in_array_1: srcs[0]._array_id,
            in_array_2: srcs[1]._array_id,
            out_array: out_items._array_id,
        }, "called");

        _merger(srcs, out_items);
    };

    for (var si in srcs) {
        var src = srcs[si];

        events.EventEmitter.prototype.on.call(src, EVENT_THINGS_CHANGED, _on_things_changed);
    }

    logger.info({
        method: "merge",
        in_array_1: srcs[0]._array_id,
        in_array_2: srcs[1]._array_id,
        out_array: out_items._array_id,
    }, "merged array");

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
ThingArray.prototype.connect = function (modeld) {
    const self = this;

    var iot = require('./iotdb').iot();

    return self.merge(
        iot.connect.apply(iot, Array.prototype.slice.call(arguments))
    );
};

/**
 *  Call {@link Thing#update Model.disconnect} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.disconnect = function () {
    const self = this;

    self._apply_command(model.Model.prototype.disconnect, arguments);
    self._persist_command(model.Model.prototype.disconnect, arguments);

    return self;
};

/**
 *  Call {@link Thing#update Model.name} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.name = function (name) {
    const self = this;

    assert(_.is.String(name));

    self._apply_command(model.Model.prototype.name, arguments);
    self._persist_command(model.Model.prototype.name, arguments);

    return self;
};

/**
 *  Call {@link Thing#update Model.zones} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.zones = function (zones) {
    const self = this;

    assert(_.is.String(zones) || _.is.Array(zones));

    self._apply_command(model.Model.prototype.zones, arguments);
    self._persist_command(model.Model.prototype.zones, arguments);

    return self;
};

/**
 *  Call {@link Thing#update Model.facets} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.facets = function (facets) {
    const self = this;

    assert(_.is.String(facets) || _.is.Array(facets));

    self._apply_command(model.Model.prototype.facets, arguments);
    self._persist_command(model.Model.prototype.facets, arguments);

    return self;
};

/**
 *  Call {@link Thing#set Model.set} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.set = function () {
    const self = this;

    self._apply_command(model.Model.prototype.set, arguments, KEY_SETTER);
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
    const self = this;

    self._apply_command(model.Model.prototype.update, arguments, KEY_SETTER);
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
    const self = this;

    self._apply_command(model.Model.prototype.pull, arguments);
    self._persist_command(model.Model.prototype.pull, arguments);

    return self;
};

/**
 *  Call {@link Thing#pull Model.tag} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.tag = function () {
    const self = this;

    self._apply_command(model.Model.prototype.tag, arguments, KEY_TAG);
    self._persist_command(model.Model.prototype.tag, arguments, KEY_TAG);

    return self;
};

/**
 *  Call {@link Thing#on Model.on} on
 *  every item in the ThingArray.
 *
 *  @return {this}
 */
ThingArray.prototype.on = function (what, callback) {
    const self = this;

    if (what === "thing") {
        self._on_thing(callback);
    } else if ((what === EVENT_THING_NEW) || (what === EVENT_THING_PUSHED) || (what === EVENT_THINGS_CHANGED)) {
        events.EventEmitter.prototype.on.call(self, what, function (thing) {
            callback(thing);
        });
    } else {
        self._apply_command(model.Model.prototype.on, arguments);
        self._persist_command(model.Model.prototype.on, arguments);
    }

    return self;
};

ThingArray.prototype._on_thing = function (callback) {
    const self = this;

    self.map(callback);

    events.EventEmitter.prototype.on.call(self, EVENT_THING_NEW, function (thing) {
        callback(thing);
    });

    return self;
};

/**
 *  Call {@link Thing#on Model.on_change} on
 *  every item in the ThingArray.
 *
 *  DEPRECIATE
 *
 *  @return {this}
 */
ThingArray.prototype.on_change = function () {
    const self = this;

    self._apply_command(model.Model.prototype.on_change, arguments);
    self._persist_command(model.Model.prototype.on_change, arguments);

    return self;
};

/**
 *  Return the number of things that can be reached
 */
ThingArray.prototype.reachable = function () {
    const self = this;
    var count = 0;

    self.map(function (thing) {
        if (thing.reachable()) {
            count++;
        }
    });

    return count;
};

/**
 *  Somehow or another, the underlying things were changed.
 *  This will bring all downstream ThingArrays into order
 */
ThingArray.prototype.things_changed = function () {
    const self = this;

    logger.trace({
        method: "things_changed",
        array: self._array_id,
        length: self.length,
    }, "called");

    self.emit(EVENT_THINGS_CHANGED);
};


/* --- */

ThingArray.prototype._search_test = function (queryd, thing) {
    const self = this;
    var meta = thing.meta();

    for (var query_key in queryd) {
        var match = query_key.match(/^(meta|model|istate|ostate|transient):(.+)$/);
        if (!match) {
            logger.error({
                method: "_search_test",
                cause: "bad query in the test dictionary",
                query_key: query_key,
            }, "bad match request");
            return false;
        }

        var query_band = match[1];
        var query_inner_key = match[2];
        var query_values = _.ld.list(queryd, query_key, []);

        if (query_band === "meta") {
            query_values = _.ld.expand(query_values);

            var thing_state = thing.state(query_band);
            var thing_values = _.ld.expand(_.ld.list(thing_state, query_inner_key, []));

            var intersection = _.intersection(query_values, thing_values);
            if (intersection.length === 0) {
                return false;
            }
        } else if (query_band === "transient") {
            if (query_inner_key === "tag") {
                if (!_.ld.intersects(thing.initd, "tag", query_values)) {
                    return false;
                }
            } else {
                return false;
            }
        } else if ((query_band === "ostate") || (query_band === "istate") || (query_band === "model")) {
            logger.error({
                method: "_search_test",
                query_band: query_band,
                query_key: query_key,
            }, "function not implemented (yet)");

            return false;
        } else {
            logger.error({
                method: "_search_test",
                cause: "programming error - this should never happen",
                query_band: query_band,
                query_key: query_key,
            }, "bad band");

            return false;
        }
    }

    return true;
};

/**
 */
ThingArray.prototype.search = function (d) {
    const self = this;
    var o;
    var oi;

    var out_items = make({
        persist: persist
    });

    self.filter(thing => self._search_test(d, thing))
        .forEach(thing => out_items.push(thing));

    /*
     *  When 'Things Changed' && persist: update the list.
     *
     *  NOTE:
     *  we use 'events.EventEmitter.prototype.on' because we are doing our own
     *  thing with 'self.on'
     */
    events.EventEmitter.prototype.on.call(self, EVENT_THINGS_CHANGED, function () {
        // existing things by ID
        var oidd = {};

        for (oi = 0; oi < out_items.length; oi++) {
            o = out_items[oi];
            oidd[o.thing_id()] = 1;
        }

        // find new things matching
        var is_updated = false;

        for (var ii = 0; ii < self._underlying.length; ii++) {
            var thing = self._underlying[ii];
            var thing_id = thing.thing_id();

            if (!self._search_test(d, thing)) {
                continue;
            }

            if (oidd[thing_id]) {
                delete oidd[thing_id];
            } else {
                out_items.push(thing, {
                    emit_pushed: false
                });
                is_updated = true;
            }
        }


        // remove things that no longer match
        for (oi = 0; oi < out_items.length; oi++) {
            o = out_items[oi];
            if (!oidd[o.thing_id()]) {
                continue;
            }

            // console.log("! ThingArray.search/things_changed: remove old match", o.thing_id())
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
        self.things_changed();
    });

    return out_items;
};

ThingArray.prototype.with_id = function (id) {
    return this.search({
        "meta:iot:thing-id": id,
    });
};

ThingArray.prototype.with_code = function (code) {
    return this.search({
        "meta:iot:model-id": _.id.to_dash_case(code),
    });
};

ThingArray.prototype.with_name = function (name) {
    return this.search({
        "meta:schema:name": name
    });
};

ThingArray.prototype.with_zone = function (name) {
    return this.search({
        "meta:iot:zone": name
    });
};

ThingArray.prototype.with_number = function (number) {
    return this.search({
        "meta:iot:thing-number": parseInt(number)
    });
};

ThingArray.prototype.with_tag = function (tag) {
    return this.search({
        "transient:tag": tag
    });
};

ThingArray.prototype.with_facet = function (facet) {
    return this.search({
        "meta:iot:facet": facet,
    });
};

/**
 *  API
 */
exports.make = make;
