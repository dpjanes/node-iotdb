/*
 *  test_thing_set.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-06
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var iotdb = require("../iotdb");
var thing_manager = require("../thing_manager");
var thing_set = require("../thing_set");

require('./instrument/iotdb');

var _make_thing = function(callback) {
    var t = thing_manager.make();
    t.reset();
    
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
    t.reset();
    
    var ts = t.connect("NoThingTest", {}, {
        "schema:name": "The Thing Name",
        "schema:description": "My Thing",
        "iot:thing-number": 32,
    });
    callback(ts);
};

describe("test_thing_set", function() {
    describe("any", function() {
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                var thing = ts.any()
                assert.ok(thing);
                assert.ok(_.is.Thing(thing));
                done();
            });
        });
        it("with no things", function(done) {
            _make_no_things(function(ts) {
                var thing = ts.any()
                assert.ok(!thing);
                assert.ok(_.is.Null(thing));
                done();
            });
        });
    });
    describe("reachable", function() {
        it("with no things", function(done) {
            _make_no_things(function(ts) {
                assert.strictEqual(ts.reachable(), 0);
                done();
            });
        });
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                assert.strictEqual(ts.reachable(), 1);
                done();
            });
        });
        it("with one thing with no bridge", function(done) {
            _make_thing(function(ts) {
                var thing = ts.any();
                thing.disconnect();

                assert.strictEqual(ts.reachable(), 0);
                done();
            });
        });
        it("with one thing that's not reachable", function(done) {
            _make_thing(function(ts) {
                ts.any().reachable = function() { return false };
                assert.strictEqual(ts.reachable(), 0);
                done();
            });
        });
    });
    describe("set", function() {
        it("with no things", function(done) {
            _make_no_things(function(ts) {
                ts.set(":on", true);
                done();
            });
        });
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                var thing = ts.any()
                thing.on("istate", function() {
                    done();
                });
                ts.set(":on", true);
            });
        });
    });
    describe("update", function() {
        it("with no things", function(done) {
            _make_no_things(function(ts) {
                ts.update("ostate", {
                    "on": true,
                });
                done();
            });
        });
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                var thing = ts.any()
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
        it("with no things", function(done) {
            _make_no_things(function(ts) {
                ts.pull();
                done();
            });
        });
        /*
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                var thing = ts.any()
                thing.on("istate", function() {
                    done();
                });
                // not a real API, just for testing
                thing.bridge_instance.istate.on = true;
                ts.pull();
            });
        });
        */
    });
    describe("disconnect", function() {
        it("with no things", function(done) {
            _make_no_things(function(ts) {
                ts.disconnect();
                done();
            });
        });
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                var thing = ts.any()
                assert.ok(thing.reachable());

                ts.disconnect();
                process.nextTick(function (){
                    assert.ok(!thing.reachable());
                    done();
                });
            });
        });
    });
    describe("on(s)", function() {
        it("on", function(done) {
            var t = thing_manager.make();
            t.reset();
            
            var ts = t.connect("Test");
            ts.on("thing", function(thing) {
                assert.ok(_.is.Thing(thing));
                done();
            });
        });
        it("addListener", function(done) {
            var t = thing_manager.make();
            t.reset();
            
            var ts = t.connect("Test");
            ts.addListener("thing", function(thing) {
                assert.ok(_.is.Thing(thing));
                done();
            });
        });
        it("once", function(done) {
            var t = thing_manager.make();
            t.reset();
            
            var ts = t.connect("Test");
            ts.once("thing", function(thing) {
                assert.ok(_.is.Thing(thing));
                done();
            });
        });
    });
    describe("push", function() {
        it("good", function(done) {
            _make_thing(function(ts1) {
                var thing1 = ts1.any();
                var ts2 = thing_set.make();
                ts2.add(thing1);
                var thing2 = ts2.any();

                assert.strictEqual(ts1.count(), 1);
                assert.strictEqual(ts2.count(), 1);
                assert.strictEqual(thing1, thing2);
                done();
            });
        });
        it("double push", function(done) {
            _make_thing(function(ts1) {
                var thing1 = ts1.any();
                var ts2 = thing_set.make();
                ts2.add(thing1);
                ts2.add(thing1);
                var thing2 = ts2.any();

                assert.strictEqual(ts1.count(), 1);
                assert.strictEqual(ts2.count(), 1);
                assert.strictEqual(thing1, thing2);
                done();
            });
        });
        describe("bad push", function() {
            it("boolean", function(done) {
                assert.throws(function() {
                    var ts = thing_set.make();
                    ts.add(false);
                }, Error);
                done();
            });
            it("string", function(done) {
                assert.throws(function() {
                    var ts = thing_set.make();
                    ts.add("hello");
                }, Error);
                done();
            });
            it("dictionary", function(done) {
                assert.throws(function() {
                    var ts = thing_set.make();
                    ts.add({ a: 1 });
                }, Error);
                done();
            });
        });
        describe("emits", function(done) {
            /*
            it("pushed:0 new:0", function(done) {
                _make_thing(function(ts1) {
                    var got_new = false;
                    var got_changed = false;

                    var ts2 = thing_set.make();
                    ts2.on('thing', function() {
                        got_new = true;
                    });
                    ts2.on('changed', function() {
                        got_changed = true;
                    });

                    ts2.add(ts1.any(), {
                        emit_pushed: false,
                        emit_new: false,
                    })

                    process.nextTick(function() {
                        assert.ok(!got_new);
                        assert.ok(!got_changed);
                        done();
                    });
                });
            });
            */
            /*
            it("pushed:1 new:0", function(done) {
                _make_thing(function(ts1) {
                    var got_new = false;
                    var got_changed = false;

                    var ts2 = thing_set.make();
                    ts2.on('thing', function() {
                        got_new = true;
                    });
                    ts2.on('changed', function() {
                        got_changed = true;
                    });

                    ts2.add(ts1.any(), {
                        emit_pushed: true,
                        emit_new: false,
                    })

                    process.nextTick(function() {
                        assert.ok(!got_new);
                        assert.ok(got_changed);
                        done();
                    });
                });
            });
            it("pushed:0 new:1", function(done) {
                _make_thing(function(ts1) {
                    var got_new = false;
                    var got_changed = false;

                    var ts2 = thing_set.make();
                    ts2.on('thing', function() {
                        got_new = true;
                    });
                    ts2.on('changed', function() {
                        got_changed = true;
                    });

                    ts2.add(ts1.any(), {
                        emit_pushed: false,
                        emit_new: true,
                    })

                    process.nextTick(function() {
                        assert.ok(got_new);
                        assert.ok(got_changed);
                        done();
                    });
                });
            });
            */
            it("default", function(done) {
                _make_thing(function(ts1) {
                    var got_new = false;
                    var got_changed = false;

                    var ts2 = thing_set.make();
                    ts2.on('thing', function() {
                        got_new = true;
                    });
                    ts2.on('changed', function() {
                        got_changed = true;
                    });

                    ts2.add(ts1.any(), {
                        emit_pushed: true,
                        emit_new: true,
                    })

                    process.nextTick(function() {
                        assert.ok(got_new);
                        assert.ok(got_changed);
                        done();
                    });
                });
            });
            it("pushed:1 new:1", function(done) {
                _make_thing(function(ts1) {
                    var got_new = false;
                    var got_changed = false;

                    var ts2 = thing_set.make();
                    ts2.on('thing', function() {
                        got_new = true;
                    });
                    ts2.on('changed', function() {
                        got_changed = true;
                    });

                    ts2.add(ts1.any(), {
                        emit_pushed: true,
                        emit_new: true,
                    })

                    process.nextTick(function() {
                        assert.ok(got_new);
                        assert.ok(got_changed);
                        done();
                    });
                });
            });
        });
    });
    describe("forEach", function() {
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                let count = 0;
                ts.forEach(thing => {
                    count += 1;
                });
                assert.strictEqual(count, 1);
                done();
            });
        });
        it("with no things", function(done) {
            _make_no_things(function(ts) {
                let count = 0;
                ts.forEach(thing => {
                    count += 1;
                });
                assert.strictEqual(count, 0);
                done();
            });
        });
    });
    describe("reduce", function() {
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                const count = ts.reduce((value, thing) => {
                    return value + 10;
                }, 10);
                assert.strictEqual(count, 20);
                done();
            });
        });
        it("with no things", function(done) {
            _make_no_things(function(ts) {
                const count = ts.reduce((value, thing) => {
                    return value + 10;
                }, 10);
                assert.strictEqual(count, 10);
                done();
            });
        });
    });
    describe("filter", function() {
        it("with one thing", function(done) {
            _make_thing(function(ts) {
                const things = ts.filter(thing => true);
                assert.strictEqual(things.length, 1);
                assert.ok(_.is.Thing(things[0]));
                done();
            });
        });
        it("with no things", function(done) {
            _make_no_things(function(ts) {
                const things = ts.filter(thing => true);
                assert.strictEqual(things.length, 0);
                done();
            });
        });
    });
});
