/*
 *  things.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-18
 *
 *  Copyright [2013-2015] [David P. Janes]
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

var _ = require('./helpers');
var keystore = require("./keystore").keystore;
var modules = require("./modules").modules;

var cfg = require('./cfg');
var thing_array = require('./thing_array');

var events = require('events');
var util = require('util');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'things',
});

var Things = function (paramd) {
    var self = this;

    self.paramd = _.defaults(paramd, {});
    self._thingd = {};
    self._bridge_exemplars = [];

    events.EventEmitter.call(this);
    this.setMaxListeners(0);
};

util.inherits(Things, events.EventEmitter);

/**
 *  Return all things that we know about
 */
Things.prototype.things = function (model_code) {
    var self = this;

    // the result
    var things = new thing_array.ThingArray({
        persist: true,
        things: self,
    });

    var _add = function (thing) {
        // console.log("HERE:FOUND", thing.thing_id(), thing.code, _.isModel(thing));
        if (!thing.reachable()) {} else if (!model_code) {
            // console.log("HERE:F.1");
            things.push(thing);
        } else if (model_code === thing.code) {
            // console.log("HERE:F.2");
            things.push(thing);
        } else {
            // console.log("HERE:F.3", thing.code, model_code);
        }
    };

    // new things
    self.on("thing", _add);

    // existing things
    for (var thing_id in self._thingd) {
        _add(self._thingd[thing_id]);
    }

    return things;
};

/**
 */
Things.prototype.connect = function (modeld, initd) {
    return this.things(this.discover(modeld, initd));
};

/**
 */
Things.prototype.discover = function (modeld, initd) {
    var self = this;

    logger.info({
        method: "connect",
        modeld: modeld,
    }, "called");

    // validate arguments
    if (!modeld) {
        modeld = {};
    } else if (_.isString(modeld)) {
        modeld = {
            model_code: _.identifier_to_dash_case(modeld)
        };
    } else if (_.isObject(modeld)) {
        if (!_.isString(modeld.model_code)) {
            throw new Error("expected *.model_code to be a string");
        }

        modeld = _.deepCopy(modeld);
        modeld.model_code = _.identifier_to_dash_case(modeld.model_code);
    } else {
        throw new Error("expected undefined|null|string|dictionary");
    }

    // optional second dictionary
    if (initd !== undefined) {
        if (!_.isObject(initd)) {
            throw new Error("expected initd to be a dictionary");
        }

        modeld = _.defaults(modeld, initd);
    }

    // run when ready
    self.when_ready(function () {
        self._discover(modeld);
    });

    return modeld.model_code;
};

/**
 *  This does the actual connect work
 */
Things.prototype._discover = function (modeld) {
    var self = this;

    var bindings = modules().bindings();
    for (var bi in bindings) {
        var binding = bindings[bi];
        if (modeld.model_code && (modeld.model_code !== binding.model_code)) {
            continue;
        }

        self._discover_binding(modeld, binding);
    };
};

/**
 *  This does the connect for a particular binding
 */
Things.prototype._discover_binding = function (modeld, binding) {
    var self = this;

    logger.info({
        method: "_discover_binding",
        modeld: modeld,
        binding: binding,
    }, "called");

    // initialize the bridge for this binding
    var initd = _.defaults({}, modeld, binding.initd);
    console.log("INITD", initd, binding.initd);

    var bridge_exemplar = new binding.bridge(initd);
    self._bridge_exemplars.push(bridge_exemplar);

    bridge_exemplar.discovered = function (bridge_instance) {
        self._discover_binding_bridge(modeld, binding, bridge_exemplar, bridge_instance);
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
 *      - if it isn't, replace the bridge with this one
 */
Things.prototype._discover_binding_bridge = function (modeld, binding, bridge_exemplar, bridge_instance) {
    var self = this;

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
        if (!_.d_contains_d(bridge_meta, binding_meta)) {
            if (bridge_exemplar.ignore) {
                bridge_exemplar.ignore(bridge_instance);
            }

            return;
        }
    }

    // now make a model 
    var model_instance = new binding.model();
    model_instance.bind_bridge(bridge_instance);

    // is already being tracked? is it reachable if it is ?
    var thing_id = model_instance.thing_id();
    var thing = self._thingd[thing_id];
    if (thing) {
        if (thing.reachable()) {
            return;
        }

        // replace the bridge for the existing thing and we're done
        thing.bind_bridge(bridge_instance);
        thing.pulled();
        return;
    }

    // a new thing
    thing = model_instance;
    self._thingd[thing_id] = thing;

    // bring it into play
    var connectd = _.defaults(binding.connectd, {});
    bridge_instance.connect(connectd)

    // tell the world
    self.emit("thing", thing);
};

/**
 *  Will callback when ready. If already ready,
 *  will just callback;
 */
Things.prototype.when_ready = function (callback) {
    callback();
};

/*
 */
Things.prototype.disconnect = function () {
    var self = this;

    var max_wait = 0;

    // shut down all the Bridge Exemplars
    for (var bei in self._bridge_exemplars) {
        var bridge_exemplar = self._bridge_exemplars[bei];
        if (!bridge_exemplar.disconnect) {
            continue
        }

        var wait = bridge_exemplar.disconnect();
        if (_.isNumber(wait)) {
            max_wait = Math.max(wait, max_wait);
        }
    }

    // shut down all the Things
    for (var thing_id in self._thingd) {
        var thing = self._thingd[thing_id];
        if (!thing.disconnect) {
            continue
        }

        var wait = thing.disconnect();
        if (_.isNumber(wait)) {
            max_wait = Math.max(wait, max_wait);
        }
    }

    return max_wait;
};


/**
 *  Singleton
 */
var _things;

var things = function () {
    if (!_things) {
        _things = new Things();
    }

    return _things;
}

/*
 *  API
 */
exports.Things = Things;
exports.things = things;
