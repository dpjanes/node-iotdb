/*
 *  index.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-01-06
 *
 *  Copyright [2013-2015] [David P. Janes]
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

exports.Bridge = require('./TestBridge').Bridge;
exports.bindings = [
    require('./models/Test').binding,
];

exports.iotdb = require("iotdb");
exports.wrap = function(name, initd) {
    return exports.iotdb.make_wrap(name, exports.bindings, initd);
};
