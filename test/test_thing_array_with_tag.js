/*
 *  test_thing_set_with_tag.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-06
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var iotdb = require("../iotdb");
var thing_manager = require("../thing_manager");

require('./instrument/iotdb');

var _make_thing = function(callback) {
    var t = thing_manager.make();
    t._reset();
    
    var ts = t.connect("Test", {}, {
        "schema:name": "The Thing Name",
        "schema:description": "My Thing",
        "iot:zone": [ "Glasgow Place", "Second Floor", "Bedroom" ],
        "iot:facet": [ "iot-facet:switch", "iot-facet:lighting", "iot-facet:something" ],
        "iot:thing-number": 32,
    });
    ts.tag([ "a", "b", "c" ]);
    ts.on("thing", function() {
        callback(ts);
    });
};

describe('test_thing_set', function() {
    describe('with', function() {
        describe('with_tag', function() {
            it('matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_tag("a");

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_tag([ "a", "b", "c"]);

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array with some non matching items', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_tag([ "c", "d", "e"]);

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('not matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_tag("e");

                    assert.strictEqual(ms.length, 0);
                });
            });
            it('not matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.with_tag([ "e", "f", "g" ]);

                    assert.strictEqual(ms.length, 0);
                });
            });
        });
    });
});
