/*
 *  model_maker.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-01
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

var _ = require("./helpers");
var attribute = require("./attribute");
var model = require("./model");
var constants = require("./constants");

var events = require('events');
var util = require('util');
var assert = require('assert');

var logger = _.logger.make({
    name: 'iotdb',
    module: 'model_maker',
});

/* --- constants --- */
var VERBOSE = true;

/**
 *  A class for making {@link Thing Things}.
 *  <p>
 *  Typically you will call {@link make_model} to 
 *  get one of these objects.
 *
 *  @classdesc
 *  This class <i>massively</i>
 *  simplifies the process of making subclasses 
 *  of {@link Thing}.
 *
 *  <p>
 *  Note that this is advanced class stuff. If 
 *  a Thing you are using is already defined, you'll
 *  never need to know what's in here. Hopefully
 *  over time this will become more and more true.
 *
 *  <p>
 *  Here's the definition of a Philips Hue.
 *  Really, this is it:
 *
 *  <pre>
var HueLight = model.make_model('HueLight')
    .attribute(attribute.make_boolean("on"))
    .attribute(
        attribute.make_string("color")
            .format("iot:format.color")
    )
    .make()
 *  </pre>
 *  <p>
 *  This definition says:
 *  <ul>
 *  <li>It can be turned on and off (using <code>on</code>)
 *  <li>The color can be changed (using <code>color</code>)
 *  </ul>
 *
 *  <p>
 *  Never forget the final <code>make()</code>
 *  <hr />
 *
 *  @param {string|undefined} _code
 *  See {@link ModelMaker#code ModelMaker.code}. Does not
 *  need to be set in the constructor
 *
 *  @constructor
 */
var ModelMaker = function (_code) {
    this.__attributed = {};
    this.__attributes = [];
    this.__code = (_code !== undefined) ? _.id.to_dash_case(_code) : null;

    this.__name = null;
    this.__description = null;
    this.__help = null;
    this.__facets = [];
    this.__propertyd = {};
};

/**
 *  The code for this device. This will correspond
 *  to the code in IOTDB (both the website and the
 *  {@link IOTDB object})
 *
 *  @param {string} _code
 *  The code. The function {@link helpers#id.to_dash_case} is
 *  <b>always</b> called on the code
 *
 *  @return {this}
 */
ModelMaker.prototype.code = function (_code) {
    var self = this;

    self.__code = _.id.to_dash_case(_code);

    return self;
};

/**
 *  Define the {@link https://iotdb.org/pub/iot.html#name schema:name}
 *  of this attribute. Name can only be set once
 *
 *  @param {string} value
 *  The name, for humans
 *
 *  @return {this}
 *  this
 */
ModelMaker.prototype.name = function (value) {
    var self = this;

    self.__name = value;

    return self;
};

/**
 *  A description for this device. Purely for humans.
 *
 *  @param {string} value
 *  The description
 *
 *  @return {this}
 */
ModelMaker.prototype.description = function (value) {
    var self = this;

    self.__description = value;

    return self;
};


/**
 *  Help text for this device. Purely for humans.
 *
 *  @param {string} value
 *  The description
 *
 *  @return {this}
 */
ModelMaker.prototype.help = function (value) {
    var self = this;

    self.__help = value;

    return self;
};

/**
 */
ModelMaker.prototype.product = function (value) {
    return this;
};

/**
 */
ModelMaker.prototype.facet = function (facets) {
    var self = this;
    var facet_prefix = _.ld.expand("iot-facet:");


    var _add_inner = function (facet) {
        if (self.__facets.indexOf(facet) !== -1) {
            return;
        }

        self.__facets.push(facet);
    };

    var _add_outer = function (facet) {
        facet = _.ld.expand(facet, "iot-facet:");
        if (facet.indexOf(facet_prefix) !== 0) {
            _add_inner(facet);
        } else {
            var parts = facet.split(".");
            for (var pi = 1; pi < parts.length; pi++) {
                _add_inner(parts.slice(0, pi + 1).join("."));
            }
        }
    };

    if (_.is.Array(facets)) {
        facets.map(_add_outer);
    } else {
        _add_outer(facets);
    }

    return this;
};

ModelMaker.prototype.property_value = function (key_iri, value, paramd) {
    var self = this;

    key_iri = _.ld.expand(key_iri);
    if (key_iri === constants.schema_name) {
        self.name(value);
    } else if (key_iri === constants.schema_description) {
        self.description(value);
    } else if (key_iri === constants.iot_facet) {
        self.facet(value);
    } else {
        _.ld.add(self.__propertyd, key_iri, value);
    }

    return this;
};

/**
 *  Add a new {@link Attribute} to the {@link Thing} being made.
 *
 *  @param {Attribute} attribute
 *  The attribute to add. You should use
 *  'attribute.make_attribute' to make these
 *
 *  @return {this}
 */
ModelMaker.prototype.attribute = function (attribute) {
    var self = this;

    var code = attribute.code();
    var oa = self.__attributed[code];
    if (oa !== undefined) {
        for (var ai = 0; ai < self.__attributes.length; ai++) {
            if (self.__attributes[ai] === oa) {
                self.__attributes.splice(ai, 1);
                break;
            }
        }
    }

    /* fixup / defaults */
    var is_read = _.ld.first(attribute, constants.iot_read, null);
    var is_write = _.ld.first(attribute, constants.iot_write, null);

    if ((is_read === null) && (is_write === null)) {
        is_read = true;
        is_write = true;
    } else {
        is_read = is_read ? true : false;
        is_write = is_write ? true : false;
    }

    attribute.property_value(constants.iot_read, is_read);
    attribute.property_value(constants.iot_write, is_write);

    var is_sensor = _.ld.first(attribute, constants.iot_sensor, null);
    var is_actuator = _.ld.first(attribute, constants.iot_actuator, null);

    if ((is_sensor === null) && (is_actuator === null)) {
        is_sensor = is_read;
        is_actuator = is_write;
    } else {
        is_sensor = is_sensor ? true : false;
        is_actuator = is_actuator ? true : false;
    }

    attribute.property_value(constants.iot_sensor, is_sensor);
    attribute.property_value(constants.iot_actuator, is_actuator);

    /* do not copy nested values */
    attribute = _.d.clone.deep(attribute);
    for (var akey in attribute) {
        var avalue = attribute[akey];
        if (!_.is.Array(avalue) && _.is.Object(avalue) && !_.is.Function(avalue)) {
            delete attribute[akey];
        }
    }

    self.__attributed[code] = attribute;
    self.__attributes.push(attribute);

    return self;
};

/*
 *  Action
 */
/*
ModelMaker.prototype.action = function (purpose, xd) {
    var self = this;

    purpose = _.ld.compact(purpose);

    var code = purpose.replace(/^.*:/, '');
    var name = _.ld.first(attribute, constants.schema_name) || code;

    var ad = attribute.make(purpose, code, name)
        .control()
        .type(":type.null");
    if (xd) {
        _.extend(ad, xd);
    }

    this.attribute(ad);

    return self;
};
*/

// reading @depreciated
/*
ModelMaker.prototype.i = function (code, attribute) {
    var name = _.ld.first(attribute, constants.schema_name);

    if (arguments.length === 1) {
        attribute = arguments[0];
        code = attribute.code();
    }

    return this.attribute(
        _.d.clone.deep(attribute)
        .code(code)
        .name(name || code)
        .reading()
    );
};
*/

// control @depreciated
/*
ModelMaker.prototype.o = function (code, attribute) {
    var name = _.ld.first(attribute, constants.schema_name);

    if (arguments.length === 1) {
        attribute = arguments[0];
        code = attribute.code();
    }

    return this.attribute(
        _.d.clone.deep(attribute)
        .code(code)
        .name(name || code)
        .control()
    );
};
*/

// reading & control @depreciated
/*
ModelMaker.prototype.io = function (out_code, in_code, attribute) {
    if (arguments.length === 1) {
        attribute = arguments[0];
        out_code = attribute.code();
        in_code = out_code;
    } else if (arguments.length === 2) {
        attribute = arguments[1];
        in_code = out_code;
    }

    var name = _.ld.first(attribute, constants.schema_name);

    if (out_code === in_code) {
        this.attribute(
            _.d.clone.deep(attribute)
            .code(in_code)
            .name(name || in_code)
            .reading()
            .control()
        );
    } else {
        this.attribute(
            _.d.clone.deep(attribute)
            .code(in_code)
            .name(name || in_code)
            .reading()
        );
        this.attribute(
            _.d.clone.deep(attribute)
            .code(out_code)
            .name(name || out_code)
            .control()
        );
    }

    return this;
};
*/

/**
ModelMaker.prototype.vector = function (attribute_codes) {
    return this;
};
 */

var aid = 0;

/**
 *  The last function you MUST to call when creating
 *  a new model. It will actually create the new class
 *  for you and set up all the required variables.
 *  <p>
 *  See {@link Thing~subclass} for how {@link Thing}
 *  subclasses are created.
 *
 *  <p>
 *  The initial value for the state of this object is null,
 *  meaning it hasn't been set. Originally we gave these
 *  reasonable default values but this stops requests from
 *  being propagated to the Bridge
 *
 *  @return {function}
 *  the class function for the Thing
 */
ModelMaker.prototype.make = function () {
    var self = this;

    if (!self.__code) {
        throw new Error("ModelMaker.make: 'code' must be defined");
    }

    var new_thing = function (paramd) {
        paramd = paramd !== undefined ? paramd : {};

        this.initd = (paramd.initd !== undefined) ? paramd.initd : {};

        this.Model = new_thing;
        // note how the code can be changed by setting "Model.code = <something>"!!! 
        this.__code = new_thing.code || self.__code;
        this._isThing = true;
        this._isModel = undefined;
        this._thing_id = null;

        this.__emitter = new events.EventEmitter();
        this.__emitter.setMaxListeners(0);
        this.__name = (self.__name !== null) ? self.__name : self.__code;
        this.__description = self.__description;
        this.__help = self.__help;
        this.__scratchd = {};
        this.__push_keys = [];
        this.__facets = self.__facets;
        this.__propertyd = _.d.clone.shallow(self.__propertyd);

        this.__callbacksd = {};
        this._transaction = null;
        this._transactions = [];

        this.__attributes = [];
        this.__attributed = {};
        for (var ai in self.__attributes) {
            var in_attribute = self.__attributes[ai];

            var out_attribute = _.d.clone.deep(in_attribute);
            out_attribute._aid = aid++;
            out_attribute._ivalue = null;
            out_attribute._ichanged = false;
            out_attribute._ovalue = null;
            out_attribute._ochanged = false;

            this.__attributes.push(out_attribute);
            this.__attributed[out_attribute.code()] = out_attribute;
        }

        this._ichanged = false;
        this._itimestamp = _.timestamp.epoch();

        this._pushes = 0;
        this._ochanged = false;
        this._otimestamp = _.timestamp.epoch();

        this._ctimestamp = _.timestamp.epoch();

        this._reachable = null;
    };

    new_thing.prototype = new model.Model();
    new_thing.prototype.__make = new_thing;

    new_thing._isModel = true;

    return new_thing;
};

exports.ModelMaker = ModelMaker;
