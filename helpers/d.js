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
        } else if (_.is.Object(subd)) {
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
        if (!_.is.Object(subd)) {
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
        if (_.is.Array(v)) {
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
        } else if ((v !== null) && _.is.Object(v)) {
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
 *  Return true iff everything in subd is in superd
 *  Note that not recursive on dictionaries
 */
var d_contains_d = function (superd, subd) {
    if (!_.is.Dictionary(superd)) {
        return false;
    }
    if (!_.is.Dictionary(subd)) {
        return false;
    }

    var subkeys = _.keys(subd);
    for (var sx in subkeys) {
        var subkey = subkeys[sx];
        var subvalue = subd[subkey];
        var supervalue = superd[subkey];
        if (!_.is.Equal(subvalue, supervalue)) {
            return false;
        }
    }

    return true;
};

/**
 *  Returns a JSON-scrubed version
 */
var json = function (xvalue) {
    if (xvalue === undefined) {
        return undefined;
    } else if (_.is.Function(xvalue)) {
        return undefined;
    } else if (_.is.NaN(xvalue)) {
        return undefined;
    } else if (_.is.Dictionary(xvalue)) {
        var nd = {};
        _.mapObject(xvalue, function(o, key) {
            var n = json(o);
            if (n !== undefined) {
                nd[key] = n;
            }
        });
        return nd;
    } else if (_.is.Array(xvalue)) {
        var ns = [];
        xvalue.map(function(o) {
            var n = json(o);
            if (n !== undefined) {
                ns.push(n);
            }
        });
        return ns;
    } else {
        return xvalue;
    }
};

/**
 *  Like extend, except dictionaries get merged.
 */
var smart_extend = function (od) {
    if (!_.is.Dictionary(od)) {
        od = {};
    }

    _.each(Array.prototype.slice.call(arguments, 1), function (xd) {
        if (!_.isObject(xd)) {
            return;
        }

        for (var key in xd) {
            var xvalue = xd[key];
            var ovalue = od[key];

            if ((ovalue === null) || (ovalue === undefined)) {
                od[key] = _.deepCopy(xvalue);
            } else if (_.isObject(ovalue) && _.isObject(xvalue)) {
                smart_extend(ovalue, xvalue);
            } else {
                od[key] = xvalue;
            }
        }
    });

    return od;
};

/**
 *  Return a new Object composed of all its
 *  arguments. A value is _only_ set if it's
 *  not already set from a preceeding argument.
 */
var shallow_compose = function () {
    var d = {};

    _.each(arguments, function (ad) {
        for (var key in ad) {
            if (d[key] === undefined) {
                d[key] = ad[key];
            }
        }
    });

    return d;
};

var shallow_clone = function (oldObj) {
    var newObj = {};
    for (var i in oldObj) {
        if (oldObj.hasOwnProperty(i)) {
            newObj[i] = oldObj[i];
        }
    }
    return newObj;
};

var deep_clone = function (oldObj) {
    var newObj = oldObj;
    if (oldObj && typeof oldObj === 'object') {
        newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
        for (var i in oldObj) {
            newObj[i] = exports.deepCopy(oldObj[i]);
        }
    }
    return newObj;
};

exports.d = {
    get: get,
    set: set,
    transform: transform,
    smart_extend: smart_extend, // depreciate this usage
    json: json,
    compose: {
        shallow: shallow_compose,
        smart: smart_extend,
    },
    clone: {
        shallow: shallow_clone,
        deep: deep_clone,
    },
    is: {
        superset: function(a, b) {
            return d_contains_d(a, b);
        },
        subset: function(a, b) {
            return d_contains_d(b, a);
        },
    }
};
