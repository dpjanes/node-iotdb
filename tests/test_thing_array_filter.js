/*
 *  test_thing_array_filter.js
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
        "iot:zone": [ "a", "b", "c" ],
        "iot:thing-number": 32,
    });
    ts.on("thing", function() {
        callback(ts);
    });
};

describe('test_thing_array', function() {
    describe('filter', function() {
        describe('meta:iot:model-id', function() {
            it('matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:model-id": "test",
                    });

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:model-id": [ "test", "not-a-name", ],
                    });

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('not matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:model-id": "not-a-name",
                    });

                    assert.strictEqual(ms.length, 0);
                });
            });
        });
        describe('meta:schema:name', function() {
            it('matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:schema:name": "The Thing Name",
                    });

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:schema:name": [ "The Thing Name", "not-a-name", ],
                    });

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('not matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:schema:name": "not-a-name",
                    });

                    assert.strictEqual(ms.length, 0);
                });
            });
        });
        describe('meta:iot:thing-number', function() {
            it('matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:thing-number": 32,
                    });

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:thing-number": [ 32, 21, ],
                    });

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('not matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:thing-number": 21,
                    });

                    assert.strictEqual(ms.length, 0);
                });
            });
            it('not matching with string argument that looks like it should match', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:thing-number": "32",
                    });

                    assert.strictEqual(ms.length, 0);
                });
            });
        });
        describe('meta:iot:tag', function() {
            it('matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:tag": "a",
                    });

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:tag": [ "a", "b", "c"],
                    });

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array with some non matching items', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:tag": [ "c", "d", "e"],
                    });

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('not matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:tag": "e",
                    });

                    assert.strictEqual(ms.length, 0);
                });
            });
            it('not matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:tag": [ "e", "f", ],
                    });

                    assert.strictEqual(ms.length, 0);
                });
            });
        });
        describe('meta:iot:zone', function() {
            it('matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:zone": "a",
                    });

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:zone": [ "a", "b", "c"],
                    });

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('matching with array with some non matching items', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:zone": [ "c", "d", "e"],
                    });

                    assert.strictEqual(ms.length, 1);
                });
            });
            it('not matching', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:zone": "e",
                    });

                    assert.strictEqual(ms.length, 0);
                });
            });
            it('not matching with array', function() {
                _make_thing(function(ts) {
                    var ms = ts.filter({
                        "meta:iot:zone": [ "e", "f", ],
                    });

                    assert.strictEqual(ms.length, 0);
                });
            });
        });
    });
});
