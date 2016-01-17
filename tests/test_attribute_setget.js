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
    describe('name', function() {
        it('single value', function() {
            var expect = "David";
            var a = attribute
                .make_string("value")
                .name(expect);

            assert.strictEqual(a.name(), expect);
        });
        it('multi value', function() {
            var expect = "David";
            var a = attribute
                .make_string("value");

            _.ld.set(a, _.ld.expand("schema:name"), [ "David", "Janes" ]);

            assert.strictEqual(a.name(), expect);
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
        it('multi value', function() {
            var expect = "David";
            var a = attribute
                .make_string("value");

            _.ld.set(a, _.ld.expand("schema:description"), [ "David", "Janes" ]);

            assert.strictEqual(a.description(), expect);
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
        it('multi value', function() {
            var expect = "David";
            var a = attribute
                .make_string("value");

            _.ld.set(a, _.ld.expand("iot:help"), [ "David", "Janes" ]);

            assert.strictEqual(a.help(), expect);
        });
    });
});
