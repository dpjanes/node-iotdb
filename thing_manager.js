/*
 *  thing_manager.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-18
 *
 *  Copyright [2013-2016] [David P. Janes]
 *
 *  Things Manager. Handle finding new Things and
 *  tracking things that we already know about.
 *  This replaces massive amounts of code in 'IOTDB'
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

const _ = require('./helpers');

const iotdb_thing = require('iotdb-thing');
const thing_set = require('./thing_set');
const exit = require('./exit');

const assert = require("assert");
const events = require('events');

const logger = _.logger.make({
    name: 'iotdb',
    module: 'things',
});

const _make_thing_id = thing => {
    const iotdb = require('./iotdb');
    const runner_id = iotdb.settings().get("/homestar/runner/keys/homestar/key", null);
    const thing_id = thing.thing_id();
    const model_id = thing.model_id();

    if (!_.is.Empty(runner_id)) {
        const prefix = _.id.uuid.iotdb("t", runner_id.replace(/^.*:/, '') + ":")
        if (thing_id.indexOf(prefix) === 0) {
            return thing_id;
        } else {
            return prefix + _.hash.short(thing_id + ":" + model_id);
        }
    } else {
        return thing_id + ":" + model_id;
    }
};

const bind_thing_to_bridge = (thing, bridge, binding) => {
    const iotdb = require("./iotdb");

    const _pull_istate = pulld => {
        pulld = _.timestamp.add(pulld);

        // const istate = thing.state("istate");

        thing.band("istate").update(pulld, {
                add_timestamp: true,
                check_timestamp: true,
                validate: false,
            })
            .catch(error => {
                logger.error({
                    error: _.error.message(error),
                    cause: "this usually happens because a Bridge is furiously creating updates",
                    // old_istate: istate,
                    // new_istate: pulld,
                }, "error updating istate");
            });

    };

    const _bridge_to_meta = pulld => {
        const metad = thing.state("meta");
        metad["iot:thing-id"] = iotdb.make_thing_id(thing);

        thing.band("meta").update(metad, {
            add_timestamp: false,
            check_timestamp: false,
        });
    };

    const _on_reachable = () => {
        thing.band("connection").set("iot:reachable", bridge.reachable());
    };

    const _on_ostate = (_t, _b, state) => {
        state = _.object(_.pairs(state)
            .filter(p => p[1] !== null)
            .filter(p => !p[0].match(/^@/)));
        if (_.is.Empty(state)) {
            return;
        }

        bridge.push(state, () => {
            process.nextTick(() => {
                thing.update("ostate", {}, {
                    replace: true
                });
            });
        });
    };

    const _on_disconnect = () => {
        thing.removeListener("ostate", _on_ostate);
        thing.removeListener("disconnect", _on_disconnect);
        thing.reachable = () => false;

        if (thing.__bridge && (thing.__bridge.__thing === thing)) {
            thing.__bridge = null;
        }
        bridge.__thing = null;

        bridge.disconnect();
    }

    const _model_to_meta = () => {
        const iot_keys = ["iot:facet", "iot:help", "iot:model-id"];

        const metad = _.object(_.pairs(Object.assign({}, thing.state("model"), thing.state("meta")))
            .filter(kv => iot_keys.indexOf(kv[0]) > -1 || kv[0].match(/^schema:/)))

        thing.band("meta").update(metad, {
            add_timestamp: false,
        });
    }

    const _controller_to_connection = () => {
        thing.band("connection").update(iotdb.controller_meta(), {
            replace: false,
            add_timestamp: true,
            check_timestamp: true,
            validate: false,
        });
    }

    // --- main code
    bridge.__thing = thing;
    thing.__bridge = bridge;

    bridge.pulled = pulld => {
        if (pulld) {
            _pull_istate(pulld);
        } else {
            _on_reachable();
        }
    };

    thing.on("disconnect", _on_disconnect);
    thing.on("ostate", _on_ostate);

    _model_to_meta();
    _controller_to_connection();
    _on_reachable();
    _bridge_to_meta();

    bridge.connect(_.d.compose.shallow(binding.connectd, {}));
    bridge.pull();
};

const make_thing = bandd => {
    const iotdb_thing = require('iotdb-thing');

    bandd = _.d.clone.deep(bandd);
    bandd.model = bandd.model || {};
    bandd.meta = bandd.meta || {};
    bandd.istate = bandd.istate || {};
    bandd.ostate = bandd.ostate || {};
    bandd.connection = bandd.connection || {};
    bandd.transient = bandd.transient || {};

    return iotdb_thing.make(bandd);
};

const make = function (initd) {
    const self = Object.assign({}, events.EventEmitter.prototype);
    const iotdb = require("./iotdb");

    const _initd = _.defaults(initd, {});
    let _thingd = {};
    let _bridge_exemplars = [];
    let _tid = 0;

    self.setMaxListeners(0);

    /**
     *  Return all things that we know about
     */
    self.things = function () {
        const things = thing_set.make(self);

        self.on("thing", thing => things.add(thing))

        _.mapObject(_thingd, (thing, thing_id) => things.add(thing))

        return things;
    };

    /**
     *  Find new things. This is probably one 
     *  of the most important functions! Can
     *  be called with 0, 1, 2 or 3 arguments
     *  depending on your mood.
     */
    self.connect = function (modeld, initd, metad) {
        logger.info({
            method: "connect",
            modeld: modeld,
        }, "called");

        if (!modeld) {
            modeld = {};
        } else if (_.is.String(modeld)) {
            modeld = {
                model_id: _.id.to_dash_case(modeld)
            };
        } else if (_.is.Object(modeld)) {
            assert(_.is.String(modeld.model_id), "expected *.model_id to be a string");

            modeld = _.d.clone.deep(modeld);
            modeld.model_id = _.id.to_dash_case(modeld.model_id);
        } else {
            assert(false, "expected undefined|null|string|dictionary");
        }

        if (initd !== undefined) {
            assert(_.is.Object(initd), "expected initd to be a Dictionary");

            modeld = _.defaults(modeld, initd);
        }

        metad = metad || {};
        assert(_.is.Object(metad), "expected metad to be a Dictionary");

        const things = thing_set.make(self);

        process.nextTick(() => {
            if (modeld.model_id) {
                _discover_model(things, modeld, metad);
            } else {
                _discover_all(things, modeld, metad);
            }
        });

        process.nextTick(() => self.emit("done"));

        return things;
    };

    const _discover_model = function (things, modeld, metad) {
        const any = iotdb.modules().bindings()
            // .map(binding => { console.log("binding", binding, "want", modeld.model_id); return binding })
            .filter(binding => modeld.model_id === binding.model_id)
            // .map(binding => { console.log("BINDING", binding.model_id); return binding })
            .find(binding => _discover_binding(things, modeld, metad, binding));

        if (!any) {
            logger.error({
                method: "_discover_model",
                modeld: modeld,
                cause: "maybe Model or it's binding are not added to IOTDB yet?",
            }, "did not find any matching Models");
        }
    };

    const _discover_all = function (things, modeld, metad) {
        iotdb.modules().bindings()
            .filter(binding => binding.discover !== false)
            .map(binding => _discover_binding(things, modeld, metad, binding));
    };

    const _discover_binding = function (things, modeld, metad, binding) {
        logger.info({
            method: "_discover_binding",
            modeld: modeld,
        }, "called");

        // initialize the bridge for self binding
        const initd = _.defaults({}, modeld, binding.initd);

        const bridge_exemplar = new binding.bridge(initd);
        _bridge_exemplars.push(bridge_exemplar);

        bridge_exemplar.discovered = function (bridge_instance) {
            _discover_binding_bridge(things, modeld, metad, binding, bridge_exemplar, bridge_instance);
        };

        // and kick off the discovery … later
        process.nextTick(function () {
            bridge_exemplar.discover();
        });

        return true;
    };

    /**
     *  This is called after a Bridge Instance is found.
     *  - make sure we're not shutting down
     *  - make sure it's a match for the binding
     *  - make a Model Instance - a thing - bound to the Bridge Instance
     *  - check thing.thing_id to see if already exists
     *  - if new
     *      - connect
     *      - emit
     *  - if existing
     *      - see if exiting one is reachable?
     *      - if it isn't, replace the bridge with self one
     */
    const _discover_binding_bridge = function (things, modeld, metad, binding, bridge_exemplar, bridge_instance) {
        if (exit.shutting_down()) {
            return;
        }

        logger.info({
            method: "_discover_binding_bridge",
            modeld: modeld,
            bridge_instance: bridge_instance.meta(),
        }, "called");

        // bindings can ignore certatin discoveries 
        const bridge_meta = bridge_instance.meta();
        if (binding.matchd && !_.d.is.superset(bridge_meta, binding.matchd)) {
            return;
        }


        // build a thing
        const bandd = _.d.clone.deep(binding.bandd);
        bandd.meta = _.d.compose.shallow(metad, bridge_meta, bandd.meta, {});

        const new_thing = make_thing(bandd);
        const new_thing_id = new_thing.thing_id();
        new_thing._tid = _tid++;

        // see if it still exists
        const old_thing = _thingd[new_thing_id];
        if (!old_thing) {
            _thingd[new_thing_id] = new_thing;

            bind_thing_to_bridge(new_thing, bridge_instance, binding);

            new_thing.band("meta").update(metad, {
                add_timestamp: true,
                check_timestamp: false,
            });

            things.add(new_thing);

            self.emit("thing", new_thing);
        } else if (!bridge_instance.reachable()) {
            // don't replace with an unreachable thing
            self.emit("_ignored", "new thing not reachable");
        } else if (old_thing.reachable()) {
            // don't replace reachable things
            self.emit("_ignored", "old thing still reachable");
        } else {
            if (old_thing.__bridge) {
                old_thing.__bridge.__thing = null;
            }

            bind_thing_to_bridge(old_thing, bridge_instance, binding);
            self.emit("_bridge_replaced");
        }
    };

    /*
     *  Disconnect all the bridges and things,
     *  returning the amount of time we should wait
     *  before exiting
     */
    self.disconnect = () =>
        _.flatten([_bridge_exemplars, _.values(_thingd)], true)
        .filter(bort => bort.disconnect)
        .map(bort => bort.disconnect())
        .filter(wait => _.is.Number(wait))
        .reduce((sum, wait) => sum + wait, 0);

    self.reset = () => {
        _.flatten([_bridge_exemplars, _.values(_thingd).map(thing => thing.__bridge)], true)
            .filter(bridge => bridge)
            .forEach(bridge => bridge.reset());

        self.disconnect();

        _thingd = {};
        _bridge_exemplars = [];
    };

    return self;
}

/*
 *  API
 */
exports.make = make;
exports.bind_thing_to_bridge = bind_thing_to_bridge;
exports.make_thing = make_thing;
exports.make_thing_id = _make_thing_id;
