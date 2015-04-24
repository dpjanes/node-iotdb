/*
 *  bridge_wrapper.js
 *
 *  David Janes
 *  IOT.org
 *  2015-01-31
 *
 *  Copyright [2013-2015] [David P. Janes]
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

var _ = require('./helpers');

var events = require('events');
var util = require('util');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'bridge_wrapper',
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
var BridgeWrapper = function (binding, initd) {
    var self = this;
    events.EventEmitter.call(self);

    initd = _.defaults(initd, binding.initd, {});
    var connectd = _.defaults(binding.connectd, {});

    var bridge_exemplar = new binding.bridge(initd);

    bridge_exemplar.discovered = function (bridge_instance) {
        /* bindings can ignore certatin discoveries */
        if (binding && binding.matchd) {
            var bridge_meta = _.ld.compact(bridge_instance.meta());
            var binding_meta = _.ld.compact(binding.matchd);
            if (!_.d.is.superset(bridge_meta, binding_meta)) {
                if (bridge_exemplar.ignore) {
                    bridge_exemplar.ignore(bridge_instance);
                }

                self.emit("ignored", bridge_instance);
                return;
            }
        }

        /* to bring along data stored here */
        bridge_instance.binding = binding;

        /* now make a model */
        var model_instance = new binding.model();
        model_instance.bind_bridge(bridge_instance);

        self.emit("thing", model_instance);

        /* OK: here's dealing with pulls */
        var model_pulled = bridge_instance.pulled;
        bridge_instance.pulled = function (stated) {
            /* this will go to the Model */
            model_pulled(stated);

            if (stated) {
                self.emit("state", bridge_instance, stated);
            } else if (bridge_instance.reachable()) {
                self.emit("meta", bridge_instance);
            } else {
                self.emit("meta", bridge_instance);
                self.emit("disconnected", bridge_instance);
            }
        };

        /* the last thing we do before announcing discovery is connect it */
        bridge_instance.connect(connectd)

        self.emit("bridge", bridge_instance);
    };

    process.nextTick(function () {
        bridge_exemplar.discover();
    });
};

util.inherits(BridgeWrapper, events.EventEmitter);

/**
 *  Explicitly given a binding, make a Bridge Wrapper
 */
exports.bridge_wrapper = function (binding, initd) {
    return new BridgeWrapper(binding, initd);
};

/**
 *  Finds a Model by name in a list of bindings,
 *  then wraps it
 */
exports.make_wrap = function (name, bindings, initd) {
    var model_code = _.id.to_dash_case(name);
    for (var bi in bindings) {
        var binding = bindings[bi];
        if (!binding.model) {
            continue
        }

        var model = new binding.model();
        if (model_code !== model.code()) {
            continue;
        }

        return exports.bridge_wrapper(binding, initd);
    }
};
