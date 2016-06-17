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

// NodeJS dependency loop workaround
if (!_.each) {
    _.each = require('underscore').each;
}

/**
 *  Slash-path oriented
 */
var get = function(keystored, key, otherwise) {
    if (!keystored) {
        return otherwise;
    }
    if (!key) {
        return otherwise;
    }

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
 */
var first = function(keystored, key, otherwise) {
    var value = get(keystored, key, undefined);
    if (value === undefined) {
        return otherwise;
    } else if (_.is.Array(value)) {
        if (value.length) {
            return value[0];
        } else {
            return otherwise;
        }
    } else {
        return value;
    }
};

/**
 */
var list = function(keystored, key, otherwise) {
    var value = get(keystored, key, undefined);
    if (value === undefined) {
        return otherwise;
    } else if (_.is.Array(value)) {
        return value;
    } else {
        return [ value ];
    }
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
        key: function(key, value, paramd) {
            return key;
        },
        value: function(value, paramd) {
            return value;
        },
        filter: function(value, paramd) {
            return (value !== undefined);
        },
        pre: function(value, paramd) {
            return value;
        },
        post: function(value, paramd) {
            return value;
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
                var ovvalue = ovd[ovkey];

                var nvkey = paramd.key(ovkey, ovvalue, paramd);
                if (nvkey === undefined) {
                    continue;
                }

                var nparamd = _.d.clone.shallow(paramd);
                nparamd._key = ovvalue;

                var nvvalue = _transform(ovvalue, nparamd);
                if (paramd.filter(nvvalue)) {
                    nvd[nvkey] = nvvalue;
                }
            }
            return nvd;
        } else {
            return paramd.value(v, paramd);
        }
    };


    o = paramd.pre(o, paramd);
    o = _transform(o, paramd);
    o = paramd.post(o, paramd);

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
    } else if (_.is.Array(xvalue)) {
        var ns = [];
        xvalue.map(function(o) {
            var n = json(o);
            if (n !== undefined) {
                ns.push(n);
            }
        });
        return ns;
    } else if (_.is.Object(xvalue)) {
        var nd = {};
        _.mapObject(xvalue, function(o, key) {
            var n = json(o);
            if (n !== undefined) {
                nd[key] = n;
            }
        });
        return nd;
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
        if (!_.is.Dictionary(xd)) {
            return;
        }

        for (var key in xd) {
            var xvalue = xd[key];
            var ovalue = od[key];

            if ((ovalue === null) || (ovalue === undefined)) {
                od[key] = _.d.clone.deep(xvalue);
            } else if (_.is.Dictionary(ovalue) && _.is.Dictionary(xvalue)) {
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
            newObj[i] = deep_clone(oldObj[i]);
        }
    }
    return newObj;
};

exports.d = {
    get: get,
    first: first,
    list: list,
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
