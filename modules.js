/*
 *  modules.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-16
 *  "Valentines's Day"
 *
 *  Copyright [2013-2016] [David P. Janes]
 *
 *  Installed Module Management / Package Manager
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

var cfg = require('./cfg');
var model = require('./model');

var events = require('events');
var util = require('util');
var fs = require('fs');
var path = require('path');

var logger = require("./helpers/logger").logger.logger({
    name: 'iotdb',
    module: 'modules',
});

var Modules = function (paramd) {
    var self = this;

    self.paramd = _.defaults(paramd, {})

    events.EventEmitter.call(this);
    this.setMaxListeners(0);

    self._load();
};

util.inherits(Modules, events.EventEmitter);

/**
 *  Return all the Modules that have been registered
 */
Modules.prototype.modules = function () {
    return _.values(this._moduled);
};

/**
 *  Manually add another module
 *
 *  <Module>.use is like setup, except that it is only
 *  called if you explicitly use use().
 */
Modules.prototype.use = function (module_name, module) {
    var self = this;

    if (!module) {
        module = require(module_name);
    }

    self._moduled[module_name] = module
    self._load_bridges();

    self._use_setup(module_name, module);
    self._use_use(module_name, module);
};

Modules.prototype._use_setup = function (module_name, module) {
    if (!module.setup) {
        return;
    }

    var iotdb = require('./iotdb');

    try {
        module.setup(iotdb);
    } catch (x) {
        logger.error({
            method: "use",
            module_name: module_name,
            exception: x,
            cause: "likely the module has a bad setup function",
            error: _.error.message(x),
            stack: x.stack,
        }, "unexpected exception running module.setup");
        process.exit(1);
    }
};

Modules.prototype._use_use = function (module_name, module) {
    if (!module.use) {
        return;
    }

    try {
        module.use();
    } catch (x) {
        logger.error({
            method: "use",
            module_name: module_name,
            exception: x,
            cause: "likely the module has a bad setup function",
            error: _.error.message(x),
            stack: x.stack,
        }, "unexpected exception running module.use");
        process.exit(1);
    }
};

Modules.prototype._load = function () {
    var self = this;

    self._load_master();
    self._load_bridges();
    self._load_setup();
};

Modules.prototype._load_master = function () {
    var self = this;

    self._moduled = {}

    var moduled = require('./iotdb').keystore().get("modules");
    for (var module_name in moduled) {
        var module_folder = moduled[module_name];
        try {
            var module = require(module_folder);
        } catch (x) {
            logger.error({
                method: "_load",
                module_name: module_name,
                module_folder: module_folder,
                cause: "likely the module being imported is not set up correctly",
                error: _.error.message(x),
                stack: x.stack,
            }, "unexpected exception loading module");
            continue
        }

        module.module_name = module_name;
        module.module_folder = module_folder;

        self._moduled[module_name] = module
    }
};

Modules.prototype._load_bridges = function () {
    var self = this;

    self._bridges = [];

    for (var module_name in self._moduled) {
        var module = self._moduled[module_name];
        if (module.Bridge) {
            module.Bridge.module_name = module_name;
            module.Bridge.bridge_name = _.id.to_dash_case((new module.Bridge()).name());
            self._bridges.push(module.Bridge);
        }
    }
};

/**
 *  A module is a complete package of code, corresponding
 *  to an NPM package (which would have been a better name).
 *  A module has one Bridge, one or more Bindings, and
 *  one or more Models
 *  <p>
 *  This will return the module with the module_name,
 *  or undefined if not found.
 */
Modules.prototype.module = function (module_name) {
    return this._moduled[module_name];
};

/**
 *  The Bridge is the code that knows how to talk to
 *  Things. It can be further parameterized by a Binding.
 *  <p>
 *  There is one Bridge per Module (maybe more in the future).
 */
Modules.prototype.bridges = function () {
    var self = this;

    return self._bridges;
};

/**
 *  Find a bridge by the *MODULES* name. For the module
 *  part we don't use the Bridge's self-identified
 *  name except for debug purposes
 */
Modules.prototype.bridge = function (module_name) {
    var self = this;

    var module = self._moduled[module_name];
    if (!module) {
        return module;
    }

    return module.Bridge ? module.Bridge : null;
};

Modules.prototype.bindings = function () {
    var self = this;

    if (self._bindings === undefined) {
        self._bindings = [];

        var _setup_binding = function (binding) {
            if (!binding) {
                return;
            } else if (!binding.bridge) {
                return;
            } else if (!binding.model) {
                return;
            }

            if (!_.is.Model(binding.model)) {
                binding.model = model.make_model_from_jsonld(binding.model);

                /*
                var i = new binding.model();
                var c = i.code();
                if (c === "we-mo-socket") {
                    console.log("----");
                    // console.log("HERE:OCT31", i);
                    i.set(':on', true);
                    console.log("----");
                    // process.exit();
                }
                */
            }

            if (!binding.model_code) {
                binding.model_code = (new binding.model()).code();
            } else {
                /* morph the model's code -- see model_maker */
                binding.model_code = _.id.to_dash_case(binding.model_code);
                var old_model = binding.model;
                var new_model = function () {
                    old_model.call(this);
                    this.__code = binding.model_code;
                }
                new_model.prototype = new old_model();

                binding.model = new_model;
            }

            self._bindings.push(binding);
        };

        for (var module_name in self._moduled) {
            var module = self._moduled[module_name];
            if (!module.bindings) {
                continue;
            }

            for (var bi in module.bindings) {
                _setup_binding(module.bindings[bi]);
            }
        }
    }

    // allow bindings to be turned off per model AFTER createion
    var keystore = require('iotdb').keystore();

    var bs = [];
    self._bindings.map(function (binding) {
        if (keystore.get("/enabled/modules/" + binding.bridge.module_name, true)) {
            bs.push(binding);
        }
    });

    return bs;
};

Modules.prototype._load_setup = function () {
    var self = this;
    var iotdb = require('./iotdb');

    for (var module_name in self._moduled) {
        var module = self._moduled[module_name];
        if (!module.setup) {
            continue;
        }

        try {
            module.setup(iotdb);
        } catch (x) {
            logger.error({
                method: "_load_setup",
                module_name: module_name,
                exception: x,
                cause: "likely the module has a bad setup function",
                error: _.error.message(x),
                stack: x.stack,
            }, "unexpected exception running module.setup");
            process.exit(1);
        }
    }
};

var _modules;

/**
 */
var modules = function () {
    if (!_modules) {
        _modules = new Modules();
    }

    return _modules;
}

/*
 *  API
 */
exports.Modules = Modules;
exports.modules = modules;
