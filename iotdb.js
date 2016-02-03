/*
 *  iotdb.js
 *
 *  David Janes
 *  IOTDB.org
 *  2013-12-01
 *
 *  NodeJS IOTDB control
 *
 *  This is also the 'main' for the package
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

var events = require('events');
var util = require('util');
var path = require('path');
var fs = require('fs');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'IOT',
});

var things = require('./things');
var thing_array = require('./thing_array');
var cfg = require('./cfg');
var _ = require('./helpers');
var exit = require('./exit');

/**
 *  Manage things, bridges and connections to the
 *  {@link https://iotdb.org/ IOTDB.org} running
 *  in a NodeJS application.
 *
 *  <p>
 *  Usually created as a singleton using iotdb.iot()
 *
 *  @constructor
 */
var IOT = function (initd) {
    var self = this;

    if (exports.instance == null) {
        exports.instance = self;
    }

    self.initd = _.defaults(initd, {
        meta_dir: ".iotdb/meta",
    });

    exit.setup(self);

    self._setup_events();
    self._setup_things();

};
util.inherits(IOT, events.EventEmitter);

IOT.prototype._setup_events = function () {
    var self = this;

    events.EventEmitter.call(self);
    self.setMaxListeners(0);
};

/**
 */
IOT.prototype._setup_things = function () {
    var self = this;

    self._things = new things.Things();

    self.things().on_thing(function (thing) {
        self.emit("thing", thing);
    });
};

/**
 *  Return all the Things
 */
IOT.prototype.things = function (model_code) {
    return this._things.things(model_code);
};


/**
 *  Connect to Things. Return a Thing Array
 *  of things thus discovered
 */
IOT.prototype.connect = function (modeld, initd, metad) {
    return this._things.connect(modeld, initd, metad);
};

/**
 *  Connect to Things.
 */
IOT.prototype.discover = function (modeld, initd) {
    this._things.discover(modeld, initd);
    return this;
};

/**
 *  Persist all changes to metadata.
 *  <p>
 *  Tons of work needed here
 *  XXX - deletable?
 */
/*
IOT.prototype.meta_save = function (t) {
    var self = this;

    if (!self.initd.meta_dir) {
        logger.error({
            method: "meta_save"
        }, "no initd.meta_dir");
        return;
    }

    var meta_dir = cfg.cfg_expand(self.envd, self.initd.meta_dir);
    try {
        fs.mkdirSync(meta_dir);
    } catch (err) {}

    var _persist = function (thing) {
        if (!thing) {
            return;
        }

        var meta = thing.meta();
        if (_.is.Empty(meta.updated)) {
            return;
        }

        var thing_id = thing.thing_id();
        var file_meta = path.join(meta_dir, thing_id.replace(/^.*:/, '') + ".json");
        fs.writeFileSync(file_meta, JSON.stringify(meta.updated, null, 2) + "\n");

        logger.error({
            method: "meta_save",
            file: file_meta,
            thing_id: thing_id,
        }, "no initd.meta_dir");
    };

    if (t) {
        _persist(t);
    } else {
        for (var thing_id in self.thing_instanced) {
            _persist(self.thing_instanced[thing_id]);
        }
    }
};
 */

/**
 *  Kind of an arbitrary key / values store.
 *  This is both a setter and getter.
 *  This class doesn't use it but it's very
 *  handy for clients.
 */
/*
IOT.prototype.data = function (key, d) {
    var self = this;

    if (self.datadsd === undefined) {
        self.datadsd = {};
    }

    if (d === undefined) {
        return self.datadsd[key];
    } else if (_.isObject(d)) {
        var datads = self.datadsd[key];
        if (datads === undefined) {
            datads = self.datadsd[key] = [];
        }

        var found = false;
        if (d.id !== undefined) {
            for (var di in datads) {
                if (datads[di].id === d.id) {
                    datads.splice(di, 1, d);
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            datads.push(d);
        }

        return self;
    } else {
        throw new Error("IOT.data: the value must always be an object");
    }
};
 */

/*
 *  API
 */
exports.IOT = IOT;
exports.shutting_down = exit.shutting_down;

exports.attribute = require('./attribute');
for (var key in exports.attribute) {
    exports[key] = exports.attribute[key];
}

/*
exports.definitions = require('./definitions');
for (var key in exports.definitions.attribute) {
    exports[key] = exports.definitions.attribute[key];
}
*/

exports.model = require('./model');
exports.make_model = exports.model.make_model;
exports.make_model_from_jsonld = exports.model.make_model_from_jsonld;
exports.Queue = require('./queue').FIFOQueue;
exports.helpers = _;
exports._ = _;
exports.cfg = cfg;
exports.logger = function () {
    return bunyan.createLogger.apply(bunyan.createLogger, arguments);
};

var bridge = require('./bridge');
exports.Bridge = bridge.Bridge;

var bridge_wrapper = require('./bridge_wrapper');
exports.bridge_wrapper = bridge_wrapper.bridge_wrapper;
exports.make_wrap = bridge_wrapper.make_wrap;

var keystore = require('./keystore');
exports.keystore = keystore.keystore;
exports.Keystore = keystore.Keystore;

var modules = require('./modules');
exports.modules = modules.modules;
exports.Modules = modules.Modules;

/*
exports.module = function (name) {
    var m = modules.modules().module(name);
    if (m) {
        return m;
    }

    if (name === 'bunyan') {
        return bunyan;
    }

    return require(name);
};
*/

/**
 *  Metadata related to this controller & session
 */
var iot_controller_machine = _.ld.expand('iot:controller.machine-id');
var iot_controller_session = _.ld.expand('iot:controller.session-timestamp');

var controller_machine;
var controller_session = _.timestamp.make();

exports.controller_meta = function () {
    var metad = {};

    metad[iot_controller_session] = controller_session;

    if (controller_machine === undefined) {
        controller_machine = exports.keystore().get("/machine_id", null);
    }
    if (controller_machine) {
        metad[iot_controller_machine] = controller_machine;
    }

    return metad;
};

/**
 *  Really HomeStar related, but having them in 
 *  IOTDB makes debugging projects a lot easier
 */
var homestar = require('./homestar');

exports.load_recipes = homestar.load_recipes;
exports.recipe = homestar.recipe;
exports.cookbook = homestar.cookbook;

/**
 *  Users
 */
exports.users = require('./users');

/**
 *  Singleton
 */
exports.instance = null;

exports.iot = function (paramd) {
    if (exports.instance == null) {
        exports.instance = new IOT(paramd);
    }

    return exports.instance;
};

exports.connect = function () {
    var iot = exports.iot();

    return iot.connect.apply(iot, Array.prototype.slice.call(arguments));
};

exports.things = function () {
    var iot = exports.iot();

    return iot.things.apply(iot, Array.prototype.slice.call(arguments));
};

/**
 *  Windows compatibility
 */
require("./windows");
