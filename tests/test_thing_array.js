/*
 *  test_thing_array.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-06
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var _ = require("../helpers")

var iotdb = require("../iotdb");
var things = require("../things");

require('./instrument/iotdb');

var _make_thing = function(callback) {
    var t = new things.Things();
    t._reset();
    
    var ts = t.connect("Test", {}, {
        "schema:name": "The Thing Name",
        "schema:description": "My Thing",
        "iot:tag": [ "a", "b", "c" ],
        "iot:thing-number": 32,
    });
    ts.on("thing", function() {
        callback(ts);
    });
};

var _make_no_things = function(callback) {
};

describe("test_thing_array", function() {
    describe("first", function() {
        it("with one thing", function() {
            _make_thing(function(ts) {
                var thing = ts.first()
                assert.ok(thing);
                assert.ok(_.is.Thing(thing));
            });
        });
        it("with no things", function() {
            _make_no_things(function(ts) {
                var thing = ts.first()
                assert.ok(!thing);
                assert.ok(_.is.Null(thing));
            });
        });
    });
    describe("reachable", function() {
        it("with no things", function() {
            _make_no_things(function(ts) {
                assert.strictEqual(ts.reachable(), 0);
            });
        });
        it("with one thing", function() {
            _make_thing(function(ts) {
                assert.strictEqual(ts.reachable(), 1);
            });
        });
        it("with one thing with no bridge", function() {
            _make_thing(function(ts) {
                var thing = ts.first();
                thing.disconnect();

                assert.strictEqual(ts.reachable(), 0);
            });
        });
        it("with one thing that's not reachable", function() {
            _make_thing(function(ts) {
                ts.first().reachable = function() { return false };
                assert.strictEqual(ts.reachable(), 0);
            });
        });
    });
});
