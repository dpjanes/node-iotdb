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
var thing_manager = require("../thing_manager");
var thing_array = require("../thing_array");

require('./instrument/iotdb');

var _make_thing = function(callback) {
    var t = thing_manager.make();
    t._reset();
    
    var ts = t.connect("Test", {}, {
        "schema:name": "The Thing Name",
        "schema:description": "My Thing",
        "iot:thing-number": 32,
    });
    ts.on("thing", function() {
        callback(ts);
    });
};

var _make_no_things = function(callback) {
    var t = thing_manager.make();
    t._reset();
    
    var ts = t.connect("NoThingTest", {}, {
        "schema:name": "The Thing Name",
        "schema:description": "My Thing",
        "iot:thing-number": 32,
    });
    callback(ts);
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
    describe("set", function() {
        it("with no things", function() {
            _make_no_things(function(ts) {
                ts.set(":on", true);
            });
        });
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                var thing = ts.first()
                thing.on("istate", function() {
                    done();
                });
                ts.set(":on", true);
            });
        });
    });
    describe("update", function() {
        it("with no things", function() {
            _make_no_things(function(ts) {
                ts.update("ostate", {
                    "on": true,
                });
            });
        });
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                var thing = ts.first()
                thing.on("istate", function() {
                    done();
                });
                ts.update("ostate", {
                    "on": true,
                });
            });
        });
    });
    describe("pull", function() {
        it("with no things", function() {
            _make_no_things(function(ts) {
                ts.pull();
            });
        });
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                var thing = ts.first()
                thing.on("istate", function() {
                    done();
                });
                // not a real API, just for testing
                thing.bridge_instance.istate.on = true;
                ts.pull();
            });
        });
    });
    describe("disconnect", function() {
        it("with no things", function() {
            _make_no_things(function(ts) {
                ts.disconnect();
            });
        });
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                var thing = ts.first()
                assert.ok(thing.reachable());

                ts.disconnect();
                process.nextTick(function (){
                    assert.ok(!thing.reachable());
                    done();
                });
            });
        });
    });
    describe("on", function() {
        it("with no things", function() {
            _make_no_things(function(ts) {
                ts.on("on", function() {
                    assert.ok(false);
                });
                ts.set(":on", true);
            });
        });
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                var thing = ts.first()
                ts.on("on", function(t, attribute, value) {
                    if (!value) {
                        return;
                    }
                    done();
                });

                // called 3 times, for initialization, istate and ostate
                // so we use the bridge instance
                // ts.set(":on", true);
                thing.bridge_instance.test_pull({ on: true });
            });
        });
    });
    describe("push", function() {
        it("good", function() {
            _make_thing(function(ts1) {
                var thing1 = ts1.first();
                var ts2 = new thing_array.ThingArray();
                ts2.push(thing1);
                var thing2 = ts2.first();

                assert.strictEqual(ts1.length, 1);
                assert.strictEqual(ts2.length, 1);
                assert.strictEqual(thing1, thing2);
            });
        });
        it("double push", function() {
            _make_thing(function(ts1) {
                var thing1 = ts1.first();
                var ts2 = new thing_array.ThingArray();
                ts2.push(thing1);
                ts2.push(thing1);
                var thing2 = ts2.first();

                assert.strictEqual(ts1.length, 1);
                assert.strictEqual(ts2.length, 1);
                assert.strictEqual(thing1, thing2);
            });
        });
        describe("bad push", function() {
            it("boolean", function() {
                assert.throws(function() {
                    var ts = new thing_array.ThingArray();
                    ts.push(false);
                }, Error);
            });
            it("string", function() {
                assert.throws(function() {
                    var ts = new thing_array.ThingArray();
                    ts.push("hello");
                }, Error);
            });
            it("dictionary", function() {
                assert.throws(function() {
                    var ts = new thing_array.ThingArray();
                    ts.push({ a: 1 });
                }, Error);
            });
        });
        describe("emits", function() {
            it("pushed:0 new:0", function(done) {
                _make_thing(function(ts1) {
                    var got_pushed = false;
                    var got_new = false;
                    var got_changed = false;

                    var ts2 = new thing_array.ThingArray();
                    ts2.on('EVENT_THING_NEW', function() {
                        got_new = true;
                    });
                    ts2.on('EVENT_THING_PUSHED', function() {
                        got_pushed = true;
                    });
                    ts2.on('EVENT_THINGS_CHANGED', function() {
                        got_changed = true;
                    });

                    ts2.push(ts1.first(), {
                        emit_pushed: false,
                        emit_new: false,
                    })

                    process.nextTick(function() {
                        assert.ok(!got_pushed);
                        assert.ok(!got_new);
                        assert.ok(!got_changed);
                        done();
                    });
                });
            });
            it("pushed:1 new:0", function(done) {
                _make_thing(function(ts1) {
                    var got_pushed = false;
                    var got_new = false;
                    var got_changed = false;

                    var ts2 = new thing_array.ThingArray();
                    ts2.on('EVENT_THING_NEW', function() {
                        got_new = true;
                    });
                    ts2.on('EVENT_THING_PUSHED', function() {
                        got_pushed = true;
                    });
                    ts2.on('EVENT_THINGS_CHANGED', function() {
                        got_changed = true;
                    });

                    ts2.push(ts1.first(), {
                        emit_pushed: true,
                        emit_new: false,
                    })

                    process.nextTick(function() {
                        assert.ok(got_pushed);
                        assert.ok(!got_new);
                        assert.ok(got_changed);
                        done();
                    });
                });
            });
            it("pushed:0 new:1", function(done) {
                _make_thing(function(ts1) {
                    var got_pushed = false;
                    var got_new = false;
                    var got_changed = false;

                    var ts2 = new thing_array.ThingArray();
                    ts2.on('EVENT_THING_NEW', function() {
                        got_new = true;
                    });
                    ts2.on('EVENT_THING_PUSHED', function() {
                        got_pushed = true;
                    });
                    ts2.on('EVENT_THINGS_CHANGED', function() {
                        got_changed = true;
                    });

                    ts2.push(ts1.first(), {
                        emit_pushed: false,
                        emit_new: true,
                    })

                    process.nextTick(function() {
                        assert.ok(!got_pushed);
                        assert.ok(got_new);
                        assert.ok(got_changed);
                        done();
                    });
                });
            });
            it("default", function(done) {
                _make_thing(function(ts1) {
                    var got_pushed = false;
                    var got_new = false;
                    var got_changed = false;

                    var ts2 = new thing_array.ThingArray();
                    ts2.on('EVENT_THING_NEW', function() {
                        got_new = true;
                    });
                    ts2.on('EVENT_THING_PUSHED', function() {
                        got_pushed = true;
                    });
                    ts2.on('EVENT_THINGS_CHANGED', function() {
                        got_changed = true;
                    });

                    ts2.push(ts1.first(), {
                        emit_pushed: true,
                        emit_new: true,
                    })

                    process.nextTick(function() {
                        assert.ok(got_pushed);
                        assert.ok(got_new);
                        assert.ok(got_changed);
                        done();
                    });
                });
            });
            it("pushed:1 new:1", function(done) {
                _make_thing(function(ts1) {
                    var got_pushed = false;
                    var got_new = false;
                    var got_changed = false;

                    var ts2 = new thing_array.ThingArray();
                    ts2.on('EVENT_THING_NEW', function() {
                        got_new = true;
                    });
                    ts2.on('EVENT_THING_PUSHED', function() {
                        got_pushed = true;
                    });
                    ts2.on('EVENT_THINGS_CHANGED', function() {
                        got_changed = true;
                    });

                    ts2.push(ts1.first(), {
                        emit_pushed: true,
                        emit_new: true,
                    })

                    process.nextTick(function() {
                        assert.ok(got_pushed);
                        assert.ok(got_new);
                        assert.ok(got_changed);
                        done();
                    });
                });
            });
        });
    });
});
