/*
 *  is.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-04-15
 *
 *  Test types
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

var node_url = require('url');

var _ = require("../helpers");

/**
 */
var isThingArray = function (o) {
    return o && o._isThingArray;
};

/**
 */
var isTransport = function (o) {
    return o && o._isTransport;
};

/**
 */
var isModel = function (o) {
    return o && o._isModel;
};

/**
 */
var isThing = function (o) {
    return o && o._isThing;
};

/**
 */
var isBridge = function (o) {
    return o && o._isBridge;
};


/**
 */
var isDictionary = function(o) {
    if (_.is.Array(o)) {
        return false;
    } else if (_.is.Function(o)) {
        return false;
    } else if (o === null) {
        return false;
    } else if (!_.is.Object(o)) {
        return false;
    } else if (o.constructor === Object) {
        return true;
    } else {
        return false;
    }
};

var isFindKey = function(o) {
    return _.is.String(o) || _.is.Dictionary(o);
};

var isNull = function (obj) {
    return obj === null;
};

var isUndefined = function (obj) {
    return obj === void 0;
};

var isAbsoluteURL = function (o) {
    if (typeof o !== 'string') {
        return false;
    }

    var u = node_url.parse(o);
    if (!u) {
        return false;
    }
    if (!u.protocol) {
        return false;
    }

    return u.protocol.length > 0;
};

var isString = function (o) {
    return typeof o === 'string';
};

var isBoolean = function (o) {
    return typeof o === 'boolean';
};

var isFunction = function (o) {
    return typeof o === 'function';
};

var isNumber = function (o) {
    return typeof o === 'number';
};

var isInteger = function (o) {
    return typeof o === 'number' && ((o % 1) === 0);
};

var isDate = function (o) {
    return o instanceof Date;
};

var isRegExp = function (o) {
    return o instanceof RegExp;
};

var isObject = function (obj) {
    return _.underscore.isObject(obj);
};

var _isNaN = function (obj) {
    return isNumber(obj) && isNaN(obj);
};

var _ArrayOfX = function(vs, test) {
    if (!Array.isArray(vs)) {
        return false;
    }

    for (var vi in vs) {
        if (!test(vs[vi])) {
            return false;
        }
    }

    return true;
};

var isArrayOfString = function(o) {
    return _ArrayOfX(o, isString);
};

var isArrayOfDictionary = function(o) {
    return _ArrayOfX(o, isDictionary);
};

var isArrayOfObject = function(o) {
    return _ArrayOfX(o, isObject);
};

exports.is = {
    // IOTDB classes
    Thing: isThing,
    Model: isModel,
    ThingArray: isThingArray,
    Transport: isTransport,
    Transporter: isTransport,
    Bridge: isBridge,
    FindKey: isFindKey,

    // useful helpers
    Dictionary: isDictionary,
    AbsoluteURL: isAbsoluteURL,

    // consistency
    Empty: _.underscore.isEmpty,
    Equal: _.underscore.isEqual,

    // Javascript classes and types
    Array: Array.isArray,
    Boolean: isBoolean,
    Date: isDate,
    Function: isFunction,
    Integer: isInteger,
    Null: isNull,
    Number: isNumber,
    Object: isObject,
    RegExp: isRegExp,
    String: isString,
    Undefined: isUndefined,
    NaN: _isNaN,

    // aggregates
    ArrayOfString: isArrayOfString,
    ArrayOfObject: isArrayOfObject,
    ArrayOfDictionary: isArrayOfDictionary,
};
