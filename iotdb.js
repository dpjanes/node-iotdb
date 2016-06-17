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

const events = require('events');
const util = require('util');
const path = require('path');
const fs = require('fs');

const things = require('./things');
const thing_array = require('./thing_array');
const exit = require('./exit');

const _ = require('./helpers');

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
const IOT = function (initd) {
    const self = this;

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
    const self = this;

    events.EventEmitter.call(self);
    self.setMaxListeners(0);
};

/**
 */
IOT.prototype._setup_things = function () {
    const self = this;

    self._things = new things.Things();

    // consider deleting this code
    self.things().on("thing", function (thing) {
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

/*
 *  API
 */
exports.IOT = IOT;
exports.shutting_down = exit.shutting_down;

exports.attribute = require('./attribute');
for (var key in exports.attribute) {
    exports[key] = exports.attribute[key];
}

exports.model = require('./model');
exports.make_model = exports.model.make_model;
exports.make_model_from_jsonld = exports.model.make_model_from_jsonld;
exports._ = _;
exports.logger = _.logger.logger;

const bridge = require('./bridge');
exports.Bridge = bridge.Bridge;

const keystore = require('./keystore');
exports.keystore = keystore.keystore;
exports.Keystore = keystore.Keystore;

const modules = require('./modules');
exports.modules = modules.modules;
exports.Modules = modules.Modules;
exports.use = function(module_name, module) {
    modules.modules().use(module_name, module);
};

/**
 *  Metadata related to this controller & session
 */
const iot_controller_machine = _.ld.expand('iot:runner.id');
const iot_controller_session = _.ld.expand('iot:runner.timestamp');

var controller_machine;
const controller_session = _.timestamp.make();

var machine_id;
(function() {
    const keystore = exports.keystore();

    controller_machine = keystore.get("/homestar/runner/keys/homestar/key", null);
    if (!controller_machine) {
        controller_machine = keystore.get("/machine_id", null);
    }
})();

exports.controller_meta = function () {
    const metad = {};

    metad[iot_controller_session] = controller_session;

    if (controller_machine) {
        metad[iot_controller_machine] = controller_machine;
    }

    return metad;
};

_.id.thing_urn.set({
    machine_id: controller_machine,
});


/**
 *  Really HomeStar related, but having them in 
 *  IOTDB makes debugging projects a lot easier
 */
const homestar = require('./homestar');

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
require("./windows").setup();
