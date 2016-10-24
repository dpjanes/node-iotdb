/*
 *  bridge.js
 *
 *  David Janes
 *  IOT.org
 *  2015-01-31
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

const _ = require('iotdb-helpers');

const events = require('events');
const util = require('util');

const logger = _.logger.make({
    name: 'iotdb',
    module: 'helpers/bridge',
});

/**
 *  A Bridge wrapper does all the work IOTDB would
 *  do so you can use the Bridge without bringing
 *  in the rest of IOTDB.
 *
 *  In practice, it's much easier to use IOTDB
 *  but sometimes this is helpful, especially if
 *  you just want to use the moduels stand-alone
 */
const make = (binding, initd) => {
    const self = Object.assign({}, events.EventEmitter.prototype);
    const thing_manager = require("../thing_manager");

    const bridge_exemplar = new binding.bridge(_.defaults(initd, binding.initd, {}));

    bridge_exemplar.discovered = (bridge_instance) => {
        if (binding.matchd && !_.d.is.superset(bridge_instance.meta(), binding.matchd)) {
            self.emit("ignored", bridge_instance);
            return;
        }

        // to bring along data stored here - horrible side effect, revisit
        bridge_instance.binding = binding;

        const thing = thing_manager.make_thing({
            model: binding.model,
            meta: bridge_instance.meta(),
        });
        thing_manager.bind_thing_to_bridge(thing, bridge_instance, binding);

        self.emit("thing", thing);

        // deal with pulls
        const model_pulled = bridge_instance.pulled;
        bridge_instance.pulled = function (pulld) {
            model_pulled(pulld);

            if (pulld) {
                self.emit("istate", bridge_instance, pulld);
            } else if (bridge_instance.reachable()) {
                self.emit("meta", bridge_instance);
            } else {
                self.emit("meta", bridge_instance);
                self.emit("disconnected", bridge_instance);
            }
        };

        // connect and announce
        bridge_instance.connect(_.defaults(binding.connectd, {}));

        self.emit("bridge", bridge_instance);
    };

    process.nextTick(() => bridge_exemplar.discover());

    return self;
};

/**
 *  Finds a Model by model_id in a list of bindings, then wraps it
 */
const wrap = (model_id, bindings, initd) => bindings
    .filter(binding => binding.model)
    .filter(binding => binding.bridge)
    .filter(binding => _.ld.first(binding.model, "iot:model-id") === _.id.to_dash_case(model_id))
    .map(binding => make(binding, initd))
    .find(wrapper => true);

/**
 *  API
 */
exports.bridge = {
    make: make,
    wrap: wrap,
};
