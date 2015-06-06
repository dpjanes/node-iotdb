/*
 *  model.js
 *
 *  David Janes
 *  IOTDB
 *  2013-12-22
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

var assert = require("assert");
var url = require("url");
var path = require("path");

var _ = require("./helpers");
var attribute = require("./attribute");
var meta_thing = require("./meta");
var model_maker = require("./model_maker");
var iotdb = require("./iotdb");

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'model',
});

/* --- constants --- */
var VERBOSE = true;
var iot_name = _.ld.expand("schema:name");
var iot_role = _.ld.expand("iot:role");
var iot_role_reading = _.ld.expand("iot-attribute:role-reading");
var iot_role_control = _.ld.expand("iot-attribute:role-control");

var EVENT_THINGS_CHANGED = "things_changed";
var EVENT_THING_CHANGED = "state";
var EVENT_META_CHANGED = "meta";


/**
 *  Convenience function to make a ModelMaker instance
 *
 *  @param {string|undefined} _name
 *  see {@ThinkMaker} constructor
 *
 *  @return
 *  a new ModelMaker instance
 */
var make_model = function (_name) {
    return new model_maker.ModelMaker(_name);
};

/**
 *  Base class for all Things. It does nothing
 *  except exist.
 *  See {@link Thing~subclass} for arguments
 *  passed to subclasses.
 *
 *  <p>
 *  Generally you'll be using something you've made
 *  with {@link make_model} and won't use this at all
 *
 *  @classdesc
 *  Things are objects that represent real world things
 *  such as 
 *  a {@link http://www.belkin.com/us/Products/home-automation/c/wemo-home-automation/ Belkin WeMo},
 *  a {@link http://www.meethue.com/en-CA Philips Hue},
 *  an Arduino project,
 *  a heartrate monitor,
 *  a scale,
 *  and so forth.
 *  Things can be actuators (that is, they make things
 *  happen in the physical world) or sensors (they give readings).
 *
 *  <p>
 *  The purpose of the IOTDB is to provide a robust abstract description
 *  of all things, so that you can say "turn off the stove" or "set the lights
 *  to sunset red" <b>and the right thing will happen</b>, no matter what 
 *  the actual language, protocols or peculiarities of the real device.
 *
 *  <p>
 *  {@link Thing Things} are bound to real devices using {@link Driver Drivers}. 
 *  Things are designed in such a way that they can run on many modern devices,
 *  such as PCs, Raspberry Pis, iPhones, Androids, etc.. There is a JavaScript requirement,
 *  but just the "pure" language and not any libraries such as Node-JS.
 *
 *  <p>
 *  Here's an example of turning on a Thing and setting the color to red, using the
 *  Thing's native keys
 *
 *  <pre>
thing
    .set('rgb', '#FF0000')
 *  </pre>
 *
 *  <p>
 *  Here's an example of doing the same thing semantically
 *  <pre>
thing
    .set('iot-attribute:on', true)
    .set('iot-attribute:color', '#FF0000')
 *  </pre>
 *
 *  <hr />
 *
 *  @constructor
 */
var Model = function () {};

/**
 *  @callback Thing~subclass
 *
 *  All subclasses of Thing take a single
 *  argument <code>paramd</code>. All the
 *  options are optional.
 *
 *  @param {dictionary} paramd
 *
 *  @param {*} paramd.api_*
 *  All keys that start with api_* have their
 *  values copies
 *
 *  @return {function}
 *  A function that creates a subclass of Model.
 **/

/**
 *  Make a new instance of this Thing, using
 *  the current object as an exemplar.
 *  <p>
 *  See {@link Thing~subclass}
 *
 *  <p>
 *  <i>This uses a very Javascript hack,
 *  see source code for {@link ModelMaker#make ModelMaker.make}
 *  </i></p>
 */
Model.prototype.make = function (paramd) {
    return new this.__make(paramd);
};

/**
 */
Model.prototype.isa = function (classf) {
    return classf === this.__make;
};

/**
 */
Model.prototype.code = function () {
    return this.__code;
};

/**
 */
Model.prototype.name = function () {
    return this.__name;
};

/**
 */
Model.prototype.description = function () {
    return this.__description;
};

/**
 */
Model.prototype.help = function () {
    return this.__help;
};

/**
 *  0.6
 *  - now takes an argument and will return one
 *    of istate/ostate/meta/model to be more
 *    compatible with Transporters
 *
 *  0.5
 *  - state is constructed on the fly
 */
Model.prototype.state = function (band) {
    var self = this;

    self._validate_state(band);

    if (band === "istate") {
        return self._state_istate();
    } else if (band === "ostate") {
        return self._state_ostate();
    } else if (band === "meta") {
        return self._state_meta();
    } else if (band === "model") {
        return self._state_model();
    } else {
        logger.warn({
            method: "get",
            band: band,
        }, "band is usually istate/ostate/model/meta");
        return null;
    }
};

Model.prototype._state_istate = function () {
    var self = this;

    var state = {};
    var attributes = self.attributes();
    for (var ai in attributes) {
        var attribute = attributes[ai];

        _.d.set(state, attribute.code(), attribute._ivalue);
    }

    if (self._itimestamp) {
        _.d.set(state, "@timestamp", self._itimestamp);
    }

    return state;
};

Model.prototype._state_ostate = function () {
    var self = this;

    var state = {};
    var attributes = self.attributes();
    for (var ai in attributes) {
        var attribute = attributes[ai];

        _.d.set(state, attribute.code(), attribute._ovalue);
    }

    if (self._otimestamp) {
        _.d.set(state, "@timestamp", self._otimestamp);
    }

    return state;
};

Model.prototype._state_meta = function () {
    var self = this;

    return _.ld.compact(self.meta().state());
};

Model.prototype._state_model = function () {
    var self = this;

    return _.ld.compact(self.jsonld());
};

Model.prototype._validate_state = function (band) {
    var self = this;

    if (!_.is.String(band)) {
        throw new Error("Model.state: 'band' must be a String, not: " + band);
    }
};

/**
 */
Model.prototype.attributes = function () {
    var self = this;
    return self.__attributes;
};

/**
 *  Tags are for locally identitfying devices
 */
Model.prototype.has_tag = function (tag) {
    return _.ld.contains(this.initd, "tag", tag);
};

Model.prototype._validate_has_tag = function (tag) {
    var self = this;

    if (!_.is.String(tag)) {
        throw new Error("Model.has_tag: 'tag' must be a String, not: " + tag);
    }
};

/**
 *  Return the JSON-LD version of this thing
 *
 *  @param {dictionary} paramd
 *  @param {boolean} paramd.include_state
 *  Include the current state
 *
 *  @param {url} paramd.base
 *  Base URL, otherwise 'file:///<code>/'
 *
 *  @return {dictionary}
 *  JSON-LD dictionary
 */
Model.prototype.jsonld = function (paramd) {
    var self = this;
    var key;
    var value;
    var cd;

    paramd = (paramd !== undefined) ? paramd : {};
    paramd.base = (paramd.base !== undefined) ? paramd.base : ("file:///" + self.code() + "");
    paramd.context = (paramd.context !== undefined) ? paramd.context : true;
    paramd.path = (paramd.path !== undefined) ? paramd.path : "";

    var rd = {};
    var nss = {
        "iot": true,
        "schema": true,
    };

    if (paramd.context) {
        cd = {};
        cd["@base"] = paramd.base;
        cd["@vocab"] = paramd.base + "#";
        rd["@context"] = cd;
        rd["@id"] = "";
    } else if (paramd.path.length > 0) {
        rd["@id"] = "#" + paramd.path.replace(/\/+$/, '');
    } else {
        rd["@id"] = "#";
    }

    rd["@type"] = _.ld.expand("iot:Model");

    var name = self.name();
    if (!_.is.Empty(name)) {
        rd[_.ld.expand("schema:name")] = name;
    }

    var description = self.description();
    if (!_.is.Empty(description)) {
        rd[_.ld.expand("schema:description")] = description;
    }

    var help = self.help();
    if (!_.is.Empty(help)) {
        rd[_.ld.expand("iot:help")] = help;
    }

    // attributes
    var ads = [];
    var attributes = self.attributes();
    for (var ax in attributes) {
        var attribute = attributes[ax];
        var ad = {};
        // ad[_.ld.expand('schema:name')] = attribute.code()
        ads.push(ad);

        for (key in attribute) {
            if (!attribute.hasOwnProperty(key)) {
                continue;
            }

            value = attribute[key];
            if (value === undefined) {} else if (_.is.Function(value)) {} else if (key.match(/^_/)) {} else if (key === "@id") {
                ad[key] = "#" + paramd.path + value.substring(1);
            } else {
                ad[key] = value;
                nss[key.replace(/:.*$/, '')] = true;
            }
        }
    }
    if (ads.length > 0) {
        rd[_.ld.expand("iot:attribute")] = ads;
        nss["iot-attribute"] = true;
    }

    cd = rd["@context"];
    if (cd) {
        for (var nkey in nss) {
            var ns = _.ld.namespace[nkey];
            if (ns) {
                cd[nkey] = ns;
            }
        }
    }

    return rd;
};

/**
 *  Get a value from the state. Note that there's
 *  no guarentee that the state reflects what your
 *  thing actually is right now
 *
 *  @param find_key
 *  The key (see {@link Thing#_find Model.find} for possibilites)
 *
 *  @return {*}
 *  The current value in the state
 */
Model.prototype.get = function (find_key) {
    var self = this;

    self._validate_get(find_key);

    var rd = self._find(find_key, {
        get: true
    });
    if (rd === undefined) {
        // console.log("# Model.get: attribute '" + find_key + "' not found XXX");
        logger.error({
            method: "get",
            find_key: find_key
        }, "cannot find Attribute using find_key");
        return undefined;
    }

    if (rd.attribute) {
        if (rd.attribute._ivalue !== null) {
            return rd.attribute._ivalue;
        } else if (rd.attribute._ovalue !== null) {
            return rd.attribute._ovalue;
        } else {
            return null;
        }
    } else {
        logger.error({
            method: "get",
            find_key: find_key,
            cause: "Node-IOTDB programming error"
        }, "impossible state");

        throw new Error("Model.get: internal error: impossible state for: " + find_key);
    }
};

Model.prototype._validate_get = function (find_key) {
    if (!_.is.FindKey(find_key)) {
        throw new Error("Model.get: 'find_key' must be a String or a Dictionary");
    }
};

/**
 */
Model.prototype.update = function (band, updated, paramd) {
    var self = this;

    paramd = _.defaults(paramd, {});

    self._validate_update(band, updated, paramd);

    if (band === "istate") {
        self._update_istate(band, updated, paramd);
    } else if (band === "ostate") {
        self._update_ostate(band, updated, paramd);
    } else if (band === "meta") {
        self._update_meta(band, updated, paramd);
    }

    return self;
};

Model.prototype._validate_update = function (band, updated, paramd) {
    if (!_.is.String(band)) {
        throw new Error("Model.band: 'band' must be a String, not: " + band);
    }
    if (!_.is.Dictionary(updated)) {
        throw new Error("Model.update: 'find_key' must be a Dictionary, not: " + updated);
    }
    if (!_.is.Dictionary(paramd)) {
        throw new Error("Model.update: 'paramd' must be a Dictionary, not: " + paramd);
    }
};

/**
 *  "istate" is the Input STATE, the 'actual' state 
 *  of Thing as far as we know
 */
Model.prototype._update_istate = function (band, updated, paramd) {
    var self = this;

    paramd = _.defaults(paramd, {
        check_timestamp: true,
        set_timestamp: true,
        notify: true,
        validate: false,
    });

    if (paramd.check_timestamp && !_.timestamp.check.values(self._itimestamp, updated["@timestamp"])) {
        return;
    }

    // go through each update and see if it actually updates the attribute
    var changed_attributes = [];

    for (var attribute_code in updated) {
        var attribute_value = updated[attribute_code];
        if (attribute_value === undefined) {
            continue;
        }

        var attribute = self.__attributed[attribute_code];
        if (!attribute) {
            if (attribute_code !== "@timestamp") {
                logger.warn({
                    method: "_update_istate",
                    attribute_code: attribute_code,
                    model_code: self.code(),
                    cause: "likely programmer error"
                }, "attribute not found");
            }

            continue;
        }

        if (paramd.validate) {
            attribute_value = attribute.validate_value(attribute_value);
            if (attribute_value === undefined) {
                continue;
            }
        }


        if (attribute._ivalue === attribute_value) {
            continue;
        }

        attribute._ivalue = attribute_value;
        attribute._ichanged = true;

        changed_attributes.push(attribute);
    }

    if (_.isEmpty(changed_attributes)) {
        return;
    }

    // it has changed - let's update the timestamp 
    if (paramd.set_timestamp) {
        if (updated["@timestamp"]) {
            self._itimestamp = updated["@timestamp"];
        } else {
            self._itimestamp = _.timestamp.make();
        }
    }

    if (process.notify) {
        // callbacks for individual attributes -- callbacks happen nextTick 
        changed_attributes.map(function (attribute) {
            var callbacks = self.__callbacksd[attribute.code()];
            if (!callbacks) {
                return;
            }

            callbacks.map(function (callback) {
                process.nextTick(function () {
                    callback(self, attribute, attribute._ivalue);
                });
            });
        });

        // callbacks for _state_ -- callbacks happen nextTick 
        process.nextTick(function () {
            self.__emitter.emit("state", self);
        });
    }

    // callbacks for _istate_ -- callbacks happen nextTick 
    process.nextTick(function () {
        self.__emitter.emit("istate", self);
    });

    // clear
    changed_attributes.map(function (attribute) {
        attribute._ichanged = false;
    });
};

/**
 *  "ostate" is the Output STATE, the state we'd 
 *  like the Thing to become.
 */
Model.prototype._update_ostate = function (band, updated, paramd) {
    var self = this;

    paramd = _.defaults(paramd, {
        check_timestamp: true,
        set_timestamp: true,
        notify: true,
        validate: true,
        force: false,
    });

    if (paramd.check_timestamp && !_.timestamp.check.values(self._otimestamp, updated["@timestamp"])) {
        return;
    }

    // go through each update and see if it actually updates the attribute
    var changed_attributes = [];
    var push_attributes = [];

    for (var attribute_code in updated) {
        var attribute_value = updated[attribute_code];
        if (attribute_value === undefined) {
            continue;
        }

        var attribute = self.__attributed[attribute_code];
        if (!attribute) {
            if (attribute_code !== "@timestamp") {
                logger.warn({
                    method: "_update_ostate",
                    attribute_code: attribute_code,
                    model_code: self.code(),
                    cause: "likely programmer error"
                }, "attribute not found");
            }

            continue;
        }

        if (paramd.validate) {
            attribute_value = attribute.validate_value(attribute_value);
            if (attribute_value === undefined) {
                continue;
            }
        }

        if (attribute._ovalue === attribute_value) {
            if (paramd.force) {
                push_attributes.push(attribute);
            }

            continue;
        }

        attribute._ovalue = attribute_value;
        attribute._ochanged = true;

        changed_attributes.push(attribute);
        push_attributes.push(attribute);
    }

    if (!_.isEmpty(push_attributes)) {
        self._push_attributes(push_attributes);
    }

    // notifications - all happen nextTick
    if (!_.isEmpty(changed_attributes)) {
        // it has changed - let's update the timestamp 
        if (paramd.set_timestamp) {
            if (updated["@timestamp"]) {
                self._otimestamp = updated["@timestamp"];
            } else {
                self._otimestamp = _.timestamp.make();
            }
        }

        if (paramd.notify) {
            // callbacks for individual attributes
            changed_attributes.map(function (attribute) {
                var callbacks = self.__callbacksd[attribute.code()];
                if (!callbacks) {
                    return;
                }

                callbacks.map(function (callback) {
                    process.nextTick(function () {
                        callback(self, attribute, attribute._ovalue);
                    });
                });
            });

            // callbacks for _state_
            process.nextTick(function () {
                self.__emitter.emit("state", self);
            });
        }

        // callbacks for _ostate_ 
        process.nextTick(function () {
            self.__emitter.emit("ostate", self);
        });
    }

    // clear
    changed_attributes.map(function (attribute) {
        attribute._ochanged = false;
    });
};

/**
 *  Send values from this object to the Bridge
 *
 *  @return
 *  self
 *
 *  @protected
 */
Model.prototype._push_attributes = function (attributes) {
    var self = this;

    if (!self.bridge_instance) {
        logger.error({
            method: "_push_attributes",
        }, "no bridge_instance - doing nothing");

        self._clear_ostate();
        return;
    }

    if (!self.bridge_instance.reachable()) {
        logger.error({
            method: "_push_attributes",
        }, "bridge_instance is not reachable - doing nothing");

        self._clear_ostate();
        return;
    }

    var pushd = {};

    // mappings can be attached to bindings to make enumerations work better
    var mapping = self.bridge_instance.binding.mapping;

    attributes.map(function (attribute) {
        var attribute_code = attribute.code();
        var attribute_value = attribute._ovalue;

        if (mapping !== undefined) {
            var md = mapping[attribute_code];
            if (md !== undefined) {
                var v = md[attribute_value];
                if (v === undefined) {
                    v = md[_.ld.compact(attribute_value)];
                }
                if (v !== undefined) {
                    attribute_value = v;
                }
            }
        }

        _.d.set(pushd, attribute_code, attribute_value);
    });

    // nothing to do?
    if (_.isEmpty(pushd)) {
        return;
    }

    // do the push - on the nextTick
    process.nextTick(function () {
        if (!self.bridge_instance) {
            return;
        }

        self._pushes++;

        try {
            self.bridge_instance.push(pushd, function (error) {
                if (error) {
                    logger.error({
                        error: _.error.message(error),
                        cause: "likely in the Bridge",
                    }, "unexpected error pushing");
                }

                if (--self._pushes === 0) {
                    self._clear_ostate();
                }
            });
        } catch (x) {
            logger.error({
                exception: x,
                cause: "likely in the Bridge",
            }, "unexpected exception pushing");

            if (--self._pushes === 0) {
                self._clear_ostate();
            }
        }

        if (self._pushes < 0) {
            throw new Error("pushes decremeneted below 0!!!");
        }
    });
};

Model.prototype._clear_ostate = function () {
    var self = this;

    var changed = false;

    self.__attributes.map(function (attribute) {
        if ((attribute._ovalue === null) && !attribute._ochanged) {
            return;
        }

        attribute._ochanged = false;
        attribute._ovalue = null;

        changed = true;
    });

    if (changed) {
        self._otimestamp = _.timestamp.advance(self._otimestamp);
        self.__emitter.emit("ostate", self);
    }
};

Model.prototype._update_meta = function (band, updated, paramd) {
    var self = this;

    self.meta().update(updated, {
        check_timestamp: paramd.check_timestamp,
    });
};

/**
 *  Set a value.
 *
 *  <p>
 *  If this is not in a {@link Thing#start Model.start}/{@link Thing#end Model.end}
 *  bracketing, no callback notifications will be sent,
 *  the new_value will be validated against the attribute
 *  immediately, and the thing will be validated immediately.
 *
 *  <p>
 *  If it is inside, all those checks will be deferred
 *  until the {@link Thing#end Model.end} occurs.
 *
 *  @param find_key
 *  The key (see {@link Thing#_find Model.find} for possibilites)
 *
 *  @param {*} new_value
 *  The value to set
 */
Model.prototype.set = function (find_key, new_value) {
    var self = this;

    // too common to allow exceptions to be thrown, but don't like it
    if (new_value === undefined) {
        console.trace();
        logger.warn({
            method: "Model.set",
            find_key: find_key,
            new_value: new_value,
            cause: "usually a programmer error",
        }, "new_value should not be undefined");
        return;
    }

    self._validate_set(find_key, new_value);

    // convert the attribute to an attribute code here
    var rd = self._find(find_key, {
        set: true
    });

    if (rd === undefined) {
        logger.warn({
            method: "set",
            find_key: find_key,
            model_code: self.code(),
            cause: "likely programmer error"
        }, "attribute not found");
        return self;
    } else if (!rd.attribute) {
        throw new Error("Model.set: internal error: impossible state for: " + find_key);
    }

    // just handoff to "update"
    var updated = {};
    updated[rd.attribute.code()] = new_value;
    updated["@timestamp"] = _.timestamp.make();

    self.update("ostate", updated, {
        check_timestamp: false,
    });
};

Model.prototype._validate_set = function (find_key, new_value) {
    if (!_.is.FindKey(find_key)) {
        throw new Error("Model.set: 'find_key' must be a String or a Dictionary");
    }
    if (new_value === undefined) {
        throw new Error("Model.set: 'new_value' must not be undefined");
    }
};

/**
 *  Register for a callback. See {@link Thing#end Model.end}
 *  for when callbacks will occcur. Note that
 *  also that we try to supress callbacks
 *  if the value hasn't changed, though there's
 *  no guarentee we're 100% successful at this.
 *
 *  @param find_key
 *  The key to monitor for changes
 *  (see {@link Thing#_find Model.find} for possibilites)
 *
 *  @param {function} callback
 *  The callback function, which takes
 *  ( thing, attribute, new_value ) as arguments
 *
 *  @return
 *  this
 */
Model.prototype.on = function (find_key, callback) {
    var self = this;
    var attribute_key = null;
    var callbacks = null;

    self._validate_on(find_key, callback);

    /* HORRIBLE. */
    if ((find_key === "state") || (find_key === "meta") || (find_key === "istate") || (find_key === "ostate")) {
        self.__emitter.on(find_key, function (a, b, c) {
            callback(self, a, b, c); /* LAZY */
        });
        return self;
    }

    if (find_key === null) {
        attribute_key = null;

        callbacks = self.__callbacksd[attribute_key];
        if (callbacks === undefined) {
            self.__callbacksd[attribute_key] = callbacks = [];
        }

        callbacks.push(callback);

        return self;
    }

    var rd = self._find(find_key, {
        on: true
    });
    if (rd === undefined) {
        logger.error({
            method: "on",
            find_key: find_key
        }, "find_key not found");
        return self;
    }

    if (rd.attribute) {
        attribute_key = rd.attribute.code();

        callbacks = rd.thing.__callbacksd[attribute_key];
        if (callbacks === undefined) {
            rd.thing.__callbacksd[attribute_key] = callbacks = [];
        }

        callbacks.push(callback);

        return self;
    } else {
        logger.error({
            method: "on",
            find_key: find_key
        }, "impossible state");

        throw new Error("Model.on: error: impossible state: " + find_key);
    }
};

Model.prototype._validate_on = function (find_key, callback) {
    if (!_.is.FindKey(find_key)) {
        throw new Error("Model.on: 'find_key' must be a String or a Dictionary");
    }
    if (!_.is.Function(callback)) {
        throw new Error("Model.on: 'callback' must be a function");
    }
};

/**
 *  Register for changes to this Thing. The change callback
 *  is triggered at the of a update transaction.
 *
 *  @param {function} callback
 *  The callback function, which takes
 *  ( thing, changed_attributes ) as arguments
 *
 */
Model.prototype.on_change = function (callback) {
    var self = this;

    self._validate_on_change(callback);

    self.__emitter.on(EVENT_THING_CHANGED, function (thing) {
        callback(self, []);
    });

    return self;
};

Model.prototype._validate_on_change = function (callback) {
    if (!_.is.Function(callback)) {
        throw new Error("Model.on_change: 'callback' must be a function");
    }
};

/**
 *  On metadata change (including reachablity)
 */
Model.prototype.on_meta = function (callback) {
    var self = this;

    self._validate_on_meta(callback);

    self.__emitter.on(EVENT_META_CHANGED, function (thing) {
        if (iotdb.shutting_down()) {
            return;
        }

        callback(self, []);
    });

    return self;
};

Model.prototype._validate_on_meta = function (callback) {
    if (!_.is.Function(callback)) {
        throw new Error("Model.on_meta: 'callback' must be a function");
    }
};

/*
 *  Send a notification that the metadata has been changed
 */
Model.prototype.meta_changed = function () {
    if (iotdb.shutting_down()) {
        return;
    }

    this.__emitter.emit(EVENT_META_CHANGED, true);
};

Model.prototype.thing_id = function () {
    return this._thing_id;
};

/**
 *  Request values from the Bridge be brought to this object.
 *  Note that it's asynchronous
 *
 *  @return {this}
 */
Model.prototype.pull = function () {
    var self = this;

    if (self.bridge_instance) {
        self.bridge_instance.pull();
    }

    return self;
};

/* --- internals --- */
/**
 *  Push this updated attribute's value
 *  across the Bridge to make the change
 *  actually happen.
 *
 *  If there is a no stack or immediate is
 *  <b>true</b>, do the push immediately.
 *  Otherwise we store for later bulk push.
 *
 *  @param attributes
 *  The {@link Attribute} to push
 *
 *  @param immediate
 *  If true, push immediately no matter what
 *
 *  @protected
 */
Model.prototype._do_push = function (attribute, immediate) {
    var self = this;

    if (!self._transaction || immediate) {
        var attributed = {};
        attributed[attribute.code()] = attribute;

        self._do_pushes(attributed);
    } else {
        self._transaction._pushd[attribute.code()] = attribute;
    }

};

/**
 *  Notify listened of this updated attribute.
 *
 *  If there is a no stack or immediate is
 *  <b>true</b>, do the notifications immediately.
 *  Otherwise we store for later bulk notifications.
 *
 *  @param attributes
 *  The {@link Attribute} that triggers notifications
 *
 *  @param immediate
 *  If true, notify immediately no matter what
 *
 *  @protected
 */
Model.prototype._do_notify = function (attribute, immediate) {
    var self = this;

    if (!self._transaction || immediate) {
        var attributed = {};
        attributed[attribute.code()] = attribute;

        self._do_notifies(attributed);
        self._do_notifies_istate(attributed);
        self._do_notifies_ostate(attributed);
        self._do_notifies_send();
    } else {
        self._transaction._notifyd[attribute.code()] = attribute;
    }
};

/**
 *  Do a whole bunch of notifies, one for each
 *  attribute in attributes. Events are bubbled
 *  to parents (clearly identifying the original source!)
 *
 *  <p>
 *  XXX - There's likely a billion things wrong with this code
 *
 *  @param attributed
 *  A dictionary of {@link Attribute}, which are all the changed
 *  attributes.
 *
 *  @protected
 */
Model.prototype._do_notifies = function (attributed) {
    var self = this;
    var any = false;

    var _do_notifies_attribute = function (attribute) {
        any = true;

        var attribute_value = null;
        if (attribute._ivalue != null) {
            attribute_value = attribute._ivalue;
        } else if (attribute._ovalue != null) {
            attribute_value = attribute._ovalue;
        }

        var callbacks = self.__callbacksd[attribute_key];
        if (callbacks === undefined) {
            callbacks = self.__callbacksd[null];
        }
        if (callbacks) {
            callbacks.map(function (callback) {
                callback(self, attribute, attribute_value);
            });
        }
    };

    for (var attribute_key in attributed) {
        _do_notifies_attribute(attributed[attribute_key]);
    }

    // levels of hackdom here
    if (any) {
        this.__emitter.emit(EVENT_THING_CHANGED, self);
    }
};

/**
 *  This does istate/ostate notifications
 */
Model.prototype._do_notifies_istate = function (attributed) {
    var self = this;


    for (var attribute_key in attributed) {
        var attribute = attributed[attribute_key];

        self._ichanged |= attribute._ichanged;

        attribute._ichanged = false;
    }
};

Model.prototype._do_notifies_ostate = function (attributed) {
    var self = this;

    // console.log("DPJ._do_notifies_ostate: START CHECK NOTIFIES");

    for (var attribute_key in attributed) {
        var attribute = attributed[attribute_key];

        self._ochanged |= attribute._ochanged;

        // if (attribute._ochanged) { console.log("HERE:DPJ: OSTATE CHANGED", self._thing_id, attribute_key, attribute._ovalue); }

        attribute._ochanged = false;
    }

    // console.log("DPJ._do_notifies_ostate: END CHECK NOTIFIES");
};

Model.prototype._do_notifies_send = function () {
    var self = this;

    if (self._ichanged) {
        self._ichanged = false;
        self.__emitter.emit("istate", self);
    }

    if (self._ochanged) {
        self._ochanged = false;
        self.__emitter.emit("ostate", self);
    }
};

/**
 *  Find the {@link Attribute attribute} or {@link Thing subthing}
 *  of a key in this.
 *
 *  <p>
 *  If find_key is a string, it is split by the "/"
 *  character.
 *  All the except the last parts are traversed
 *  through submodels. The last part is then checked
 *  by the following rules:
 *
 *  <ul>
 *  <li>
 *  If it starts with an ":", we convert it to
 *  <code>iot-attribute:part</code>
 *  and research
 *  for a <code>iot:purpose</code> with that value.
 *
 *  <li>
 *  If it contains a ":" (past the first character),
 *  we {@link helpers:expand expand} and research
 *  for a <code>iot:purpose</code> with that value.
 *
 *  <li>
 *  Otherwise we look for an attribute with that key.
 *  If it's found, we return a dictionary with
 *  <code>{ attribute: attribute, thing: containing-thing }</code>
 *
 *  <li>
 *  Otherwise we look for an subthing with that key.
 *  If it's found, we return a dictionary with
 *  <code>{ subthing: subthing, thing: containing-thing }</code>
 *  </ul>
 *
 *  @param {string|Attribute} find_key
 *  The key to find, noting the rules above
 *
 *  @return {undefined|dictionary}
 *  If nothing is found, undefined.
 *  Otherwise a dictionary describing whether
 *  it was an {@link Attribute} or {@link Thing}
 *  found and what the contaning {@link Thing} is.
 *
 *  @protected
 */
Model.prototype._find = function (find_key, paramd) {
    var self = this;
    var d;
    var attribute;

    paramd = _.defaults(paramd, {
        set: false,
        get: false,
        on: false,
    });

    if (_.is.String(find_key)) {
        var subkeys = find_key.replace(/\/+/, "").split("/");
        var thing = self;

        var last_key = subkeys[subkeys.length - 1];
        if (last_key.substring(0, 1) === ":") {
            d = {};
            d[_.ld.expand("iot:purpose")] = _.ld.expand("iot-attribute:" + last_key.substring(1));

            return thing._find(d, paramd);
        } else if (last_key.indexOf(":") > -1) {
            d = {};
            d[_.ld.expand("iot:purpose")] = _.ld.expand(last_key);

            return thing._find(d, paramd);
        }

        attribute = thing.__attributed[last_key];
        if (attribute !== undefined) {
            return {
                thing: thing,
                attribute: attribute
            };
        }

        return undefined;
    } else {
        var attributes = self.attributes();
        var matches = [];
        for (var ai = 0; ai < attributes.length; ai++) {
            attribute = attributes[ai];

            var all = true;
            for (var match_key in find_key) {
                /*
                 *  Somewhat hacky - we always ignore '@'
                 *  values and we ignore schema:name (because
                 *  iotdb.make_attribute always adds a name)
                 */
                if (match_key === iot_name) {
                    continue;
                } else if (match_key.indexOf('@') === 0) {
                    continue;
                }

                var match_value = find_key[match_key];
                var attribute_value = attribute[match_key];
                if (_.is.Array(attribute_value)) {
                    if (_.is.Array(match_value)) {
                        for (var mvi in match_value) {
                            var mv = match_value[mvi];
                            if (attribute_value.indexOf(mv) === -1) {
                                all = false;
                                break;
                            }
                        }
                    } else {
                        if (attribute_value.indexOf(match_value) === -1) {
                            all = false;
                            break;
                        }
                    }
                } else if (match_value !== attribute_value) {
                    all = false;
                    break;
                }
            }

            if (all) {
                matches.push({
                    thing: self,
                    attribute: attribute
                });
            }
        }

        /*
         *  Because there's paired items with the same semantic meaning
         *  e.g. (on / on-value), we have to choose which one we want
         *  if there's multiple choices. I think more work will be needed here
         */
        if (!matches) {
            return undefined;
        } else if (matches.length === 1) {
            return matches[0];
        }

        var match_reading = null;
        var match_control = null;
        for (var mi in matches) {
            var match = matches[mi];
            if (_.ld.contains(match.attribute, iot_role, iot_role_reading)) {
                match_reading = match;
            }
            if (_.ld.contains(match.attribute, iot_role, iot_role_control)) {
                match_control = match;
            }
        }

        if (paramd.set && match_control) {
            return match_control;
        } else if (paramd.get && match_reading) {
            return match_reading;
        } else if (paramd.on && match_reading) {
            return match_reading;
        } else if (match_control) {
            return match_control;
        } else if (match_reading) {
            return match_control;
        } else {
            return matches[0];
        }

        return undefined;
    }

};

/**
 *  Return a Transmogrified version of this Thing.
 */
Model.prototype.transmogrify = function (transmogrifier) {
    return transmogrifier.transmogrify(this);
};


var metad = {};

/**
 *  Return an object to access and
 *  manipulate the Metadata.
 *  <p>
 *  Eventually we'll remove the Meta object,
 *  which is causing more trouble than 
 *  it's worth.
 */
Model.prototype.meta = function () {
    var self = this;

    if (self.__meta_thing === undefined) {
        self.__meta_thing = metad[self._thing_id];
        if (!self._meta_thing) {
            self.__meta_thing = new meta_thing.Meta(self);
            metad[self._thing_id] = self.__meta_thing;
        }
    }

    return self.__meta_thing;
};

/**
 *  Add a tag to this Model. Tags are temporary
 *  labels, they are not persisted to IOTDB
 *  (or the metadata in general).
 *
 *  @param {string} tag
 */
Model.prototype.tag = function (tag) {
    var self = this;

    assert.ok(_.is.String(tag));

    _.ld.add(self.initd, "tag", tag);
};

Model.prototype._validate_tag = function (tag) {
    if (!_.is.String(tag)) {
        throw new Error("Model.tag: 'tag' must be a String");
    }
};

/**
 */
Model.prototype.reachable = function () {
    var self = this;

    if (self.bridge_instance) {
        return self.bridge_instance.reachable();
    } else {
        return false;
    }
};

/**
 *  Disconnect this Model
 */
Model.prototype.disconnect = function () {
    var self = this;
    var wait = 0;

    if (self.bridge_instance) {
        if (self.bridge_instance.disconnect) {
            wait = self.bridge_instance.disconnect();
        }

        self.bridge_instance = null;
    }

    return wait;
};

var reachabled = {};

/**
 *  Note it's OK if we're already bound - this will just replace it
 */
Model.prototype.bind_bridge = function (bridge_instance) {
    var self = this;
    var is_reachable = bridge_instance.reachable() ? true : false;

    self._validate_bind_bridge(bridge_instance);

    self.bridge_instance = bridge_instance;
    if (self.bridge_instance) {
        var mapping = self.bridge_instance.binding.mapping;
        self.bridge_instance.pulled = function (pulld) {
            if (pulld) {
                // mappings can be attached to bindings to make enumerations better
                if (mapping !== undefined) {
                    for (var attribute_code in pulld) {
                        var md = mapping[attribute_code];
                        if (md === undefined) {
                            continue;
                        }

                        // reverse lookup in dictionary
                        var attribute_value = pulld[attribute_code];
                        var cattribute_value = _.ld.compact(attribute_value);

                        for (var mkey in md) {
                            var mvalue = md[mkey];
                            if ((mvalue === attribute_value) || (mvalue === cattribute_value)) {
                                pulld[attribute_code] = mkey;
                                break;
                            }
                        }
                    }
                }

                if (!pulld["@timestamp"]) {
                    pulld["@timestamp"] = _.timestamp.make();
                }

                self.update("istate", pulld);
            } else {
                // note the doesn't account for other meta changes sigh - real hack, fix
                if (reachabled[self._thing_id] !== is_reachable) {
                    console.log("WAS", reachabled[self._thing_id], "IS", is_reachable);
                    reachabled[self._thing_id] = is_reachable;

                    self.meta()._updated["@timestamp"] = _.timestamp.make();

                    self.meta_changed();
                }
            }
        };

        self._thing_id = self.bridge_instance.meta()["iot:thing"] + ":" + self.code();
    }

    reachabled[self._thing_id] = is_reachable;
    self.meta_changed();

    return self;
};

Model.prototype._validate_bind_bridge = function (bridge_instance) {
    if (!_.is.Bridge(bridge_instance)) {
        throw new Error("Model.bind_bridge: 'bridge_instance' must be a Bridge, not: " + bridge_instance);
    }
};

var make_model_from_jsonld = function (d) {
    var jsonld = _.ld.compact(d);

    if (jsonld["@type"] !== "iot:Model") {
        return null;
    }

    var base_url = jsonld["@context"]["@base"];
    var base_name = path.basename(url.parse(base_url).path).replace(/^.*:/, '');

    var mmaker = iotdb.make_model(base_name);

    var ads = jsonld["iot:attribute"];
    for (var ai in ads) {
        var ad = ads[ai];
        var a_type = ad["@type"];
        if (a_type !== "iot:Attribute") {
            continue;
        }

        var amaker = new attribute.Attribute();

        var a_id = ad["@id"];
        var a_code = a_id.replace(/^.*#/, '');
        amaker.code(a_code);

        for (var akey in ad) {
            var avalue = ad[akey];

            if (akey === "@id") {} else if (akey === "@type") {} else if (akey.indexOf(':') === -1) {} else {
                amaker.property_value(akey, avalue);
            }
        }

        amaker.make();
        mmaker.attribute(amaker);
    }

    return mmaker.make();
};

/*
 *  API
 */
exports.Model = Model;
exports.make_model = make_model;
exports.make_model_from_jsonld = make_model_from_jsonld;
