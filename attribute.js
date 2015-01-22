/*
 *  attribute.js
 *
 *  David Janes
 *  IOTDB
 *  2013-12-22
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
var assert = require("assert");

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'attribute',
});

/* --- constants --- */
var iot_js_boolean = _.ld.expand("iot-js:boolean");
var iot_js_integer = _.ld.expand("iot-js:integer");
var iot_js_number = _.ld.expand("iot-js:number");
var iot_js_string = _.ld.expand("iot-js:string");

var iot_js_type = _.ld.expand("iot-js:type");

var iot_js_minimum = _.ld.expand("iot-js:minimum");
var iot_js_maximum = _.ld.expand("iot-js:maximum");

var iot_js_read = _.ld.expand("iot-js:read");
var iot_js_write = _.ld.expand("iot-js:write");

var iot_js_format = _.ld.expand("iot-js:format");
var iot_js_color = _.ld.expand("iot-js:color");
var iot_js_iri = _.ld.expand("iot-js:iri");
var iot_js_time = _.ld.expand("iot-js:time");
var iot_js_date = _.ld.expand("iot-js:date");
var iot_js_datetime = _.ld.expand("iot-js:datetime");

var VERBOSE = false;

/* --- setup section --- */
/**
 *  An argument for a {@link Thing}. This
 *  actually makes a pretty clean dictionary.
 *
 *  <p>
 *  Normally you will use one of the following 
 *  helper functions:
 *  <ul>
 *  <li>{@link make_value}
 *  <li>{@link make_boolean}
 *  <li>{@link make_integer}
 *  <li>{@link make_number}
 *  <li>{@link make_string}
 *  </ul>
 *
 *
 *  @classdesc
 *  Attributes describe how a {@link Thing} can be manipulated
 *  (if it's an actuator) or described (if it's a sensor).
 *  Almost every method in this class is shorthand
 *  for filling in code/value pairs.
 *
 *  <p>
 *  Here's an example of a read-only property 
 *  of a thing that measures temperature in Fahrenheit
 *
 *  <pre>
attribute.make_number()
    .code('temperature_f')
    .purpose("temperature")
    .unit("temperature.si.fahrenheit")
    .minimum(0)
    .maximum(500)
    .read_only()
    .make()
    ;
 *  </pre>
 *  <p>
 *  Which makes the following {@link Attribute} dictionary.
 *  <pre>
{ '@type': 'https://iotdb.org/iot#Attribute',
  '@id': '#temperature_f',
  'https://iotdb.org/iot#purpose': 'https://iotdb.org/attribute#temperature',
  'https://iotdb.org/iot#unit': 'https://iotdb.org/iot-unit#temperature.si.fahrenheit',
  'https://iotdb.org/iot-js#type': 'https://iotdb.org/iot-js#number',
  'https://iotdb.org/iot-js#maximum': 500,
  'https://iotdb.org/iot-js#minimum': 0,
  'https://iotdb.org/iot-js#write': false }
    </pre>
 *
 *  <hr />
 *  @constructor
 */
var Attribute = function () {
    var self = this;

    self['@type'] = _.ld.expand('iot:Attribute');
};

/**
 *  Set a 'code' for this Attribute, which
 *  typically should be a simple string with
 *  no slashes in it. This is stored
 *  in <code>@id</code> as <code>#<i>code</i></code>
 *
 *  @param {string} code
 *  The code
 *
 *  @return {this}
 *  this
 */
Attribute.prototype.code = function (code) {
    var self = this;

    code = code.replace(/^:/, '');

    self['@id'] = '#' + code;
    return self;
};

/**
 *  Return the 'code' of this Attribute. The code
 *  is used to store values in a dictionary
 *  in the {@link Thing}.
 *
 *  @return {string}
 *  The code
 */
Attribute.prototype.get_code = function () {
    var self = this;

    var code = self['@id'];
    if (code === undefined) {
        code = self[_.ld.expand("iot:purpose")];
    }
    if (code !== undefined) {
        return code.replace(/^.*#/, "");
    }

    return undefined;
};

/**
 *  Define the purpose of this Attribute, typically
 *  a IRI from 'iot-attribute:'.
 *
 *  <p>
 *  Most attributes should use this. This code sets only
 *  one value
 *
 *  @param {string} purpose_iri
 *  An IRI, typically from 'iot-attribute:*'
 *
 *  @return {this}
 *  this
 */
Attribute.prototype.purpose = function (purpose_iri) {
    return this.property('iot:purpose', _.ld.expand(purpose_iri, 'iot-attribute:'), {
        array: false
    });
};

/**
 *  This is a value, i.e. it is measuring something
 */
Attribute.prototype.reading = function () {
    return this.property('iot:role', 'iot-attribute:role-reading');
};

/**
 *  This is a control, i.e. you can change with it
 */
Attribute.prototype.control = function () {
    return this.property('iot:role', 'iot-attribute:role-control');
};


/**
 *  Define the {@link https://iotdb.org/pub/iot.html#name iot:name}
 *  of this attribute. Name can only be set once
 *
 *  @param {string} value
 *  The name, for humans
 *
 *  @return {this}
 *  this
 */
Attribute.prototype.name = function (_value) {
    return this.property_value(_.ld.expand('iot:name'), _value, {
        array: false
    });
};

/**
 *  Define the {@link https://iotdb.org/pub/iot.html#description iot:description}
 *  of this attribute.
 *
 *  @param {string} value
 *  The description, for humans
 *
 *  @return {this}
 *  this
 */
Attribute.prototype.description = function (_value) {
    return this.property_value(_.ld.expand('iot:description'), _value);
};

/**
 *  Define the {@link https://iotdb.org/pub/iot.html#help iot:help}
 *  of this attribute.
 *
 *  @param {string} value
 *  The help, for humans
 *
 *  @return {this}
 *  this
 */
Attribute.prototype.help = function (_value) {
    return this.property_value(_.ld.expand('iot:help'), _value);
};

/**
 *  Add a property (predicate, object) to this Attribute
 *
 *  @param {string} key_iri
 *  The property predicate IRI
 *
 *  @param {*} value_iri
 *  The property object IRI. If this is not a string or
 *  not a namespaced IRI, it will be used as-is.
 *  If you want to add a string that is not interpretted
 *  as an IRI, use {@link Attribute#property_value Attribute.property_value}
 *
 *  @return {this}
 *  this
 */
Attribute.prototype.property = function (key_iri, value_iri, paramd) {
    return this.property_value(_.ld.expand(key_iri), _.ld.expand(value_iri), paramd);
};

/**
 *  Add a property (predicate, string) to this Attribute.
 *  Unlike {@link #property} value is always used as-is
 *
 *  @param {string} key_iri
 *  The property predicate IRI
 *
 *  @param {*} value
 *  This value. Should be a simple type
 *
 *  @return {this}
 *  this
 */
Attribute.prototype.property_value = function (key_iri, value, paramd) {
    var self = this;

    paramd = _.defaults(paramd, {
        array: true
    });

    key_iri = _.ld.expand(key_iri);

    var existing = self[key_iri];
    if ((existing === undefined) || !paramd.array) {
        self[key_iri] = value;
    } else if (_.isArray(existing)) {
        if (existing.indexOf(value) === -1) {
            existing.push(value);
        }
    } else {
        if (existing !== value) {
            self[key_iri] = [existing, value];
        }
    }

    return self;
};

/**
 *  Specify the "iot:unit" of this attribute. For example,
 *  <code>iot-unit:temperature.imperial.fahrenheit</code>
 *  or <code>iot-unit:length.si.metre</code>.
 *
 *  <p>
 *  Available units can be found at {@link https://iotdb.org/pub/iot-unit},
 *  though of course any semantically meaningful URL can be used
 *
 *  @param {string} unit
 *  A unit IRI. If no colon, assume it to be "iot-unit:"
 *
 *  @return {this}
 */
Attribute.prototype.unit = function (unit_iri) {
    return this.property_value(_.ld.expand("iot:unit"), _.ld.expand(unit_iri, function (v) {
        return _.ld.expand("iot-unit:" + v);
    }));
};

/**
 *  What is this Attribute measuring?
 *
 *  @param {string} IRI
 *  The measuring IRI.
 *
 *  @return {this}
 */
Attribute.prototype.measuring = function (iri) {
    return this.property_value(_.ld.expand("iot:measuring"), _.ld.expand(iri));
};

/**
 *  Specify the arithmetic precision, i.e. the number
 *  of places past the decimal point that count
 */
Attribute.prototype.arithmetic_precision = function (places) {
    return this
        .property_value(_.ld.expand("iot:arithmetic-precision"), places);
};

/**
 *  Specify the name of the vector this attribute belongs to.
 *  Attributes in the same vector should be, um, considered
 *  part of the same vector.
 *
 *  @param {string} name
 *  A name for the vector, preferably human readable
 *
 */
Attribute.prototype.vector = function (name) {
    return this
        .property_value(_.ld.expand("iot:vector"), name);
};

/**
 *  Specify the "iot:unit-multiplier" of this attribute. Whatever
 *  the current value of this attribute is, it's "real" value should
 *  be considered to be multiplied by this number.
 *
 *  @param {number} unit-multiplier
 *  The multiplier.
 *
 *  @return {this}
 */
Attribute.prototype.unit_multiplier = function (multiplier) {
    return this.property_value(_.ld.expand("iot:unit-multiplier"), multiplier);
};

/**
 *  If a string, it must be one of the following values
 *
 *  @param {array} values
 *  A list of valid values. These are not CIRIs
 *
 *  @return {this}
 *  this
 */
Attribute.prototype.enumeration = function (values) {
    return this.property_value(_.ld.expand("iot:enumeration"), values);
};

/**
 *  For future use
 *
 *  @param {string} iri
 *
 *  @return {this}
 *  this
 */
Attribute.prototype.monitoring = function (iri) {
    return this;
};

/**
 *  A function that determines whether, given the current
 *  state of the Model it is in, it is in-use. These lets us,
 *  e.g. switch between different value ranges when changing
 *  the band of a Radio from AM to FM
 *
 *  @param {function} f
 *
 *  @return {this}
 */
Attribute.prototype.active = function (f) {
    this.__active = f;
    return this;
};

/**
 *  Set the <code>iot-js:type</code> for this
 *  Attribute, which defines the type(s) of values
 *  this attribute can take.
 *
 *  @param {string} type
 *  Usually one of 'iot-js:boolean', 'iot-js:integer', 'iot-js:number',
 *  'iot-js:string'.
 *
 *  @return {this}
 */
Attribute.prototype.type = function (format_iri) {
    return this.property_value(_.ld.expand("iot-js:type"), _.ld.expand(format_iri, function (v) {
        return _.ld.expand("iot-js:" + v);
    }));
};

/**
 *  Set the <code>iot-js:format</code> for this
 *  Attribute, which constrains the values a string can take.
 *
 *  @param {string} format_iri
 *  Typically <code>rgb<code>, <code>datetime</code>.
 *  If it does not contain a ":", <code>iot-js:</code>
 *  is prepended.
 *
 *  @return {this}
 */
Attribute.prototype.format = function (format_iri) {
    return this.property_value(_.ld.expand("iot-js:format"), _.ld.expand(format_iri, function (v) {
        return _.ld.expand("iot-js:" + v);
    }));
};

/**
 *  Specify the <code>iot-js:minimum</code> of this attribute.
 *
 *  @param {number|integer} value
 *  The minimum value
 *
 *  @return {this}
 */
Attribute.prototype.minimum = function (value) {
    return this.property_value(iot_js_minimum, value);
};

/**
 *  Specify the <code>iot-js:maximum</code> of this attribute.
 *
 *  @param {number|integer} value
 *  The maximum value
 *
 *  @return {this}
 */
Attribute.prototype.maximum = function (value) {
    return this.property_value(iot_js_maximum, value);
};

/**
 *  Specify that this attribute is read-only
 *
 *  @return {this}
 */
Attribute.prototype.read_only = function () {
    return this.property_value(iot_js_write, false);
};

/**
 *  Dummy function for consistency with thing.
 *  Does not need to be called.
 *
 *  @return {this}
 */
Attribute.prototype.make = function () {
    return this;
};

/**
 *  Set a validation function, for use
 *  in {@link Attribute#validate Attribute.validate}.
 *  After this attribute does all it's validation,
 *  this function will be called and you can do your
 *  own thing. Note that the return value is used
 *  "as-is" (as a long as it's not undefined).
 *
 *  @param {function} f
 *  A function that takes the same <code>paramd</code>
 *  as {@link Attribute#validate Attribute.validate}.
 *
 *  @return {this}
 */
Attribute.prototype.validator = function (f) {
    var self = this;

    self.__validator = f;
    return self;
};

/* --- use interface --- */
/**
 *  Take the value and validate it according to
 *  the rules of this Attribute. This can include
 *  changing its type, placing it with bounds,
 *  and calling a validation function.
 *
 *  <p>
 *  Note that the validation function result
 *  is NOT type checked
 *
 *  @param {object} paramd
 *  @param {*} paramd.value
 *  The value to validate AND the returned
 *  validated value.
 *
 *  @param {boolean} paramd.use_otherwise
 *  If the value isn't valid, a 'reasonable'
 *  otherwise value is returned.
 *
 *  @param {object} paramd.lib
 *  A library of useful functions. These are the only
 *  functions you can assume are available beyond
 *  standard JS functions.
 *
 *  @param {Thing} paramd.thing
 *  The {@link Thing} this attribute belongs too. This
 *  is just passed along to the validator function,
 *  but probably should not be used
 *
 */
Attribute.prototype.validate = function (paramd) {
    var self = this;

    var iot_types = _.ld.list(self, iot_js_type, []);

    if (_.isDate(paramd.value)) {
        paramd.value = paramd.value.toISOString();
    }

    paramd.value = self._convert(paramd.value, iot_types);

    if (_.isNumber(paramd.value)) {
        paramd.value = self._bounded(
            paramd.value,
            _.ld.first(self, iot_js_minimum),
            _.ld.first(self, iot_js_maximum)
        );
    }

    if (_.isString(paramd.value)) {
        var iot_formats = _.ld.list(self, iot_js_format, []);
        if (iot_formats.length > 0) {
            var formatted_value = self._format(paramd.value, iot_formats, paramd);
            if (formatted_value === undefined) {
                logger.error({
                    method: "validate",
                    original: paramd.value,
                    formats: iot_formats,
                    cause: "likely programmer error - bad type passed in"
                }, "iot-js:format failed");

                paramd.value = undefined;
            } else {
                paramd.value = formatted_value;
            }
        }
    }

    if (self.__validator) {
        self.__validator(paramd);
    }
};

/* --- internal validation --- */
Attribute.prototype._format = function (value, formats, paramd) {
    var self = this;
    var known = false;
    var otherwise;
    var new_value;

    if (!formats || (formats.length === 0)) {
        return value;
    }

    if (formats.indexOf(iot_js_color) > -1) {
        known = true;
        otherwise = undefined;
        if (paramd.use_otherwise) {
            if (paramd.otherwise_rgb !== undefined) {
                otherwise = paramd.otherwise_rgb;
            } else {
                otherwise = "#000000";
            }
        }

        new_value = self._format_rgb(value, otherwise);
        if (new_value !== undefined) {
            return new_value;
        }
    }

    if (formats.indexOf(iot_js_datetime) > -1) {
        known = true;
        otherwise = undefined;
        if (paramd.use_otherwise) {
            if (paramd.otherwise_datetime !== undefined) {
                otherwise = paramd.otherwise_datetime;
            } else {
                otherwise = (new Date()).toISOString();
            }
        }
        new_value = self._format_datetime(value, otherwise);
        if (new_value !== undefined) {
            return new_value;
        }
    }

    if (formats.indexOf(iot_js_date) > -1) {
        known = true;
        otherwise = undefined;
        if (paramd.use_otherwise) {
            if (paramd.otherwise_date !== undefined) {
                otherwise = paramd.otherwise_date;
            } else {
                otherwise = (new Date()).toISOString().substring(0, 10);
            }
        }
        new_value = self._format_date(value, otherwise);
        if (new_value !== undefined) {
            return new_value;
        }
    }

    if (formats.indexOf(iot_js_time) > -1) {
        known = true;
        otherwise = undefined;
        if (paramd.use_otherwise) {
            if (paramd.otherwise_time !== undefined) {
                otherwise = paramd.otherwise_time;
            } else {
                otherwise = (new Date()).toISOString().substring(10);
            }
        }
        new_value = self._format_time(value, otherwise);
        if (new_value !== undefined) {
            return new_value;
        }
    }

    if (formats.indexOf(iot_js_iri) > -1) {
        // XXX not implemented
        return value;
    }

    if (!known) {
        // console.log("# Attribute._format: warning: no recognized formats!", formats);
        logger.error({
            method: "_format",
            formats: formats,
            cause: "likely Node-IOTDB error, shouldn't be called with bad format"
        }, "iot-js:format failed");
    }

    return undefined;
};

Attribute.prototype._format_rgb = function (value, otherwise) {
    value = value.toUpperCase();
    if (!value.match(/^#[0-9A-F]{6}/)) {
        return _.color_to_hex(value, otherwise);
    }

    return value;
};

var iso_tz_re = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/;
var iso_notz_re = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/;

/**
 *  Very generous inputs, strict ISO output
 *
 *  @private
 */
Attribute.prototype._format_datetime = function (value, otherwise) {
    var dt = new Date(value);
    if (isNaN(dt.getFullYear())) {
        return otherwise;
    }

    return dt.toISOString();
};

Attribute.prototype._bounded = function (value, min, max) {
    if (min !== undefined) {
        if (value < min) {
            value = min;
        }
    }
    if (max !== undefined) {
        if (value > max) {
            value = max;
        }
    }
    return value;
};

Attribute.prototype._convert = function (value, types) {
    var self = this;
    if (value === undefined) {
        return self._default(value, types);
    } else if (_.isBoolean(value)) {
        return self._convert_boolean(value, types);
    } else if (_.isInteger(value)) {
        return self._convert_integer(value, types);
    } else if (_.isNumber(value)) {
        return self._convert_number(value, types);
    } else if (_.isString(value)) {
        return self._convert_string(value, types);
    } else {
        return value;
    }
};

Attribute.prototype._default = function (value, types) {
    if (VERBOSE) {
        logger.debug("undefined", "wants-to-be", types);
    }
    if (types.indexOf(iot_js_boolean) > -1) {
        return false;
    } else if (types.indexOf(iot_js_integer) > -1) {
        return 0;
    } else if (types.indexOf(iot_js_number) > -1) {
        return 0.0;
    } else if (types.indexOf(iot_js_string) > -1) {
        return "";
    } else {
        return null;
    }
};

Attribute.prototype._convert_boolean = function (value, types) {
    if (VERBOSE) {
        logger.debug("is-a-boolean", value, "wants-to-be", types);
    }

    if (types.indexOf(iot_js_boolean) > -1) {
        return value;
    } else if (types.indexOf(iot_js_integer) > -1) {
        return value ? 1 : 0;
    } else if (types.indexOf(iot_js_number) > -1) {
        return value ? 1 : 0;
    } else if (types.indexOf(iot_js_string) > -1) {
        return value ? "1" : "0";
    } else {
        return value;
    }
};

Attribute.prototype._convert_integer = function (value, types) {
    if (VERBOSE) {
        logger.debug("is-a-integer", value, "wants-to-be", types);
    }

    if (types.indexOf(iot_js_boolean) > -1) {
        return value ? true : false;
    } else if (types.indexOf(iot_js_integer) > -1) {
        return value;
    } else if (types.indexOf(iot_js_number) > -1) {
        return Math.round(value);
    } else if (types.indexOf(iot_js_string) > -1) {
        return "" + value;
    } else {
        return value;
    }
};

Attribute.prototype._convert_number = function (value, types) {
    if (VERBOSE) {
        logger.debug("is-a-number", value, "wants-to-be", types);
    }

    if (types.indexOf(iot_js_boolean) > -1) {
        return value ? true : false;
    } else if (types.indexOf(iot_js_number) > -1) {
        return value;
    } else if (types.indexOf(iot_js_integer) > -1) {
        return Math.round(value);
    } else if (types.indexOf(iot_js_string) > -1) {
        return "" + value;
    } else {
        return value;
    }

    return value;
};

Attribute.prototype._convert_string = function (value, types) {
    var self = this;
    if (VERBOSE) {
        logger.debug("is-a-string", value, "wants-to-be", types);
    }
    if (types.indexOf(iot_js_string) > -1) {
        return value;
    } else if (types.indexOf(iot_js_boolean) > -1) {
        value = value.toLowerCase();
        if (value.length === 0) {
            value = false;
        } else if (value === "0") {
            value = false;
        } else if (value === "off") {
            value = false;
        } else if (value === "false") {
            value = false;
        } else if (value === "no") {
            value = false;
        } else {
            value = true;
        }

        if (VERBOSE) {
            logger.debug(" ... became boolean", value);
        }
    } else if (types.indexOf(iot_js_integer) > -1) {
        value = Math.round(parseFloat(value));
        if (isNaN(value)) {
            value = undefined;
        }
        if (VERBOSE) {
            logger.debug(" ... became integer", value);
        }
    } else if (types.indexOf(iot_js_number) > -1) {
        value = parseFloat(value);
        if (isNaN(value)) {
            value = undefined;
        }
        if (VERBOSE) {
            logger.debug(" ... became number", value);
        }
    }

    return value;
};

/* --- helper section --- */
exports.Attribute = Attribute;

/**
 *  Shortcut to make a new value {@link Attribute}.
 *
 *  @param {string} purpose_key
 *  If this is present, we call
 *  both {@link Attribute#purpose Attribute.purpose}
 *  and {@link Attribute#code Attribute.code}. This
 *  is useful if your "code" names are going to
 *  be pretty well the same as the semantic
 *  "purpose" names
 *
 *  @return {Attribute}
 *  a new attribute
 */
exports.make = function (purpose, code, name) {
    assert.ok(_.isString(purpose));
    // code = (code === undefined) ? purpose : code
    code = code === undefined ? purpose.replace(/^.*[.]/, '') : code;
    name = name === undefined ? code.replace(/^:+/, '') : name;

    var attribute = new Attribute();
    if (purpose) {
        attribute
            .purpose(purpose)
            .code(code)
            .name(name);
    }
    return attribute;
};

/**
 *  Make an Attribute that expects a <code>boolean<code> as a value.
 *
 *  @param {string} purpose
 *  See {@link make}
 *
 *  @return {Attribute}
 *  a new attribute
 */
exports.make_boolean = function (purpose, code, name) {
    return exports.make(purpose, code, name).property("iot-js:type", "iot-js:boolean");
};

/**
 *  Make an Attribute that expects a <code>integer<code> as a value.
 *
 *  @param {string} purpose
 *  See {@link make}
 *
 *  @return {Attribute}
 *  a new attribute
 */
exports.make_integer = function (purpose, code, name) {
    return exports.make(purpose, code, name).property("iot-js:type", "iot-js:integer");
};

/**
 *  Make an Attribute that expects a <code>make_number<code> as a value.
 *
 *  @param {string} purpose
 *  See {@link make}
 *
 *  @return {Attribute}
 *  a new attribute
 */
exports.make_number = function (purpose, code, name) {
    return exports.make(purpose, code, name).property("iot-js:type", "iot-js:number");
};

exports.make_unit = function (purpose, code, name) {
    return exports
        .make(purpose, code, name)
        .property("iot-js:type", "iot-js:number")
        .unit("iot-unit:math.fraction.unit")
        .minimum(0)
        .maximum(1);
};

exports.make_percent = function (purpose, code, name) {
    return exports
        .make(purpose, code, name)
        .property("iot-js:type", "iot-js:number")
        .unit("iot-unit:math.fraction.percent")
        .minimum(0)
        .maximum(100);
};

/**
 *  Make an Attribute that expects a <code>string<code> as a value.
 *
 *  @param {string} purpose
 *  See {@link make}
 *
 *  @return {Attribute}
 *  a new attribute
 */
exports.make_string = function (purpose, code, name) {
    return exports.make(purpose, code, name).property("iot-js:type", "iot-js:string");
};

exports.make_iri = function (purpose, code, name) {
    return exports.make(purpose, code, name)
        .property("iot-js:type", "iot-js:string")
        .format(":iri");
};

exports.make_datetime = function (purpose, code, name) {
    return exports.make(purpose, code, name)
        .property("iot-js:type", "iot-js:string")
        .format(":datetime");
};

exports.make_date = function (purpose, code, name) {
    return exports.make(purpose, code, name)
        .property("iot-js:type", "iot-js:string")
        .format(":date");
};

exports.make_time = function (purpose, code, name) {
    return exports.make(purpose, code, name)
        .property("iot-js:type", "iot-js:string")
        .format(":time");
};

exports.make_color = function (purpose, code, name) {
    return exports.make(purpose, code, name)
        .property("iot-js:type", "iot-js:string")
        .format(":color");
};
