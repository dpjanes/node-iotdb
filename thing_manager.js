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

const ThingManager = function (paramd) {
    const self = this;

    self.paramd = _.defaults(paramd, {});
    self._thingd = {};
    self._bridge_exemplars = [];

    events.EventEmitter.call(this);
    this.setMaxListeners(0);
};

util.inherits(ThingManager, events.EventEmitter);


/**
 *  This is for testing only
 */
ThingManager.prototype._reset = function () {
    this._thingd = {};
    this._bridge_exemplars = [];
};

/**
 *  Return all things that we know about
 */
ThingManager.prototype.things = function (model_code) {
    const self = this;

    if (!_.is.Empty(model_code)) {
        model_code = _.id.to_dash_case(model_code);
    }

    // the result
    var things = new thing_array.ThingArray({
        persist: true,
        things: self,
    });

    var _add = function (thing) {
        if (!model_code) {
            things.push(thing);
        } else if (model_code === thing.code()) {
            things.push(thing);
        } else {}
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
ThingManager.prototype.connect = function (modeld, initd, metad) {
    // return this.things(this.discover(modeld, initd, metad));
    return this.discover(modeld, initd, metad);
};

/**
 */
ThingManager.prototype.discover = function (modeld, initd, metad) {
    const self = this;

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
        /* XXX this needs to be rationalized */
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
        self._discover(things, modeld);
    });

    return things; // modeld.model_code;
};

/**
 *  This does the actual work of discovery, which 
 *  is delegated off to two different subfunctions
 */
ThingManager.prototype._discover = function (things, modeld) {
    const self = this;

    if (modeld.model_code) {
        self._discover_model(things, modeld);
    } else {
        self._discover_all(things, modeld);
    }
};

/**
 */
ThingManager.prototype._discover_model = function (things, modeld) {
    const self = this;

    var bindings = modules().bindings();
    for (var bi in bindings) {
        var binding = bindings[bi];
        if (modeld.model_code !== binding.model_code) {
            continue;
        }

        self._discover_binding(things, modeld, binding);
        return;
    };

    logger.error({
        method: "_discover",
        modeld: modeld,
        cause: "maybe this Model or it's binding are not added to IOTDB yet?",
    }, "did not find any matching Models");
};

/**
 */
ThingManager.prototype._discover_all = function (things, modeld) {
    const self = this;

    var bindings = modules().bindings();
    for (var bi in bindings) {
        var binding = bindings[bi];
        if (binding.discover === false) {
            continue;
        }

        self._discover_binding(things, modeld, binding);
    };
};

/**
 *  This does the connect for a particular binding
 */
ThingManager.prototype._discover_binding = function (things, modeld, binding) {
    const self = this;

    logger.info({
        method: "_discover_binding",
        modeld: modeld,
        binding: binding,
    }, "called");

    // initialize the bridge for this binding
    var initd = _.defaults({}, modeld, binding.initd);

    var bridge_exemplar = new binding.bridge(initd);
    self._bridge_exemplars.push(bridge_exemplar);

    bridge_exemplar.discovered = function (bridge_instance) {
        self._discover_binding_bridge(things, modeld, binding, bridge_exemplar, bridge_instance);
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
ThingManager.prototype._discover_binding_bridge = function (things, modeld, binding, bridge_exemplar, bridge_instance) {
    const self = this;

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
    var thing = self._thingd[thing_id];

    if (modeld.meta) {
        model_instance.update("meta", modeld.meta);
    }

    if (!thing) {
        // add the new thing
        thing = model_instance;
        self._thingd[thing_id] = thing;

        // bring it into play
        var connectd = _.defaults(binding.connectd, {});
        bridge_instance.connect(connectd)

        // add to the list of things we have built up for this connect
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

        // this forces a metadata update
        bridge_instance.pulled();
    }
};

/*
 */
ThingManager.prototype.disconnect = function () {
    const self = this;

    var max_wait = 0;

    // shut down all the Bridge Exemplars
    for (var bei in self._bridge_exemplars) {
        var bridge_exemplar = self._bridge_exemplars[bei];
        if (!bridge_exemplar.disconnect) {
            continue
        }

        var wait = bridge_exemplar.disconnect();
        if (_.is.Number(wait)) {
            max_wait = Math.max(wait, max_wait);
        }
    }

    // shut down all the ThingManager
    for (var thing_id in self._thingd) {
        var thing = self._thingd[thing_id];
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

/*
 *  API
 */
exports.ThingManager = ThingManager;
exports.make = function(paramd) {
    return new ThingManager(paramd);
}
