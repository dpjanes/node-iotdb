/*
 *  transmogrifier.js
 *
 *  David Janes
 *  IOTDB
 *  2014-11-18
 *
 *  Copyright [2013-2014] [David P. Janes]
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

var assert = require('assert');
var _ = require("./helpers");
var ThingArray = require("./thing_array").ThingArray;

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'transmogrifier',
});

/* --- constants --- */
var VERBOSE = true;

/**
 *  A 'Transmogrifier' changes the way a Thing works
 *  or appears in interface. It lets you do
 *  stuff like:
 *  <ul>
 *  <li>convert Fahrenheit to Celsius for all values
 *  <li>delay sending an event for a certain
 *    period of time
 *  </ul>
 *  <p>
 *  Random thoughts:
 *  </p>
 *  <ul>
 *  <li>when we transform attributes, we have to
 *      rewrite the attributes() function to
 *      return the new version so we can introspect
 *      this properly
 *  <li>we can write caching functions for each Model
 *  </ul>
 */
var Transmogrifier = function () {
    var self = this;

    self.___xd = null;
    self.___initd = {};
    self.___wrapped = null;
};

/**
 *  Make a new version of me. Redefine
 *  in every subclass
 */
Transmogrifier.prototype.___make = function (thing) {
    logger.error({
        method: "___make",
        cause: "Node-IOTDB error",
    }, "the subclass Transmogrifier did not define a ___make() function");

    return this;
}

/**
 *  This is called after everything else is
 *  done in 'transmogrify'. The original
 *  thing will be available in '___wrapped'.
 *  <p>
 *  By default this does nothing, but you
 *  may want to use this to do one-time setup,
 *  such as looking up the attributes
 */
Transmogrifier.prototype.___attach = function () {}

/**
 *  Transmogrify the 'Thing' object. A new object
 *  is returned that looks like the Thing, but
 *  actually is wrapped functions that handle
 *  the transmogrification.
 */
Transmogrifier.prototype.transmogrify = function (thing) {
    var self = this;

    if (!_.isModel(thing)) {
        logger.error({
            method: "transmogrify",
            cause: "likely the programmer has called this with the wrong object"
        }, "cannot transmogrify - needs to be a Thing");
        return;
    }

    var new_thing = self.___make(thing);

    var wrap_function = function (key, value_function) {
        return function () {
            var result = value_function.apply(thing, Array.prototype.slice.call(arguments));
            if (result === thing) {
                // console.log("HERE:XXX.1");
                return new_thing;
            } else {
                // console.log("HERE:XXX.2.1", result);
                // console.log("HERE:XXX.2.2", thing);
                return result;
            }
        };
    }

    for (var key in thing) {
        if (key.match(/^_/)) {
            continue;
        }

        if ((self[key] !== undefined) && (key !== "transmogrify")) {
            continue;
        }

        var value_function = thing[key];
        if (!_.isFunction(value_function)) {
            continue;
        }

        new_thing[key] = wrap_function(key, value_function);
    }

    new_thing.___wrapped = thing;
    new_thing.Model = thing.Model;

    new_thing.___attach();

    return new_thing;
};

/**
 *  We can't be the same model code as before if
 *  things have changed.
 */
Transmogrifier.prototype.get_code = function (key, callback) {
    var self = this;
    var thing = self.___wrapped;

    if (self.___initd.code) {
        return self.___initd.code;
    } else if (self.___xdd) {
        return thing.get_code() + "*";
    } else {
        return thing.get_code();
    }
}

/**
 *  Change the way 'on' works
 */
Transmogrifier.prototype.on = function (key, callback) {
    var self = this;
    var thing = self.___wrapped;

    var xd = self.___xdd[key];
    if (xd) {
        return thing.on(key, function (thing, attribute, value) {
            callback(self, xd.attribute, xd.get(value));
        });
    } else {
        return thing.on(key, callback);
    }
};

/**
 *  Change the way 'set' works
 */
Transmogrifier.prototype.set = function (key, value) {
    var self = this;
    var thing = self.___wrapped;

    var xd = self.___xdd[key];
    if (xd) {
        return thing.set(key, xd.set(value));
    } else {
        return thing.set(key, value);
    }
};

/**
 *  Change the way 'get' works
 */
Transmogrifier.prototype.get = function (key) {
    var self = this;
    var thing = self.___wrapped;

    var xd = self.___xdd[key];
    if (xd) {
        return xd.get(thing.get(key));
    } else {
        return thing.get(key);
    }
};

/**
 *  Change the way 'state' works
 *  <p>
 *  XXX - need to start dealing properly with nested states
 */
Transmogrifier.prototype.state = function () {
    var self = this;
    var thing = self.___wrapped;
    var state = thing.state();

    for (var key in state) {
        var xd = self.___xdd[key];
        if (xd) {
            state[key] = xd.get(state[key]);
        }
    }

    return state;
};

/**
 *  Change the way 'attributes' works
 */
Transmogrifier.prototype.attributes = function () {
    var self = this;
    var thing = self.___wrapped;
    var oattributes = thing.attributes();
    var nattributes = [];

    for (var ai in oattributes) {
        var attribute = oattributes[ai];
        var code = attribute.get_code();
        var xd = self.___xdd[key];
        if (xd) {
            nattributes.push(xd.attribute);
        } else {
            nattributes.push(attribute);
        }
    }

    return nattributes;
};

/*
 *  API
 */
exports.Transmogrifier = Transmogrifier;
