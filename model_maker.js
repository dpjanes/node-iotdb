/*
 *  model_maker.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-01
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

var _ = require("./helpers");
var attribute = require("./attribute");
var model = require("./model");

var events = require('events');
var util = require('util');
var assert = require('assert');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
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
            .format("iot:color")
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
ModelMaker.prototype.facet = function (_value) {
    if (_value.match(/^:.*[.]/)) {
        var parts = _value.split(".");
        for (var pi = 0; pi < parts.length; pi++) {
            var sub = parts.slice(0, pi + 1).join(".");
            this.__facets.push(_.ld.expand(sub, "iot-facet:"));
        }
    } else {
        this.__facets.push(_.ld.expand(_value, "iot-facet:"));
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

    /* do not copy nested values */
    attribute = _.deepCopy(attribute);
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

// reading
ModelMaker.prototype.i = function (code, attribute) {
    return this.attribute(
        _.deepCopy(attribute)
        .code(code)
        .name(code)
        .reading()
    );
};

// control
ModelMaker.prototype.o = function (code, attribute) {
    return this.attribute(
        _.deepCopy(attribute)
        .code(code)
        .name(code)
        .control()
    );
};

// reading & control
ModelMaker.prototype.io = function (out_code, in_code, attribute) {
    if (arguments.length === 1) {
        attribute = arguments[0];
        out_code = attribute.code();
        in_code = out_code;
    } else if (arguments.length === 2) {
        attribute = arguments[1];
        in_code = out_code;
    }

    if (out_code === in_code) {
        this.attribute(
            _.deepCopy(attribute)
            .code(in_code)
            .name(in_code)
            .reading()
            .control()
        );
    } else {
        this.attribute(
            _.deepCopy(attribute)
            .code(in_code)
            .name(in_code)
            .reading()
        );
        this.make_attribute_control(in_code, out_code).name(out_code);
    }

    return this;
};

/**
 *  Defines a control for a 'value' attribute
 */
ModelMaker.prototype.link_control_reading = function (control_attribute_code, reading_attribute_code) {
    var self = this;

    reading_attribute_code = reading_attribute_code.replace(/^:/, '');
    var reading_attribute = self.__attributed[reading_attribute_code];
    if (!reading_attribute) {
        throw "# value attribute not found: " + reading_attribute_code;
    }

    control_attribute_code = control_attribute_code.replace(/^:/, '');
    var control_attribute = self.__attributed[control_attribute_code];
    if (!control_attribute) {
        throw "# value attribute not found: " + reading_attribute_code;
    }

    reading_attribute[_.ld.expand("iot:related-role")] = '#' + control_attribute_code;
    control_attribute[_.ld.expand("iot:related-role")] = '#' + reading_attribute_code;

    return self;
};

/**
 *  Defines a control for a 'value' attribute
 */
ModelMaker.prototype.make_attribute_control = function (reading_attribute_code, control_attribute_code) {
    var self = this;

    assert.ok(_.is.String(reading_attribute_code));
    assert.ok(_.is.String(control_attribute_code));

    var reading_attribute = self.__attributed[reading_attribute_code];
    if (!reading_attribute) {
        throw "# value attribute not found: " + reading_attribute_code;
    }

    var control_attribute = _.deepCopy(reading_attribute);
    control_attribute['@id'] = '#' + control_attribute_code;

    _.ld.remove(control_attribute, _.ld.expand("iot:role"), _.ld.expand("iot-attribute:role-reading"));
    control_attribute.control();

    self.__attributed[control_attribute_code] = control_attribute;
    self.__attributes.push(control_attribute);

    self.link_control_reading(control_attribute_code, reading_attribute_code);

    return self;
};

/**
 *  Defines a value for a 'control' attribute
 */
ModelMaker.prototype.make_attribute_reading = function (control_attribute_code, reading_attribute_code) {
    var self = this;

    assert.ok(_.is.String(control_attribute_code));
    assert.ok(_.is.String(reading_attribute_code));

    var control_attribute = self.__attributed[control_attribute_code];
    if (!control_attribute) {
        throw "# control attribute not found: " + control_attribute_code;
    }

    var reading_attribute = _.deepCopy(control_attribute);
    reading_attribute['@id'] = '#' + reading_attribute_code;

    _.ld.remove(reading_attribute, _.ld.expand("iot:role"), _.ld.expand("iot-attribute:role-control"));
    reading_attribute.reading();

    self.__attributed[reading_attribute_code] = reading_attribute;
    self.__attributes.push(reading_attribute);

    self.link_control_reading(control_attribute_code, reading_attribute_code);

    return self;
};

/**
 */
ModelMaker.prototype.vector = function (attribute_codes) {
    return this;
};

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

        this.__callbacksd = {};
        this._transaction = null;
        this._transactions = [];

        this.__attributes = [];
        this.__attributed = {};
        for (var ai in self.__attributes) {
            var in_attribute = self.__attributes[ai];

            var out_attribute = _.deepCopy(in_attribute);
            out_attribute._aid = aid++;
            out_attribute._ivalue = null;
            out_attribute._ichanged = false;
            out_attribute._ovalue = null;
            out_attribute._ochanged = false;

            this.__attributes.push(out_attribute);
            this.__attributed[out_attribute.code()] = out_attribute;
        }

        this._ichanged = false;
        this._itimestamp = null;

        this._pushes = 0;
        this._ochanged = false;
        this._otimestamp = null;

        this._reachable = true;
    };

    new_thing.prototype = new model.Model();
    new_thing.prototype.__make = new_thing;

    new_thing._isModel = true;

    return new_thing;
};

exports.ModelMaker = ModelMaker;
