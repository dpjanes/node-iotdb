/*
 *  test_thing_set_filter.js
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
        "iot:zone": [ "a", "b", "c" ],
        "iot:thing-number": 32,
    });
    ts.tag([ "a", "b", "c" ]);
    ts.on("thing", function() {
        callback(ts);
    });
};

describe('test_thing_set', function() {
    describe('search', function() {
        describe('meta:iot:model-id', function() {
            it('matching', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:iot:model-id": "test",
                    });

                    assert.strictEqual(ms.count(), 1);
                    done();
                });
            });
            it('matching with array', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:iot:model-id": [ "test", "not-a-name", ],
                    });

                    assert.strictEqual(ms.count(), 1);
                    done();
                });
            });
            it('not matching', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:iot:model-id": "not-a-name",
                    });

                    assert.strictEqual(ms.count(), 0);
                    done();
                });
            });
        });
        describe('meta:schema:name', function() {
            it('matching', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:schema:name": "The Thing Name",
                    });

                    assert.strictEqual(ms.count(), 1);
                    done();
                });
            });
            it('matching with array', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:schema:name": [ "The Thing Name", "not-a-name", ],
                    });

                    assert.strictEqual(ms.count(), 1);
                    done();
                });
            });
            it('not matching', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:schema:name": "not-a-name",
                    });

                    assert.strictEqual(ms.count(), 0);
                    done();
                });
            });
        });
        describe('meta:iot:thing-number', function() {
            it('matching', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:iot:thing-number": 32,
                    });

                    assert.strictEqual(ms.count(), 1);
                    done();
                });
            });
            it('matching with array', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:iot:thing-number": [ 32, 21, ],
                    });

                    assert.strictEqual(ms.count(), 1);
                    done();
                });
            });
            it('not matching', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:iot:thing-number": 21,
                    });

                    assert.strictEqual(ms.count(), 0);
                    done();
                });
            });
            it('not matching with string argument that looks like it should match', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:iot:thing-number": "32",
                    });

                    assert.strictEqual(ms.count(), 0);
                    done();
                });
            });
        });
        describe('transient:other', function() {
            it('called', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "transient:other": "a",
                    });

                    assert.strictEqual(ms.count(), 0);
                    done();
                });
            });
        });
        describe('transient:tag', function() {
            it('matching', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "transient:tag": "a",
                    });

                    assert.strictEqual(ms.count(), 1);
                    done();
                });
            });
            it('matching with array', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "transient:tag": [ "a", "b", "c"],
                    });

                    assert.strictEqual(ms.count(), 1);
                    done();
                });
            });
            it('matching with array with some non matching items', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "transient:tag": [ "c", "d", "e"],
                    });

                    assert.strictEqual(ms.count(), 1);
                    done();
                });
            });
            it('not matching', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "transient:tag": "e",
                    });

                    assert.strictEqual(ms.count(), 0);
                    done();
                });
            });
            it('not matching with array', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "transient:tag": [ "e", "f", ],
                    });

                    assert.strictEqual(ms.count(), 0);
                    done();
                });
            });
        });
        describe('meta:iot:zone', function() {
            it('matching', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:iot:zone": "a",
                    });

                    assert.strictEqual(ms.count(), 1);
                    done();
                });
            });
            it('matching with array', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:iot:zone": [ "a", "b", "c"],
                    });

                    assert.strictEqual(ms.count(), 1);
                    done();
                });
            });
            it('matching with array with some non matching items', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:iot:zone": [ "c", "d", "e"],
                    });

                    assert.strictEqual(ms.count(), 1);
                    done();
                });
            });
            it('not matching', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:iot:zone": "e",
                    });

                    assert.strictEqual(ms.count(), 0);
                    done();
                });
            });
            it('not matching with array', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "meta:iot:zone": [ "e", "f", ],
                    });

                    assert.strictEqual(ms.count(), 0);
                    done();
                });
            });
        });
        describe('weird', function() {
            it('will not work', function(done) {
                _make_thing(function(ts) {
                    assert.throws(() => {
                        ts.search({
                            "weird:other": "a",
                        });
                    }, Error);
                    done();
                });
            });
        });
        // these are not implemented yet - change when implemented
        describe('istate:fail', function() {
            it('called', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "istate:other": "a",
                    });

                    assert.strictEqual(ms.count(), 0);
                    done();
                });
            });
        });
        describe('ostate:fail', function() {
            it('called', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "ostate:other": "a",
                    });

                    assert.strictEqual(ms.count(), 0);
                    done();
                });
            });
        });
        describe('model:fail', function() {
            it('called', function(done) {
                _make_thing(function(ts) {
                    var ms = ts.search({
                        "model:other": "a",
                    });

                    assert.strictEqual(ms.count(), 0);
                    done();
                });
            });
        });
    });
});
