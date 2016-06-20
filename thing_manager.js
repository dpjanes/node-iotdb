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
const modules = require("./modules").modules;

const thing_array = require('./thing_array');

const events = require('events');
const util = require('util');

const logger = _.logger.make({
    name: 'iotdb',
    module: 'things',
});

const make = function (initd) {
    const self = Object.assign({}, events.EventEmitter.prototype);

    const _initd = _.defaults(initd, {});
    let _thingd = {};
    let _bridge_exemplars = [];

    self.setMaxListeners(0);

    /**
     *  This is for testing only
     */
    self._reset = function () {
        _thingd = {};
        _bridge_exemplars = [];
    };

    /**
     *  Return all things that we know about
     */
    self.things = function () {
        var things = new thing_array.ThingArray({
            persist: true,
            things: self,
        });

        self.on("thing", (thing) => things.push(thing))

        _.mapObject(_thingd, ( thing, thing_id ) => things.push(thing))

        return things;
    };

    /**
     *  Find new things
     */
    self.connect = function (modeld, initd, metad) {
        logger.info({
            method: "connect",
            modeld: modeld,
        }, "called");

        // validate arguments
        if (!modeld) {
            modeld = {};
        } else if (_.is.String(modeld)) {
            modeld = {
                model_code: _.id.to_dash_case(modeld)
            };
        } else if (_.is.Object(modeld)) {
            /* XXX self needs to be rationalized */
            if (modeld.model) {
                modeld.model_code = modeld.model;
            }

            if (!_.is.String(modeld.model_code)) {
                throw new Error("expected *.model_code to be a string");
            }

            modeld = _.d.clone.deep(modeld);
            modeld.model_code = _.id.to_dash_case(modeld.model_code);
        } else {
            throw new Error("expected undefined|null|string|dictionary");
        }

        // optional second dictionary - arguments to create
        if (initd !== undefined) {
            if (!_.is.Object(initd)) {
                throw new Error("expected initd to be a Dictionary");
            }

            modeld = _.defaults(modeld, initd);
        }

        // optional third dictionary - metadata (something of a hack)
        if (metad !== undefined) {
            if (!_.is.Object(metad)) {
                throw new Error("expected metad to be a Dictionary");
            }

            modeld["meta"] = metad;
        }

        // new in 0.15
        const things = new thing_array.ThingArray({
            persist: true,
            things: self,
        });

        // run when ready
        process.nextTick(function () {
            _discover(things, modeld);
        });

        return things; // modeld.model_code;
    };

    /**
     *  This does the actual work of discovery, which 
     *  is delegated off to two different subfunctions
     */
    const _discover = function (things, modeld) {
        if (modeld.model_code) {
            _discover_model(things, modeld);
        } else {
            _discover_all(things, modeld);
        }
    };

    const _discover_model = function (things, modeld) {
        var bindings = modules().bindings();
        for (var bi in bindings) {
            var binding = bindings[bi];
            if (modeld.model_code !== binding.model_code) {
                continue;
            }

            _discover_binding(things, modeld, binding);
            return;
        };

        logger.error({
            method: "_discover",
            modeld: modeld,
            cause: "maybe self Model or it's binding are not added to IOTDB yet?",
        }, "did not find any matching Models");
    };

    const _discover_all = function (things, modeld) {
        var bindings = modules().bindings();
        for (var bi in bindings) {
            var binding = bindings[bi];
            if (binding.discover === false) {
                continue;
            }

            _discover_binding(things, modeld, binding);
        };
    };

    const _discover_binding = function (things, modeld, binding) {
        logger.info({
            method: "_discover_binding",
            modeld: modeld,
            binding: binding,
        }, "called");

        // initialize the bridge for self binding
        var initd = _.defaults({}, modeld, binding.initd);

        var bridge_exemplar = new binding.bridge(initd);
        _bridge_exemplars.push(bridge_exemplar);

        bridge_exemplar.discovered = function (bridge_instance) {
            _discover_binding_bridge(things, modeld, binding, bridge_exemplar, bridge_instance);
        };

        // and kick off the discovery … later
        process.nextTick(function () {
            bridge_exemplar.discover();
        });
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
    const _discover_binding_bridge = function (things, modeld, binding, bridge_exemplar, bridge_instance) {
        if (require('iotdb').shutting_down()) {
            return;
        }

        logger.info({
            method: "_discover_binding_bridge",
            modeld: modeld,
            binding: binding,
            bridge_instance: bridge_instance.meta(),
        }, "called");

        // bindings can ignore certatin discoveries 
        if (binding && binding.matchd) {
            var bridge_meta = _.ld.compact(bridge_instance.meta());
            var binding_meta = _.ld.compact(binding.matchd);
            if (!_.d.is.superset(bridge_meta, binding_meta)) {
                if (bridge_exemplar.ignore) {
                    bridge_exemplar.ignore(bridge_instance);
                }

                return;
            }
        }

        // keep the binding with the Bridge 
        bridge_instance.binding = binding;

        // now make a model 
        var model_instance = new binding.model();
        model_instance.bind_bridge(bridge_instance);

        // is already being tracked? is it reachable if it is ?
        var thing_id = model_instance.thing_id();
        var thing = _thingd[thing_id];

        if (modeld.meta) {
            model_instance.update("meta", modeld.meta);
        }

        if (!thing) {
            // add the new thing
            thing = model_instance;
            _thingd[thing_id] = thing;

            // bring it into play
            var connectd = _.defaults(binding.connectd, {});
            bridge_instance.connect(connectd)

            // add to the list of things we have built up for self connect
            things.push(thing);

            // tell the world
            self.emit("thing", thing);

        } else if (thing.reachable()) {
            // don't replace reachable things
            return;
        } else if (!bridge_instance.reachable()) {
            // don't replace with an unreachable thing
            return;
        } else {
            // replace the bridge for the existing thing 
            thing.bind_bridge(bridge_instance);

            // bring it into play
            var connectd = _.defaults(binding.connectd, {});
            bridge_instance.connect(connectd)

            // self forces a metadata update
            bridge_instance.pulled();
        }
    };

    /*
     */
    self.disconnect = function () {
        let max_wait = _bridge_exemplars
            .filter(bx => bx.disconnect)
            .map(bx => bx.disconnect())
            .filter(wait => _.is.Number(wait))
            .reduce(( sum, wait ) => sum + wait, 0);

        // shut down all the things
        for (var thing_id in _thingd) {
            var thing = _thingd[thing_id];
            if (!thing.disconnect) {
                continue
            }

            var wait = thing.disconnect();
            if (_.is.Number(wait)) {
                max_wait = Math.max(wait, max_wait);
            }
        }

        return max_wait;
    };

    return self;
}

/*
 *  API
 */
exports.make = make;
