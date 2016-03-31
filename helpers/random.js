/*
 *  random.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-02-03
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

/**
 *  Generate a random ID
 */
var generate_id = function (length) {
    length = Math.min(length || 128, 128);

    var hasher = crypto.createHash("sha512");
    hasher.update("" + Math.random());

    return hasher.digest("hex").substring(0, length);
};

var random_integer = function (n) {
    return Math.floor(Math.random() * n);
};

var choose = function (vs) {
    return vs[random_integer(vs.length)];
};

var short = function (vs) {
    var hasher = crypto.createHash("sha512");
    hasher.update("" + Math.random());

    var v = hasher.digest("base64").substring(0, 8);
    v = v.replace(/\//g, '_');
    v = v.replace(/[+]/g, '-');

    return v;
};

exports.random = {
    id: generate_id,
    integer: random_integer,
    choose: choose,
    short: short,
};
