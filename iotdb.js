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

const iotdb_thing = require("iotdb-thing");
const thing_manager = require('./thing_manager');
const exit = require('./exit');
const _ = require('./helpers');

/**
 *  Singleton
 */
let _instance;

const iot = () => {
    if (!_instance) {
        _instance = thing_manager.make();
        exit.setup(_instance);
    }

    return _instance;
};

const connect = (model, initd, metad) => {
    return iot().connect(model, initd, metad);
}

const things = () => {
    return iot().things();
}

/*
 *  API
 */
exports.shutting_down = exit.shutting_down;

exports._ = _;
exports.logger = _.logger.logger;

const bridge = require('./bridge');
exports.Bridge = bridge.Bridge;

const settings = require('./settings');
exports.settings = settings.instance;
exports.Settings = settings.Settings;
exports.keystore = () => exports.settings();

const modules = require('./modules');
exports.modules = modules.instance;
exports.use = (module_name, module) => exports.modules().use(module_name, module);

const runner_timestamp = _.timestamp.make();
exports.controller_meta = () => {
    return {
        "iot:runner.timestamp": runner_timestamp,
        "iot:runner.id": _.id.machine_id(),
    }
};

// users
exports.users = require('./users');

// primary API
exports.iot = iot;
exports.connect = connect;
exports.things = things;
exports.make_thing_id = require("./thing_manager").make_thing_id;

// coercsion
exports.as = iotdb_thing.as;

exports.reset = () => {
    if (_instance) {
        _instance.disconnect();
        _instance = null;
    }

    modules.reset();
    settings.reset()
}

// testing only
exports.shims = {
    _settings: null,
    reset: () => _instance = null,
    settings: k => {
        if (k) {
            exports.shims._settings = exports.settings;
            exports.settings = k;
        } else {
            exports.settings = exports.shims._settings
        }
    },
}

// Windows compatibility
require("./windows").setup();

// debugging
exports.__filename = __filename;
