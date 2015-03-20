/*
 *  model_maker.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-01
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
    .driver_identity("iot-driver:hue")
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
 *  <li>The driver is called <code>iot-driver:hue</code>
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
    this.__validator = null;
    this.__driver_setup = null;
    this.__driver_in = null;
    this.__driver_out = null;
    this.driver_identityd = null;
    this.attributed = {};
    this.__attributes = [];
    this.__code = (_code !== undefined) ? _.identifier_to_dash_case(_code) : null;

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
 *  The code. The function {@link helpers#identifier_to_dash_case} is
 *  <b>always</b> called on the code
 *
 *  @return {this}
 */
ModelMaker.prototype.code = function (_code) {
    var self = this;

    self.__code = _.identifier_to_dash_case(_code);

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
 *  Define the {@link Driver#identity Driver.identity}
 *  for this Model. When a Driver finds an actual devices
 *  and need a Thing to describe it, it basically goes out
 *  and looks at all the Things and sees if it has a
 *  driver_identity to match.
 *
 *  @param {string|dictionary} d
 *  If a string, we make a dictionary
 *  <code>{ "driver" : @{link expand}(d) }</code>
 *  <p>
 *  If a dictionary, all the things in the dictionary must match.
 *  Normally all the values must be strings. However, if the value
 *  is an Array, any one of the values matching is sufficient.
 *
 *  @return {this}
 */
ModelMaker.prototype.driver_identity = function (identity) {
    var self = this;

    self.driver_identityd = _.identity_expand(identity);

    return self;
};


/**
 *  Copy over all the the attributes and subthings from an
 *  instance of '_inherit'. It's something like a superclass
 *  but we're basically duck typing : the
 *  final model will have superclass=@{link Thing}
 *
 *  @param {function} _inherit
 *  Inherit all the attributes and subthings from this class.
 *  Don't pass an Object, pass the class function.
 *
 *  @return {this}
 */
ModelMaker.prototype.inherit = function (inherit_class) {
    var self = this;

    var inherit = new inherit_class();
    inherit.__attributes.map(function (attribute) {
        self.attribute(attribute);
    });

    this.__validator = inherit.__validator;

    return self;
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

    var code = attribute.get_code();
    var oa = self.attributed[code];
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
        if (!_.isArray(avalue) && _.isObject(avalue)) {
            delete attribute[akey];
        }
    }

    self.attributed[code] = attribute;
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
    var reading_attribute = self.attributed[reading_attribute_code];
    if (!reading_attribute) {
        throw "# value attribute not found: " + reading_attribute_code;
    }

    control_attribute_code = control_attribute_code.replace(/^:/, '');
    var control_attribute = self.attributed[control_attribute_code];
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

    assert.ok(_.isString(reading_attribute_code));
    assert.ok(_.isString(control_attribute_code));

    var reading_attribute = self.attributed[reading_attribute_code];
    if (!reading_attribute) {
        throw "# value attribute not found: " + reading_attribute_code;
    }

    var control_attribute = _.deepCopy(reading_attribute);
    control_attribute['@id'] = '#' + control_attribute_code;

    _.ld.remove(control_attribute, _.ld.expand("iot:role"), _.ld.expand("iot-attribute:role-reading"));
    control_attribute.control();

    self.attributed[control_attribute_code] = control_attribute;
    self.__attributes.push(control_attribute);

    self.link_control_reading(control_attribute_code, reading_attribute_code);

    return self;
};

/**
 *  Defines a value for a 'control' attribute
 */
ModelMaker.prototype.make_attribute_reading = function (control_attribute_code, reading_attribute_code) {
    var self = this;

    assert.ok(_.isString(control_attribute_code));
    assert.ok(_.isString(reading_attribute_code));

    var control_attribute = self.attributed[control_attribute_code];
    if (!control_attribute) {
        throw "# control attribute not found: " + control_attribute_code;
    }

    var reading_attribute = _.deepCopy(control_attribute);
    reading_attribute['@id'] = '#' + reading_attribute_code;

    _.ld.remove(reading_attribute, _.ld.expand("iot:role"), _.ld.expand("iot-attribute:role-control"));
    reading_attribute.reading();

    self.attributed[reading_attribute_code] = reading_attribute;
    self.__attributes.push(reading_attribute);

    self.link_control_reading(control_attribute_code, reading_attribute_code);

    return self;
};

/**
 */
ModelMaker.prototype.vector = function (attribute_codes) {
    return this;
};

/**
 *  Define a function that will validate the entire
 *  model after modifications have been made.
 *
 *  @param {function} validator
 *  A function that takes the following parameters:
 *  <ul>
 *  <li>paramd.attributed - a dictionary of the attributes
 *     that werechanged</li>
 *  <li>thingd - the current values of the model</li>
 *  <li>thingd - an empty dictionary that can be used
 *      to return new values</li>
 *  </ul>
 *
 *  @return {this}
 */
ModelMaker.prototype.validator = function (validator) {
    var self = this;

    self.__validator = validator;

    return self;
};

/**
 *  Return an object that is passed to the {@link Driver}
 *  in the function {@link Driver#setup setup} as
 *  <code>param.initd</code>.
 *
 *  <p>
 *  XXX documentation fix needed!
 *  </p>
 *
 *  <p>
 *  The meaning the return value is entirely
 *  defined by the {@link Driver}.
 *
 *  @return {dictionary}
 *  A dictionary that makes sense to the Driver
 */
ModelMaker.prototype.driver_setup = function (driver_setup) {
    var self = this;

    self.__driver_setup = driver_setup;

    return self;
};

/**
 *  Define a function that translates between the
 *  Driver's state and what the Thing's.
 *
 *  @param {ModelMaker~driver_in_function} driver_in
 *  The function that does this.
 *
 *  @return {this}
 */
ModelMaker.prototype.driver_in = function (driver_in) {
    var self = this;

    self.__driver_in = driver_in;

    return self;
};

/**
 *  This function translates from the Driver's state to the Thing's.
 *  See {@link ModelMaker#driver_in ModelMaker.driver_in} and
 *  {@link Thing#driver_in Model.driver_in}
 *
 *  @param {dictionary} paramd
 *  @param {dictionary} paramd.initd
 *  An invariant dictionary, passed in when
 *  the Thing is created.
 *
 *  @param {dictionary} paramd.attributed
 *  Attributes that have been changed
 *
 *  @param {dictionary} paramd.driverd
 *  This is the native state of the driver
 *
 *  @param {dictionary} paramd.thingd
 *  This is the state we want to get to, in this
 *  {@link Thing}'s terminology. I.e. all the keys
 *  in this should be the keys of the {@link Thing}.
 *  This is passed as an empty dictionary which
 *  the callback should modify
 *
 *  @param {dictionary} paramd.lib
 *  Our standard library of helper functions
 *
 *  @callback ModelMaker~driver_in_function
 **/

/**
 *  Define a function that translates between the
 *  Thing's state and what the Driver's
 *
 *  @param {ModelMaker~driver_out_function} driver_out
 *
 *  @return {this}
 */
ModelMaker.prototype.driver_out = function (driver_out) {
    var self = this;

    self.__driver_out = driver_out;

    return self;
};

/**
 *  This function translates from the Thing's state to the Driver's.
 *  See {@link ModelMaker#driver_out ModelMaker.driver_out} and
 *  {@link Thing#driver_out Model.driver_out}
 *
 *  @callback ModelMaker~driver_out_function
 *  @param paramd {object}
 *  @param paramd.driverd {object}
 *  This is the state we want to get to, in this
 *  {@link Driver}'s terminology.
 *
 *  @param paramd.thingd {object}
 *  Typically the complete state of this Model.
 *
 *  @param paramd.attributed
 *  These are the attributes that were modified.
 *  Implementers of this function may want to pay
 *  attention to this so they do not push too much data.
 **/

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
 *  being propagated to the drivers
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

        this.driver_instance = (paramd.driver_instance !== undefined) ? paramd.driver_instance : undefined;
        this.initd = (paramd.initd !== undefined) ? paramd.initd : {};

        /* note how the code can be changed by setting "Model.code = <something>"!!! */
        this.code = new_thing.code || self.__code;
        this.Model = new_thing;

        this.__emitter = new events.EventEmitter();
        this.__emitter.setMaxListeners(0);
        this.name = (self.__name !== null) ? self.__name : self.__code;
        this.description = self.__description;
        this.help = self.__help;
        this.__scratchd = {};
        this.__push_keys = [];
        this.__parent_thing = null;
        this.__is_thing = true;
        this.__validator = self.__validator;
        this.__driver_setup = self.__driver_setup;
        this.__driver_in = self.__driver_in;
        this.__driver_out = self.__driver_out;
        this.__facets = self.__facets;
        if (paramd.driver_identity !== undefined) {
            this.driver_identityd = _.identity_expand(paramd.driver_identity);
        } else if (paramd.driver !== undefined) {
            this.driver_identityd = _.identity_expand(paramd.driver);
        } else {
            this.driver_identityd = _.deepCopy(self.driver_identityd);
        }

        this.__attributes = [];
        this.attributed = {};
        for (var ai in self.__attributes) {
            var in_attribute = self.__attributes[ai];

            var out_attribute = _.deepCopy(in_attribute);
            out_attribute.__validator = in_attribute.__validator;
            var out_key = out_attribute.get_code();

            this.__attributes.push(out_attribute);
            this.attributed[out_key] = out_attribute;
        }

        this.callbacksd = {};
        this._transaction = null;
        this._transactions = [];

        for (var acode in this.attributed) {
            var attribute = this.attributed[acode];
            attribute._ivalue = null;
            attribute._ovalue = null;
        }
    };

    new_thing.prototype = new model.Model();
    new_thing.prototype.__make = new_thing;

    return new_thing;
};

exports.ModelMaker = ModelMaker;
