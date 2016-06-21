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
const make = function() {
    const self = Object.assign({}, events.EventEmitter.prototype);

    self._array_id = '__thing_set_' + array_id++;
    self._isThingArray = true;

    let _persistds = [];
    let _underlying = [];

    events.EventEmitter.call(self);
    self.setMaxListeners(0);

    // array compatibility
    self.every = (f) => _underlying.every(f);
    self.filter = (f) => _underlying.filter(f);
    self.find = (f) => _underlying.find(f);
    self.forEach = (f) => _underlying.forEach(f);
    self.map = (f) => _underlying.map(f);
    self.reduce = (f, i) => _underlying.map(f, i);

    // new "array like" stuff
    self.any = () => _underlying.length ? _underlying[0] : null;
    self.count = () => _underlying.length;

    // --- IOTDB stuff
    /**
     *  Add a new thing to self ThingArray.
     */
    self.add = function (thing, paramd) {
        if (!_.is.Thing(thing)) {
            throw new Error("attempt to add a non-Thing on a ThingArray");
        }

        /*
         *  If the Thing is already in the array
         *  we do nothing. There may be a deeper bug
         *  causing self to happen, but I can't find it
         */
        if (self.filter(t => t === thing).length) {
            return;
        }

        //  
        _persist_pre(thing);

        // actual add
        paramd = _.defaults(paramd, {
            emit_pushed: true,
            emit_new: true
        });

        thing[self._array_id] = self; // TD: see if self is still necessary
        _underlying.push(thing);

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
        _persist_post(thing);

        return self;
    };

    const _persist_post = function (thing) {
        _persistds
            .filter(pd => PRE_KEYS.indexOf(pd.key) === -1)
            .forEach(pd => pd.f.apply(thing, Array.prototype.slice.call(pd.av)));
    };

    const _persist_pre = function (thing) {
        _persistds
            .filter(pd => PRE_KEYS.indexOf(pd.key) !== -1)
            .forEach(pd => pd.f.apply(thing, Array.prototype.slice.call(pd.av)));
    };

    const _persist_command = function (f, av, key) {
        var persistd = {
            f: f,
            av: av,
            key: key
        };

         // there can only be one Setter
        if (key === KEY_SETTER) {
            _persistds = _persistds.filter(p => p.key !== key);
        }

        _persistds.push(persistd);
    };

    /**
     *  Apply the command to everything in the ThingArray right now.
     */
    self._apply_command = function (f, av) {
        self.forEach(thing => f.apply(thing, Array.prototype.slice.call(av)));
    };


    /**
     */
    self.splice = function (index, howmany) {
        if (howmany) {
            for (var i = 0; i < howmany; i++) {
                var x = index + i;
                if (x < self._underlying.length) {
                    delete _underlying[x][self._array_id];
                }
            }
        }

        _underlying.splice(index, howmany);

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
         *  notify downstream - note that we always do self because
         *  even though self list may not have changed, filters
         *  downstream may have changed
         */
        out_items.things_changed();
    };

    /**
     *  Merge another array into self one
     */
    self.merge = function (new_items) {

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
     *  items into self ThingArray. This lets several
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
     *  @return {self}
     */
    self.connect = function (modeld) {
        var iot = require('./iotdb').iot();

        return self.merge(
            iot.connect.apply(iot, Array.prototype.slice.call(arguments))
        );
    };

    /**
     *  Call {@link Thing#update Model.disconnect} on
     *  every item in the ThingArray.
     *
     *  @return {self}
     */
    self.disconnect = function () {
        self._apply_command(model.Model.prototype.disconnect, arguments);
        _persist_command(model.Model.prototype.disconnect, arguments);

        return self;
    };

    /**
     *  Call {@link Thing#update Model.name} on
     *  every item in the ThingArray.
     *
     *  @return {self}
     */
    self.name = function (name) {
        assert(_.is.String(name));

        self._apply_command(model.Model.prototype.name, arguments);
        _persist_command(model.Model.prototype.name, arguments);

        return self;
    };

    /**
     *  Call {@link Thing#update Model.zones} on
     *  every item in the ThingArray.
     *
     *  @return {self}
     */
    self.zones = function (zones) {
        assert(_.is.String(zones) || _.is.Array(zones));

        self._apply_command(model.Model.prototype.zones, arguments);
        _persist_command(model.Model.prototype.zones, arguments);

        return self;
    };

    /**
     *  Call {@link Thing#update Model.facets} on
     *  every item in the ThingArray.
     *
     *  @return {self}
     */
    self.facets = function (facets) {
        assert(_.is.String(facets) || _.is.Array(facets));

        self._apply_command(model.Model.prototype.facets, arguments);
        _persist_command(model.Model.prototype.facets, arguments);

        return self;
    };

    /**
     *  Call {@link Thing#set Model.set} on
     *  every item in the ThingArray.
     *
     *  @return {self}
     */
    self.set = function () {
        self._apply_command(model.Model.prototype.set, arguments, KEY_SETTER);
        _persist_command(model.Model.prototype.set, arguments, KEY_SETTER);

        return self;
    };

    /**
     *  Call {@link Thing#update Model.update} on
     *  every item in the ThingArray.
     *
     *  @return {self}
     */
    self.update = function () {
        self._apply_command(model.Model.prototype.update, arguments, KEY_SETTER);
        _persist_command(model.Model.prototype.update, arguments, KEY_SETTER);

        return self;
    };

    /**
     *  Call {@link Thing#pull Model.pull} on
     *  every item in the ThingArray.
     *
     *  @return {self}
     */
    self.pull = function () {
        self._apply_command(model.Model.prototype.pull, arguments);
        _persist_command(model.Model.prototype.pull, arguments);

        return self;
    };

    /**
     *  Call {@link Thing#pull Model.tag} on
     *  every item in the ThingArray.
     *
     *  @return {self}
     */
    self.tag = function () {
        self._apply_command(model.Model.prototype.tag, arguments, KEY_TAG);
        _persist_command(model.Model.prototype.tag, arguments, KEY_TAG);

        return self;
    };

    /**
     *  Call {@link Thing#on Model.on} on
     *  every item in the ThingArray.
     *
     *  @return {self}
     */
    self.on = function (what, callback) {
        if (what === "thing") {
            self._on_thing(callback);
        } else if ((what === EVENT_THING_NEW) || (what === EVENT_THING_PUSHED) || (what === EVENT_THINGS_CHANGED)) {
            events.EventEmitter.prototype.on.call(self, what, function (thing) {
                callback(thing);
            });
        } else {
            self._apply_command(model.Model.prototype.on, arguments);
            _persist_command(model.Model.prototype.on, arguments);
        }

        return self;
    };

    self._on_thing = function (callback) {
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
     *  @return {self}
     */
    self.on_change = function () {
        self._apply_command(model.Model.prototype.on_change, arguments);
        _persist_command(model.Model.prototype.on_change, arguments);

        return self;
    };

    /**
     *  Return the number of things that can be reached
     */
    self.reachable = function () {
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
    self.things_changed = function () {
        logger.trace({
            method: "things_changed",
            array: self._array_id,
            length: _underlying.length,
        }, "called");

        self.emit(EVENT_THINGS_CHANGED);
    };


    /* --- */
    self._search_test = function (queryd, thing) {
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
                    cause: "programming error - self should never happen",
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
    self.search = function (d) {
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

            for (var ii = 0; ii < _underlying.length; ii++) {
                var thing = _underlying[ii];
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
             *  notify downstream - note that we always do self because
             *  even though self list may not have changed, filters
             *  downstream may have changed
             */
            out_items.things_changed();
        });

        /*
         *  Things being added propagates downstream. Note how
         *  above with { emit_pushed: false } we stop self from being
         *  unnecessarily being called
         */
        events.EventEmitter.prototype.on.call(self, EVENT_THING_PUSHED, function (thing) {
            self.things_changed();
        });

        return out_items;
    };

    self.with_id = (id) => self.search({ "meta:iot:thing-id": id, });
    self.with_code = (code) => self.search({ "meta:iot:model-id": _.id.to_dash_case(code), });
    self.with_name = (name) => self.search({ "meta:schema:name": name });
    self.with_zone = (name) => self.search({ "meta:iot:zone": name });
    self.with_number = (number) => self.search({ "meta:iot:thing-number": parseInt(number) });
    self.with_tag = (tag) => self.search({ "transient:tag": tag });
    self.with_facet = (facet) => self.search({ "meta:iot:facet": facet, });

    return self;
};

/**
 *  API
 */
exports.make = make;
