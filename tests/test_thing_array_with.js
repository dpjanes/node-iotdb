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
