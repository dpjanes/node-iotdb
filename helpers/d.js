/*
 *  d.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-14
 *  "Valentines's Day"
 *
 *  Dictionary functions
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

var _ = require("../helpers");

/**
 *  Slash-path oriented
 */
var get = function(keystored, key, otherwise) {
    var d = keystored;
    var subkeys = key.replace(/^\/*/, '').split('/');
    var lastkey = subkeys[subkeys.length - 1];

    for (var ski = 0; ski < subkeys.length - 1; ski++) {
        var subkey = subkeys[ski];
        var subd = d[subkey];
        if (subd === undefined) {
            return otherwise;
        } else if (_.isObject(subd)) {
            d = subd;
        } else {
            return otherwise;
        }
    }

    var value = d[lastkey];
    if (value === undefined) {
        return otherwise;
    }

    return value;
};

/**
 *  Slash-path oriented
 */
var set = function(keystored, key, value) {
    var d = keystored;
    var subkeys = key.replace(/^\/*/, '').split('/');
    var lastkey = subkeys[subkeys.length - 1];

    for (var ski = 0; ski < subkeys.length - 1; ski++) {
        var subkey = subkeys[ski];
        var subd = d[subkey];
        if (!_.isObject(subd)) {
            subd = {};
            d[subkey] = subd;
        }

        d = subd;
    }

    d[lastkey] = value;
};

exports.d = {
    get: get,
    set: set,
};
