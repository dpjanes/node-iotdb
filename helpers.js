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
    require('./helpers/color'),
    require('./helpers/timestamp'),
    require('./helpers/error'),
];
for (var mi in modules) {
    var module = modules[mi];
    for (var key in module) {
        exports[key] = module[key];
    }
}

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

/* --- random stuff --- */
exports.randint = function (n) {
    return Math.floor(Math.random() * n);
};

exports.choose = function (vs) {
    return vs[exports.randint(vs.length)];
};

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
        console.log("  name:", thing.code());
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
