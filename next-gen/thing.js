/*
 *  thing.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-13
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

var _ = require("../helpers");

var InputBand = require("./istate").Band;
var OutputBand = require("./ostate").Band;
var ModelBand = require("./model").Band;
var MetaBand = require("./meta").Band;

var Thing = function (initd) {
    var self = this;
    self._initd = _.d.compose.shallow(initd, {
        model: {},
        istate: {},
        ostate: {},
        meta: {},
    });

    self._bandd = {};
    self._bandd.model = new ModelBand(self, self._initd.model);
    self._bandd.istate = new InputBand(self, self._initd.istate);
    self._bandd.ostate = new OutputBand(self, self._initd.ostate);
    self._bandd.meta = new MetaBand(self, self._initd.meta);

    events.EventEmitter.call(self);
};

util.inherits(Thing, events.EventEmitter);

Thing.prototype.band = function(band_name) {
    return self._bandd[band_name] || null;
};

Thing.prototype.model_id = function() {
    return this.band("meta").get("iot:model-id");
};

Thing.prototype.thing_id = function() {
    return this.band("meta").get("iot:thing-id");
};

Thing.prototype.set = function(key, value) {
    return this.band("ostate").set(key, value);
};

/**
 */
exports.Thing = Thing;
