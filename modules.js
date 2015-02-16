/*
 *  modules.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-16
 *  "Valentines's Day"
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Installed Module Management
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

var iotdb = require('./iotdb');
var _ = iotdb.helpers;
var keystore = iotdb.keystore;

var cfg = require('./cfg');

var events = require('events');
var util = require('util');
var fs = require('fs');
var path = require('path');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'modules',
});

var Modules = function(paramd) {
    var self = this;

    self.paramd = _.defaults(paramd, {
    })

    events.EventEmitter.call(this);
    this.setMaxListeners(0);

    self._load();
};

util.inherits(Modules, events.EventEmitter);

Modules.prototype._load = function() {
    var self = this;

    self._load_master();
    self._load_bridges();
    self._load_models();
};

Modules.prototype._load_master = function() {
    var self = this;

    self._masterd = {}

    var moduled = keystore().get("modules");
    for (var module_name in moduled) {
        var module_folder = moduled[module_name];
        try {
            var module = require(module_folder);
        } 
        catch (x) {
            logger.error({
                method: "_load",
                module_name: module_name,
                module_folder: module_folder,
                cause: "likely the module being imported is not set up correctly",
            }, "unexpected exception loading module");
            continue
        }

        module.module_name = module_name;
        module.module_folder = module_folder;

        self._masterd[module_name] = module
    }
};

Modules.prototype._load_bridges = function() {
    var self = this;

    self._bridges = [];

    for (var module_name in self._masterd) {
        var module = self._masterd[module_name];
        if (module.Bridge) {
            module.Bridge.module_name = module_name;
            self._bridges.push(module.Bridge);
        }
    }
};

Modules.prototype._load_models = function() {
    var self = this;

};

Modules.prototype.bridges = function() {
    var self = this;

    return self._bridges;
};

Modules.prototype.bridge = function(module_name) {
    var self = this;

    var module = self._masterd[module_name];
    if (!module) {
        return module;
    }

    return module.Bridge ? module.Bridge : null;
};

Modules.prototype.models = function() {
    var self = this;

};

Modules.prototype.bindings = function() {
    var self = this;

};

var _modules;

/**
 */
var modules = function() {
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
