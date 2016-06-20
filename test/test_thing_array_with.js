/*
 *  test_thing_array_with.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-06
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var _ = require("../helpers")

var iotdb = require("../iotdb");
var thing_manager = require("../thing_manager");

require('./instrument/iotdb');

var _make_thing = function(callback) {
    var t = new thing_manager.ThingManager();
    t._reset();
    
    var ts = t.connect("Test", {}, {
        "schema:name": "The Thing Name",
        "schema:description": "My Thing",
        "iot:zone": [ "Glasgow Place", "Second Floor", "Bedroom" ],
        "iot:facet": [ "iot-facet:switch", "iot-facet:lighting", "iot-facet:something" ],
        "iot:thing-number": 32,
    });
    ts.on("thing", function() {
        callback(ts);
    });
};

describe('test_thing_array', function() {
    describe('with', function() {
        describe('with_code', function() {
            it('matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_code("test");

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('not matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_code("not-a-name");

                    assert.strictEqual(ms.length, 0);
                });
            });
        });
        describe('with_name', function() {
            it('matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_name("The Thing Name");

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_name([ "The Thing Name", "not-a-name", ]);

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('not matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_name("not-a-name");

                    assert.strictEqual(ms.length, 0);
                });
            });
        });
        describe('with_number', function() {
            it('matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_number(32);

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_number([ 32, 21, ]);

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('not matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_number(21);

                    assert.strictEqual(ms.length, 0);
                });
            });
            it('*matching* with string argument that looks like it should match', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_number("32");

                    assert.strictEqual(ms.length, 1);
                });
            });
        });
        describe('with_zone', function() {
            it('matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_zone("Glasgow Place");

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_zone([ "Glasgow Place", "Second Floor", "Bedroom"]);

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array with some non matching items', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_zone([ "Bedroom", "d", "e"]);

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('not matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_zone("e");

                    assert.strictEqual(ms.length, 0);
                });
            });
            it('not matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_zone([ "e", "f", "g" ]);

                    assert.strictEqual(ms.length, 0);
                });
            });
        });
        describe('with_facet', function() {
            it('matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_facet("iot-facet:switch");

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_facet([ "iot-facet:switch", "iot-facet:lighting", "iot-facet:something"]);

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array with some non matching items', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_facet([ "iot-facet:something", "d", "e"]);

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('not matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_facet("e");

                    assert.strictEqual(ms.length, 0);
                });
            });
            it('not matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_facet([ "e", "f", "g" ]);

                    assert.strictEqual(ms.length, 0);
                });
            });
        });
        describe('with_zone', function() {
            it('matching', function() {
                _make_thing(function(ts) {
                    var thing = ts.first();
                    var ms = ts.with_id(thing.thing_id());

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('not matching', function() {
                _make_thing(function(ts) {
                    var thing = ts.first();
                    var ms = ts.with_id("notathingid");

                    assert.strictEqual(ms.length, 0);
                });
            });
        });
    });
});
