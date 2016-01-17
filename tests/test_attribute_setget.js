/*
 *  test_attribute_setget.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-17
 *
 *  Test attribute sett/getters
 */

"use strict";

var assert = require("assert")
var iotdb = require("../iotdb")
var attribute = require("./instrument/attribute")
var model = require("../model")
var _ = require("../helpers")
var constants = require("../constants")

/* --- tests --- */
describe('test_attribute_rgb', function(){
    describe('core', function() {
        describe('first', function() {
            it('single value', function() {
                var a = attribute
                    .make_string("value");

                _.ld.set(a, _.ld.expand("iot:random"), "David");

                assert.strictEqual(a.first("iot:random"), "David");

            });
            it('multi value', function() {
                var a = attribute
                    .make_string("value");

                _.ld.set(a, _.ld.expand("iot:random"), [ "David", "Janes" ]);

                assert.deepEqual(a.first("iot:random"), "David");
            });
        });
        describe('as_list', function() {
            it('single value', function() {
                var a = attribute
                    .make_string("value");

                _.ld.set(a, _.ld.expand("iot:random"), "David");

                assert.deepEqual(a.as_list("iot:random"), [ "David" ]);

            });
            it('multi value', function() {
                var a = attribute
                    .make_string("value");

                _.ld.set(a, _.ld.expand("iot:random"), [ "David", "Janes" ]);

                assert.deepEqual(a.as_list("iot:random"), [ "David", "Janes" ]);
            });
        });
    });
    describe('non-IRI strings', function() {
        describe('name', function() {
            it('single value', function() {
                var expect = "David";
                var a = attribute
                    .make_string("value")
                    .name(expect);

                assert.strictEqual(a.name(), expect);
            });
            it('IRI value that should not expand', function() {
                var expect = "iot:something";
                var a = attribute
                    .make_string("value")
                    .name(expect);

                var got = _.ld.first(a, _.ld.expand("schema:name"), null);
                assert.strictEqual(a.name(), expect);
                assert.strictEqual(expect, got);
            });
            it('multi value', function() {
                var expect = "David";
                var a = attribute
                    .make_string("value");

                _.ld.set(a, _.ld.expand("schema:name"), [ "David", "Janes" ]);

                assert.strictEqual(a.name(), expect);
            });
            it('bad value', function() {
                assert.throws(function() {
                    var a = attribute
                        .make_string("value")
                        .name(0);
                }, Error);
            });
        });
        describe('description', function() {
            it('single value', function() {
                var expect = "David";
                var a = attribute
                    .make_string("value")
                    .description(expect);

                assert.strictEqual(a.description(), expect);
            });
            it('IRI value that should not expand', function() {
                var expect = "iot:something";
                var a = attribute
                    .make_string("value")
                    .description(expect);

                var got = _.ld.first(a, _.ld.expand("schema:description"), null);
                assert.strictEqual(a.description(), expect);
                assert.strictEqual(expect, got);
            });
            it('multi value', function() {
                var expect = "David";
                var a = attribute
                    .make_string("value");

                _.ld.set(a, _.ld.expand("schema:description"), [ "David", "Janes" ]);

                assert.strictEqual(a.description(), expect);
            });
            it('bad value', function() {
                assert.throws(function() {
                    var a = attribute
                        .make_string("value")
                        .description(0);
                }, Error);
            });
        });
        describe('help', function() {
            it('single value', function() {
                var expect = "David";
                var a = attribute
                    .make_string("value")
                    .help(expect);

                assert.strictEqual(a.help(), expect);
            });
            it('IRI value that should not expand', function() {
                var expect = "iot:something";
                var a = attribute
                    .make_string("value")
                    .help(expect);

                var got = _.ld.first(a, _.ld.expand("iot:help"), null);
                assert.strictEqual(a.help(), expect);
                assert.strictEqual(expect, got);
            });
            it('multi value', function() {
                var expect = "David";
                var a = attribute
                    .make_string("value");

                _.ld.set(a, _.ld.expand("iot:help"), [ "David", "Janes" ]);

                assert.strictEqual(a.help(), expect);
            });
            it('bad value', function() {
                assert.throws(function() {
                    var a = attribute
                        .make_string("value")
                        .help(0);
                }, Error);
            });
        });
        describe('iot:vector', function() {
            it('single value', function() {
                var expect = "xyz";
                var a = attribute
                    .make_string("value")
                    .vector(expect);

                assert.strictEqual(a.vector(), expect);
            });
            it('IRI value that should not expand', function() {
                var expect = "iot:something";
                var a = attribute
                    .make_string("value")
                    .vector(expect);

                var got = _.ld.first(a, _.ld.expand("iot:vector"), null);
                assert.strictEqual(a.vector(), expect);
                assert.strictEqual(expect, got);
            });
            it('bad value', function() {
                assert.throws(function() {
                    var a = attribute
                        .make_string("value")
                        .vector(0);
                }, Error);
            });
        });
    });
    describe('IRI strings', function() {
        describe('iot:format', function() {
            it('default value', function() {
                var a = attribute
                    .make_string("value");

                assert.strictEqual(a.format(), null);
            });
            it('single value', function() {
                var expect = "iot:format.color";
                var a = attribute
                    .make_string("value")
                    .format(expect);

                assert.strictEqual(a.format(), expect);
            });
            it('bad value', function() {
                assert.throws(function() {
                    var a = attribute
                        .make_string("value")
                        .format(0);
                }, Error);
            });
        });
        describe('iot:type', function() {
            it('default value', function() {
                var a = attribute.make("value");

                assert.strictEqual(a.type(), "iot:type.null");
            });
            it('single value', function() {
                var expect = "iot:type.string";
                var a = attribute
                    .make_string("value")
                    .type(expect);

                assert.strictEqual(a.type(), expect);
            });
            it('bad value', function() {
                assert.throws(function() {
                    var a = attribute
                        .make_string("value")
                        .type(0);
                }, Error);
            });
        });
        describe('iot:unit', function() {
            it('default value', function() {
                var a = attribute
                    .make_string("value");

                assert.strictEqual(a.unit(), null);
            });
            it('single value', function() {
                var expect = "iot-unit:temperature.si.celsius";
                var a = attribute
                    .make_string("value")
                    .unit(expect);

                assert.strictEqual(a.unit(), expect);
            });
            it('bad value', function() {
                assert.throws(function() {
                    var a = attribute
                        .make_string("value")
                        .unit(0);
                }, Error);
            });
        });
        describe('iot:maximum', function() {
            it('default value', function() {
                var a = attribute
                    .make_string("value");

                assert.strictEqual(a.maximum(), null);
            });
            it('single value', function() {
                var expect = 23;
                var a = attribute
                    .make_string("value")
                    .maximum(expect);

                assert.strictEqual(a.maximum(), expect);
            });
        });
        describe('iot:minimum', function() {
            it('default value', function() {
                var a = attribute
                    .make_string("value");

                assert.strictEqual(a.minimum(), null);
            });
            it('single value', function() {
                var expect = 2;
                var a = attribute
                    .make_string("value")
                    .minimum(expect);

                assert.strictEqual(a.minimum(), expect);
            });
        });
        describe('iot:purpose', function() {
            it('single value', function() {
                var expect = "iot-purpose:on";
                var a = attribute
                    .make_string("value")
                    .purpose(expect);

                assert.strictEqual(a.purpose(), expect);
            });
            it('bad value', function() {
                assert.throws(function() {
                    var a = attribute
                        .make_string("value")
                        .purpose(0);
                }, Error);
            });
        });
    });
    describe('lists', function() {
        describe('iot:enumeration', function() {
            it('default value', function() {
                var a = attribute
                    .make_string("value");

                assert.strictEqual(a.enumeration(), null);
            });
            it('single value -- not allowed', function() {
                assert.throws(function() {
                    var a = attribute
                        .make_string("value")
                        .enumeration("iot-purpose:band.tv");
                });
            });
            it('multi value', function() {
                var expect = [
                    "iot-purpose:band.tv",
                    "iot-purpose:band.hdmi#1",
                ];
                var a = attribute
                    .make_string("value")
                    .enumeration(expect);

                assert.deepEqual(a.enumeration(), expect);
            });
            it('multi value with numbers and repeats', function() {
                var use = [
                    1, 1, 2, 3, 5, 8, 13
                ];
                var expect = [
                    1, 2, 3, 5, 8, 13
                ];
                var a = attribute
                    .make_string("value")
                    .enumeration(use);

                assert.deepEqual(a.enumeration(), expect);
            });
        });
    });
});
