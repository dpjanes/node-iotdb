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

const KEY_TAG = 'TAG';
const KEY_SETTER = 'SETTER';

let sid = 0;

const make = function() {
    const self = Object.assign({}, events.EventEmitter.prototype);

    // events
    const _emitter = new events.EventEmitter();
    _emitter.setMaxListeners(0);

    // internals (some cheat visibility for downstream sets)
    self._sid = '_thing_set' + sid++;
    self._isThingArray = true;

    let _things = [];
    let _persistds = [];

    // array compatibility
    self.every = (f) => self.all().every(f);
    self.filter = (f) => self.all().filter(f);
    self.find = (f) => self.all().find(f);
    self.forEach = (f) => self.all().forEach(f);
    self.map = (f) => self.all().map(f);
    self.reduce = (f, i) => self.all().map(f, i);

    // new "array like" stuff
    self.all = () => _things;
    self.any = () => _.is.Empty(_things) ? null : _.first(_things);
    self.count = () => _things.length;
    self.empty = () => _things.length === 0;

    // --- set specific stuff
    self.add = function (thing) {
        assert(_.is.Thing(thing));

        if (self.find(t => t === thing)) {
            return;
        }

        thing._sidd = thing._sidd || {};
        thing._sidd[self._sid] = true;

        _do_pre(thing);
        _things.push(thing);
        _emitter.emit("thing", thing);
        _do_post(thing);

        _emitter.emit("changed", self);
    };


    self.connect = function (modeld, initd, metad) {
        const other_set = require('./iotdb').iot().connect(modeld, initd, metad);

        self._update(other_set, () => true);

        other_set.on("changed", () => self._update(other_set, () => true));

        return self;
    };

    self.disconnect = function () {
        return _apply_persist(model.Model.prototype.disconnect, arguments);
    };

    self.name = function (name) {
        assert(_.is.String(name));

        return _apply_persist(model.Model.prototype.name, arguments);
    };

    self.zones = function (zones) {
        assert(_.is.String(zones) || _.is.Array(zones));

        return _apply_persist(model.Model.prototype.zones, arguments);
    };

    self.facets = function (facets) {
        assert(_.is.String(facets) || _.is.Array(facets));

        return _apply_persist(model.Model.prototype.facets, arguments);
    };

    self.set = function () {
        return _apply_persist(model.Model.prototype.set, arguments, KEY_SETTER);
    };

    self.update = function () {
        return _apply_persist(model.Model.prototype.update, arguments, KEY_SETTER);
    };

    self.pull = function () {
        return _apply_persist(model.Model.prototype.pull, arguments);
    };

    self.tag = function () {
        return _apply_persist(model.Model.prototype.tag, arguments, KEY_TAG);
    };

    self.on = function (what, callback) {
        if (_.contains([ "istate", "ostate", "state", "meta", "model", "connection" ], what)) {
            _apply_persist(model.Model.prototype.on, arguments);
        } else {
            _emitter.on(what, callback);
        }

        return self;
    };

    self.reachable = function () {
        return self
            .map((thing) => thing.reachable() ? 1 : 0)
            .reduce(( sum, reachable ) => sum + reachable, 0);
    };

    self.search = function (queryd) {
        const result_set = make();

        result_set._update(self, thing => _search_filter(queryd, thing));

        self.on("changed", () => result_set._update(self, thing => _search_filter(queryd, thing)));

        return result_set;
    };

    self.with_id = (id) => self.search({ "meta:iot:thing-id": id, });
    self.with_code = (code) => self.search({ "meta:iot:model-id": _.id.to_dash_case(code), });
    self.with_name = (name) => self.search({ "meta:schema:name": name });
    self.with_zone = (name) => self.search({ "meta:iot:zone": name });
    self.with_number = (number) => self.search({ "meta:iot:thing-number": parseInt(number) });
    self.with_tag = (tag) => self.search({ "transient:tag": tag });
    self.with_facet = (facet) => self.search({ "meta:iot:facet": facet, });

    // -- internals
    const _search_parse = queryd => _.values(_.mapObject(queryd, ( query_value, query_key ) => {
        const match = query_key.match(/^(meta|model|istate|ostate|connection|transient):(.+)$/);
        if (!match) {
            throw new Error("bad search: key=" + query_key);
        }

        return {
            query_band: match[1],
            query_inner_key: match[2],
            query_values: _.ld.list(queryd, query_key, []),
        };
    }));

    const _search_match = (matchd, thing) => {
        const meta = thing.meta();

        switch (matchd.query_band) {
        case "meta":
        case "connection":
            matchd.query_values = _.ld.expand(matchd.query_values);

            const thing_state = thing.state(matchd.query_band);
            const thing_values = _.ld.expand(_.ld.list(thing_state, matchd.query_inner_key, []));

            return _.intersection(matchd.query_values, thing_values).length > 0;

        case "transient":
            if (matchd.query_inner_key === "tag") {
                return _.ld.intersects(thing.initd, "tag", matchd.query_values);
            } else {
                return false;
            }

        case "ostate":
        case "istate":
        case "model":
            logger.error({
                method: "_search_match",
                query_band: matchd.query_band,
                query_key: matchd.query_key,
            }, "function not implemented (yet)");

            return false;

        default:
            logger.error({
                method: "_search_match",
                cause: "programming error - self should never happen",
                query_band: matchd.query_band,
                query_key: matchd.query_key,
            }, "bad band");

            return false;
        }

        return true;
    };

    const _search_filter = ( queryd, thing ) => _search_parse(queryd)
        .map(matchd => _search_match(matchd, thing))
        .find(tf => (tf === false)) === undefined ? thing : null;

    const _is_pre_key = key => [ KEY_TAG ].indexOf(key) > -1;
    const _is_only_key = key => [ KEY_SETTER ].indexOf(key) > -1;

    const _do_pre = thing => _persistds
        .filter(pd => _is_pre_key(pd.key))
        .forEach(pd => pd.f.apply(thing, Array.prototype.slice.call(pd.av)));

    const _do_post = thing => _persistds
        .filter(pd => !_is_pre_key(pd.key))
        .forEach(pd => pd.f.apply(thing, Array.prototype.slice.call(pd.av)));

    const _persist = function (f, av, key) {
        if (_is_only_key(key)) {
            _persistds = _persistds.filter(p => p.key !== key);
        }

        _persistds.push({
            f: f,
            av: av,
            key: key
        });
    };

    const _apply = (f, av) => self.forEach(thing => f.apply(thing, Array.prototype.slice.call(av)));

    const _apply_persist = (f, av, key) => {
        _apply(f, av);
        _persist(f, av, key);
    };

    self._update = ( other_set, filter ) => {
        const existing_things = self.filter(thing => thing._sidd[other_set._sid]);
        const other_things = other_set.all().filter(filter);

        const removed_things = _.without(existing_things, other_things);
        const added_things = _.without(other_things, existing_things);

        if (_.is.Empty(removed_things) && _.is.Empty(added_things)) {
            return;
        }

        removed_things.every(thing => _emitter.emit("removed", thing));
        added_things.every(thing => {
            _persistds
                .filter(pd => _is_pre_key(pd.key))
                .forEach(pd => pd.f.apply(thing, Array.prototype.slice.call(pd.av)));

            _do_pre(thing);
            _things.push(thing);
            _do_post(thing);

            _emitter.emit("thing", thing);
        });

        _emitter.emit("changed", self);
    };

    return self;
};

/**
 *  API
 */
exports.make = make;
