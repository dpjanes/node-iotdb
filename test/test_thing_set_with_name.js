/*
 *  test_thing_set_with_name.js
 *
 *  David Janes
 *  IOTDB
 *  2016-07-17
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
    ts.name("New Name");
    ts.on("thing", function() {
        callback(ts);
    });
};

describe('test_thing_set_with_name', function() {
    describe('name', function(done) {
        it('sets the tags', function(done) {
            _make_thing(function(ts) {
                const thing = ts.any();
                const name = thing.name();

                assert.deepEqual(name, "New Name");
                done();
            });
        });
    });
    describe('with_name', function(done) {
        it('matching', function(done) {
            _make_thing(function(ts) {
                var ms = ts.with_name("New Name");

                assert.strictEqual(ms.count(), 1);
                done();
            });
        });
        it('matching with array with some non matching items', function(done) {
            _make_thing(function(ts) {
                var ms = ts.with_name([ "New Name", "d", "e"]);

                assert.strictEqual(ms.count(), 1);
                done();
            });
        });
        it('not matching', function(done) {
            _make_thing(function(ts) {
                var ms = ts.with_name("e");

                assert.strictEqual(ms.count(), 0);
                assert.ok(ms.empty());
                done();
            });
        });
        it('not matching with array', function(done) {
            _make_thing(function(ts) {
                var ms = ts.with_name([ "e", "f", "g" ]);

                assert.strictEqual(ms.count(), 0);
                assert.ok(ms.empty());
                done();
            });
        });
    });
});
