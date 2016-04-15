/*
 *  hash.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-04-11
 *
 *  Hashing functions
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

var crypto = require('crypto');

var _hash = function(algorithm, av) {
    var hasher = crypto.createHash(algorithm);
    for (var ai in av) {
        var a = av[ai];
        hasher.update("" + a);
    }

    return hasher.digest("hex");
};

var md5 = function () {
    return _hash('md5', arguments);
};

var sha1 = function () {
    return _hash('sha1', arguments);
};

var sha256 = function () {
    return _hash('sha256', arguments);
};

var sha512 = function () {
    return _hash('sha512', arguments);
};

var short = function(av) {
    var hasher = crypto.createHash("md5");
    for (var ai in av) {
        var a = av[ai];
        hasher.update("" + a);
    }

    var v = hasher.digest("base64").substring(0, 8);
    v = v.replace(/\//g, '_');
    v = v.replace(/[+]/g, '-');

    return v;
};

exports.hash = {
    short: short,
    md5: md5,
    sha1: sha1,
    sha256: sha256,
    sha512: sha512,
};
