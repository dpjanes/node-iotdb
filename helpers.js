/*
 *  helpers.js
 *
 *  David Janes
 *  IOTDB.org
 *  2013-12-01
 *
 *  Nodejs IOTDB control
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

var crypto = require('crypto');
var node_url = require('url');
var path = require('path');

var _ = require("iotdb-helpers");

_.mapObject(_, ( value, key ) => {
    exports[key] = value;
});

// exports.underscore = require('underscore')

var modules = [
    // exports.underscore,
    // require('./helpers/ld'),
    // require('./helpers/id'),
    // require('./helpers/d'),
    // require('./helpers/hash'),
    require('./helpers/is'),
    // require('./helpers/net'),
    // require('./helpers/color'),
    // require('./helpers/timestamp'),
    // require('./helpers/error'),
    // require('./helpers/convert'),
    // require('./helpers/random'),
    // require('./helpers/q'),
    require('./helpers/version'),
    // require('./helpers/logger'),
];
for (var mi in modules) {
    var module = modules[mi];
    for (var key in module) {
        exports[key] = module[key];
    }
}

exports.queue = _.q.queue; // require('./helpers/q').q.queue;
exports.bridge_wrapper = require('./bridge_wrapper').bridge_wrapper;
exports.defaults = _.d.compose.shallow; // require('./helpers/d').d.compose.shallow;
exports.noop = function () {};
exports.make_done = function (done) {
    return function(value) {
        done(null, value);
    };
};
exports.make_error = function (done) {
    return function(error) {
        done(error);
    };
};
