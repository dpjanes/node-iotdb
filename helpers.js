/*
 *  helpers.js
 *
 *  David Janes
 *  IOTDB.org
 *  2013-12-01
 *
 *  Nodejs IOTDB control
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

var crypto = require('crypto');
var node_url = require('url');
var path = require('path');

exports.underscore = require('underscore')

var modules = [
    exports.underscore,
    require('./helpers/ld'),
    require('./helpers/id'),
    require('./helpers/d'),
    require('./helpers/hash'),
    require('./helpers/is'),
];
for (var mi in modules) {
    var module = modules[mi];
    for (var key in module) {
        exports[key] = module[key];
    }
}

exports.Color = require("./helpers/color").Color;
exports.temperature = require("./helpers/temperature").temperature;

exports.http = {};
exports.http.parse_link = require("./helpers/parse_link").parse_link;

var _queued = {};
exports.Queue = require('./queue').FIFOQueue;
exports.queue = function (name) {
    var queue = _queued[name];
    if (!queue) {
        queue = new exports.Queue(name);
        _queued[name] = queue
    }

    return queue;
}

exports.bridge_wrapper = require('./bridge_wrapper').bridge_wrapper;

/**
 *  @module helpers
 */

// Establish the object that gets returned to break out of a loop iteration.
var breaker = {};

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype,
    ObjProto = Object.prototype,
    FuncProto = Function.prototype;

//use the faster Date.now if available.
var getTime = (Date.now || function () {
    return new Date().getTime();
});

// Create quick reference variables for speed access to core prototypes.
var
    push = ArrayProto.push,
    slice = ArrayProto.slice,
    concat = ArrayProto.concat,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

// All **ECMAScript 5** native function implementations that we hope to use
// are declared here.
var
    nativeForEach = ArrayProto.forEach,
    nativeMap = ArrayProto.map,
    nativeReduce = ArrayProto.reduce,
    nativeReduceRight = ArrayProto.reduceRight,
    nativeFilter = ArrayProto.filter,
    nativeEvery = ArrayProto.every,
    nativeSome = ArrayProto.some,
    nativeIndexOf = ArrayProto.indexOf,
    nativeLastIndexOf = ArrayProto.lastIndexOf,
    nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = FuncProto.bind;


// Collection Functions
// --------------------

// The cornerstone, an `each` implementation, aka `forEach`.
// Handles objects with the built-in `forEach`, arrays, and raw objects.
// Delegates to **ECMAScript 5**'s native `forEach` if available.
var each = exports.each = exports.forEach = function (obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, length = obj.length; i < length; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) return;
        }
    } else {
        var keys = exports.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
        }
    }
};

// Create a (shallow-cloned) duplicate of an object.
exports.clone = function (obj) {
    if (!exports.isObject(obj)) return obj;
    return exports.isArray(obj) ? obj.slice() : exports.extend({}, obj);
};

// Invokes interceptor with the obj, and then returns obj.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
exports.tap = function (obj, interceptor) {
    interceptor(obj);
    return obj;
};


// Shortcut function for checking if an object has a given property directly
// on itself (in other words, not on a prototype).
exports.has = function (obj, key) {
    return hasOwnProperty.call(obj, key);
};

/*
 *  The next three functions courtesy
 *  http://geniuscarrier.com/copy-object-in-javascript/
 */
exports.shallowCopy = function (oldObj) {
    var newObj = {};
    for (var i in oldObj) {
        if (oldObj.hasOwnProperty(i)) {
            newObj[i] = oldObj[i];
        }
    }
    return newObj;
};

exports.deepCopy = function (oldObj) {
    var newObj = oldObj;
    if (oldObj && typeof oldObj === 'object') {
        newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
        for (var i in oldObj) {
            newObj[i] = exports.deepCopy(oldObj[i]);
        }
    }
    return newObj;
};

exports.mix = function () {
    var i, j, newObj = {};
    for (i = 0; i < arguments.length; i++) {
        for (j in arguments[i]) {
            if (arguments[i].hasOwnProperty(j)) {
                newObj[j] = arguments[i][j];
            }
        }
    }
    return newObj;
};

/**
 *  Return the proper keys of a dictionary
 */
exports.keys = function (d) {
    var keys = [];

    for (var key in d) {
        if (d.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    return keys;
};

/**
 *  Return true iff everthing a === b, in a deep
 *  and "pythonic" sense
 */
exports.equals = function (a, b) {
    return exports.isEqual(a, b);
};

/**
 *  Return true iff everything in subd is in superd
 */
exports.d_contains_d = function (superd, subd) {
    var subkeys = exports.keys(subd);
    for (var sx in subkeys) {
        var subkey = subkeys[sx];
        var subvalue = subd[subkey];
        var supervalue = superd[subkey];
        if (subvalue !== supervalue) {
            return false;
        }
    }

    return true;
};

/**
 */
exports.flatten_arguments = function (a) {
    var rs = [];

    for (var ai = 0; ai < a.length; ai++) {
        rs.push(a[ai]);
    }

    return rs;
};



/*
 *  From:
 *  http://stackoverflow.com/a/1573141/96338
 */
exports.colord = {
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aqua": "#00ffff",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "black": "#000000",
    "blanchedalmond": "#ffebcd",
    "blue": "#0000ff",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgreen": "#006400",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "fuchsia": "#ff00ff",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "gray": "#808080",
    "green": "#008000",
    "greenyellow": "#adff2f",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred ": "#cd5c5c",
    "indigo ": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgrey": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370d8",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "navy": "#000080",
    "oldlace": "#fdf5e6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#d87093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "purple": "#800080",
    "red": "#ff0000",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "silver": "#c0c0c0",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "white": "#ffffff",
    "whitesmoke": "#f5f5f5",
    "yellow": "#ffff00",
    "yellowgreen": "#9acd32"
};

exports.color_to_hex = function (name, otherwise) {
    name = name.toLowerCase();

    var hex = exports.colord[name];
    if (hex !== undefined) {
        return hex.toUpperCase();
    } else {
        return otherwise;
    }
};

/* XXX NOT INTEGRATED YET */
function decimalToHex(d, padding) {
    var hex = Number(Math.floor(d)).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
};

/* --- random stuff --- */
exports.randint = function (n) {
    return Math.floor(Math.random() * n);
};

exports.choose = function (vs) {
    return vs[exports.randint(vs.length)];
};

/**
 *  Copy all keys that start with "api_"
 */
/*
exports.copy_api = function (fromd, tod) {
    var keys = exports.keys(fromd);
    for (var ki in keys) {
        var key = keys[ki];
        if (key.match(/^api_/)) {
            tod[key] = fromd[key];
        }
    }
};
 */

/**
 *  This reliably returns an MD5 hex hash of a _simple_ dictionary
 */
/*
exports.hash_dictionary = function (d, ignores) {
    ignores = ignores ? ignores : [];

    var keys = exports.keys(d);
    keys.sort()

    var hasher = crypto.createHash('md5');

    for (var ki = 0; ki < keys.length; ki++) {
        var key = keys[ki];
        if (ignores.indexOf(key) > -1) {
            continue;
        }

        var value = d[key];
        hasher.update("\0", "binary");
        hasher.update(key, "utf8");
        hasher.update("\0", "binary");
        hasher.update("" + value, "utf8");
    }

    return hasher.digest("hex")
};
*/

/**
 *  PERFER hash.md5
 */
/*
exports.md5_hash = function () {
    var hasher = crypto.createHash('md5');
    for (var ai in arguments) {
        var a = arguments[ai];
        hasher.update("" + a)
    }

    return hasher.digest("hex")
};
*/

/**
 *  Adds the "thing_id" key to the dictionary, which
 *  is the {@link helpers#hash_dictionary} of the dictionary
 *  but ignores the key "thing_id" (meaning this function
 *  is safe to call multiple times)
 *
 *  @param {dictionary} identityd
 *  A simple dictionary of values the comprise the identity
 */
/*
exports.thing_id = function (identityd) {
    var hash = exports.hash_dictionary(identityd, ["thing_id", ]);
    identityd["thing_id"] = "urn:iotdb:device:" + hash;
};
*/

/**
 *  Test if the identities "overlap". This is determined by:
 *
 *  <ul>
 *  <li>Every key in subd must be in superd
 *  <li>isArray(supervalue) && isArray(subvalue) : they must have a common element
 *  <li>isArray(supervalue) && !isArray(subvalue) : supevalue must contain subvalue
 *  <li>!isArray(supervalue) && isArray(subvalue) : subvalue must contain supervalue
 *  <li>!isArray(supervalue) && !isArray(subvalue) : subvalue must === supervalue
 *  </ul>
 */
/*
exports.identity_overlap = function (superd, subd) {
    var subkeys = exports.keys(subd);
    for (var skx in subkeys) {
        var subkey = subkeys[skx];
        var supervalue = superd[subkey];
        var subvalue = subd[subkey];

        if (exports.isArray(supervalue)) {
            if (exports.isArray(subvalue)) {
                var common = false;
                for (var ax in supervalue) {
                    for (var bx in subvalue) {
                        if (supervalue[ax] === subvalue[bx]) {
                            common = true;
                            break;
                        }
                    }
                    if (common) {
                        break;
                    }
                }
                if (!common) {
                    return false;
                }
            } else if (supervalue.indexOf(subvalue) == -1) {
                return false;
            }
        } else if (exports.isArray(subvalue)) {
            if (subvalue.indexOf(supervalue) == -1) {
                return false;
            }
        } else if (supervalue !== subvalue) {
            return false;
        }
    }

    return true;
};
*/

/**
 *  Make sure a 'paramd' is properly set up. That is,
 *  that it's a dictionary and if any values in defaultd
 *  are undefined in paramd, they're copied over
 *
 *  @param {dictionary|undefined} paramd
 *  The paramd passed in to the function calling this.
 *  Often undefined
 *
 *  @param {dictionary} defaultd
 *  What the values should be
 *
 *  @param {dictionary}
 *  The paramd to use, not necessarily the one passed in
 */
exports.defaults = function (paramd) {
    if (!paramd) {
        paramd = {}
    }

    each(slice.call(arguments, 1), function (defaultd) {
        for (var key in defaultd) {
            var pvalue = paramd[key]
            if (pvalue === undefined) {
                paramd[key] = defaultd[key]
            }
        }
    });

    return paramd;
};

/**
 *  Like extend, except dictionaries get merged.
 *  This also only uses JSON-like params, functions
 *  are not copied
 */
exports.smart_extend = function (od) {
    each(slice.call(arguments, 1), function (xd) {
        if (!exports.isObject(xd)) {
            return;
        }

        for (var key in xd) {
            var xvalue = xd[key]
            var ovalue = od[key]

            if ((ovalue === null) || (ovalue === undefined)) {
                od[key] = exports.deepCopy(xvalue);
            } else if (exports.isObject(ovalue) && exports.isObject(xvalue)) {
                exports.smart_extend(ovalue, xvalue)
            } else if (xvalue === undefined) {} else if (exports.isFunction(xvalue)) {} else if (exports.isNaN(xvalue)) {} else {
                od[key] = xvalue
            }
        }
    })

    return od;
};

/**
 *  Remove any loops in the hierarchy
 *  This isn't really working yet - something wrong in the array part
 */
/*
exports.scrub_circular = function (value, parents) {
    if (parents === undefined) {
        parents = [];
    }

    if (value === undefined) {
        return undefined;
    } else if (value === null) {
        return null;
    } else if (exports.isBoolean(value)) {
        return value;
    } else if (exports.isNumber(value)) {
        return value;
    } else if (exports.isString(value)) {
        return value;
    } else if (exports.isArray(value)) {
        // BROKEN
        if (parents.length > 5) {
            return undefined;
        }

        var nparents = parents.slice();
        nparents.push(value);

        var nvalues = [];
        for (var vi in value) {
            var ovalue = value[vi];
            var nvalue = exports.scrub_circular(ovalue, nparents);
            if (nvalue !== undefined) {
                nvalues.push(nvalue);
            }
        }

        return nvalues;
    } else if (exports.isObject(value)) {
        // BROKEN
        if (parents.length > 5) {
            return undefined;
        }

        if (parents.indexOf(value) !== -1) {
            return undefined;
        }

        var nparents = parents.slice();
        nparents.push(value);

        var nvalued = {}
        for (var okey in value) {
            var ovalue = value[okey];
            var nvalue = exports.scrub_circular(ovalue, nparents);
            if (nvalue !== undefined) {
                nvalued[okey] = nvalue;
            }
        }

        return nvalued;
    } else {
        return undefined;
    }
};
*/

/**
 *  Get a 'code' (like a model_code) from a URL. Basically
 *  the last path component in either the hash or in the path itself
 *
 *  @param {string} iri
 *  The IRI to get the code from
 *
 *  @return {string}
 *  The code
 */
exports.iri_to_code = function (iri) {
    var urlp = node_url.parse(iri);
    if (urlp.hash && urlp.hash.length > 1) {
        return path.basename(urlp.hash.substring(1))
    } else {
        return path.basename(urlp.pathname)
    }
};

exports.dump_things = function (iot, things) {
    console.log("----")
    console.log("#things", things.length);
    for (var ti = 0; ti < things.length; ti++) {
        var thing = things[ti];
        var meta = thing.meta()

        console.log("")
        console.log("  thing#:", ti + 1);
        console.log("  name:", thing.code);
        console.log("  thing_id:", thing.thing_id());

        if (thing.initd.tag) {
            console.log("  tags:", thing.initd.tag)
        }
    }
};

/**
 *  Django(-ish) string formatting. Can take
 *  multiple dictionaries as arguments, priority
 *  given to the first argument seen
 *  <p>
 *  The first argument can be JSON-like objects,
 *  in which case we'll run this recursively
 */
exports.format = function () {
    if (arguments.length == 0) {
        throw "format requires at least one argument"
    }

    var template = arguments[0]

    var valueds = []
    for (var ai = 1; ai < arguments.length; ai++) {
        valueds.push(arguments[ai])
    }

    return _format(template, valueds)
};

var _format = function (template, valueds) {
    if (exports.isArray(template)) {
        var ns = []
        var os = template
        for (var oi = 0; oi < os.length; oi++) {
            var o = os[oi]
            var n = _format(o, valueds)
            ns.append(ns)
        }
    } else if (exports.isObject(template)) {
        var nd = {}
        var od = template
        for (var key in od) {
            var ovalue = od[key]
            var nvalue = _format(ovalue, valueds)
            nd[key] = nvalue
        }

        return nd
    } else if (!exports.isString(template)) {
        return template
    } else {
        return template.replace(/{{(.*?)}}/g, function (match, variable) {
            var otherwise = ""

            // we can layer in django "|" later
            var colonx = variable.indexOf(':')
            if (colonx > -1) {
                otherwise = variable.substring(colonx + 1)
                variable = variable.substring(0, colonx)
            }

            var parts = variable.replace(/ /g, '').split('.')

            var found = false;

            for (var vdi = 0; vdi < valueds.length; vdi++) {
                var valued = valueds[vdi];
                for (var pi = 0; pi < parts.length - 1; pi++) {
                    var part = parts[pi];
                    var subd = valued[part];
                    if (!exports.isObject(subd)) {
                        break;
                    }

                    valued = subd
                }

                var value = valued[parts[parts.length - 1]]
                if (value !== undefined) {
                    return "" + value
                }
            }

            return otherwise
        })

        return template
    }
};

/**
 *  Try to figure out our IP address
 */
exports.ipv4 = function () {
    var os = require('os');
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        var devs = ifaces[dev]
        for (var di in devs) {
            var details = devs[di]

            if (details.family != 'IPv4') {
                continue
            }
            if (details.address == '127.0.0.1') {
                continue
            }

            return details.address
        }
    }
}

/**
 */
exports.uid = function (len) {
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};

/**
 *  Return a timestamp in the standard format.
 *  Which just happens to be the JavaScript 
 *  ISOString format.
 */
exports.timestamp = function () {
    return (new Date()).toISOString();
};


var oneofd = {};
exports.oneof = function (module) {
    var m = oneofd[module];
    if (m === undefined) {
        m = require(module);
        if (module === 'seneca') { // HACK!
            m = m();
        }
        oneofd[module] = m;
    }

    return m;
};
