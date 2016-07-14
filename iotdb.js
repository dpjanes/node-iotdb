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

const thing_manager = require('./thing_manager');
const exit = require('./exit');

const _ = require('./helpers');

/**
 *  Singleton
 */
let _instance = null;

const iot = () => {
    if (_instance === null) {
        _instance = thing_manager.make();
        exit.setup(_instance);
    }

    return _instance;
};

const connect = ( model, initd, metad ) => {
    return iot().connect(model, initd, metad);
}

const things = () => {
    return iot().things();
}

const _reset_shim = () => {
    _instance = null;
}

/*
 *  API
 */
exports.shutting_down = exit.shutting_down;

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
exports.use = (module_name, module) => modules.modules().use(module_name, module);

/**
 *  Metadata related to this controller & session
 */
const iot_controller_machine = _.ld.expand('iot:runner.id');
const iot_controller_session = _.ld.expand('iot:runner.timestamp');

let controller_machine;
const controller_session = _.timestamp.make();

let machine_id;
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

// users
exports.users = require('./users');

// primary API
exports.iot = iot;
exports.connect = connect;
exports.things = things;

// testing only
exports.shims = {
    reset: _reset_shim,
    keystore: f => exports.keystore = f,
}

// Windows compatibility
require("./windows").setup();
