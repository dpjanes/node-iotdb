/*
 *  band.js
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

var _ = require("../helpers");

var Band = function (thing, d) {
    var self = this;

    self._thing = thing;
    self._d = d;
};

Band.prototype.set = function(key, value) {
};

Band.prototype.get = function(key, otherwise) {
};

Band.prototype.first = function(key, otherwise) {
};

Band.prototype.list = function(key, otherwise) {
};

Band.prototype.on = function(key, otherwise) {
};

Band.prototype.update = function(updated, paramd) {
};

/**
 *  API
 */
exports.Band = Band;
