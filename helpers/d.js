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

/*
 *  Apply a function to keys and values of a dictionary
 */
var transform = function(o, paramd) {
    paramd = _.defaults(paramd, {
        key: function(key) {
            return key;
        },
        value: function(value) {
            return value;
        },
        filter: function(value) {
            return (value !== undefined);
        },
    });

    var _transform = function(v, paramd) {
        if (_.isArray(v)) {
            var ovs = v;
            var nvs = [];
            for (var ovx in ovs) {
                var ov = ovs[ovx];
                var nv = _transform(ov, paramd);
                if (paramd.filter(nv)) {
                    nvs.push(nv);
                }
            }
            return nvs;
        } else if ((v !== null) && _.isObject(v)) {
            var ovd = v;
            var nvd = {};
            for (var ovkey in ovd) {
                var nvkey = paramd.key(ovkey, paramd);
                if (nvkey === undefined) {
                    continue;
                }

                var ovvalue = ovd[ovkey];
                var nvvalue = _transform(ovvalue, paramd);
                if (paramd.filter(nvvalue)) {
                    nvd[nvkey] = nvvalue;
                }
            }
            return nvd;
        } else {
            return paramd.value(v);
        }
    };


    if (paramd.pre) {
        o = paramd.pre(o);
    }

    o = _transform(o, paramd);

    if (paramd.post) {
        o = paramd.post(o);
    }

    return o;
};

/**
 *  Return true if 'nd' should used
 *  Return false if it shouldn't
 *  Return null if it shouldn't because of a type problem
 *
 *  Timestamp-conflict:
 *  1) if neither has a timestamp, the 'nd' wins
 *  2) if one has a timestamp, that one wins
 *  3) if both have a timestamp, only update if 'nd'
 *     is later than the current value
 */
var check_timestamp = function(od, nd, paramd)  {
    if ((od === null) || !_.isObject(od)) {
        return null;
    }
    if ((nd === null) || !_.isObject(nd)) {
        return null;
    }

    paramd = _.defaults(paramd, {
        key: '@timestamp'
    });

    var ntimestamp = nd[paramd.key];
    var otimestamp = od[paramd.key];

    if (!ntimestamp && !otimestamp) {
        return true;
    } else if (ntimestamp && !otimestamp) {
        return true;
    } else if (!ntimestamp && otimestamp) {
        return false;
    } else if (ntimestamp <= otimestamp) {
        return false;
    } else {
        return true;
    }
};

exports.d = {
    get: get,
    set: set,
    transform: transform,
    check_timestamp: check_timestamp,
};
