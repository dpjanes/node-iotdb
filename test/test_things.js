/*
 *  test_things.js
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

describe('test_things', function() {
    describe('constructor', function() {
            /*
        it('global', function() {
            var t = things.things();
            t._reset();
            var ts = t.things();

            assert.ok(_.is.ThingArray(ts));
            assert.strictEqual(ts.count(), 0);

            var t2 = things.things();
            assert.strictEqual(t, t2);
        });
         */
        it('new', function() {
            var t = thing_manager.make();
            t._reset();
            var ts = t.things();

            assert.ok(_.is.ThingArray(ts));
            assert.strictEqual(ts.count(), 0);
        });
    });
    describe('connect', function() {
        it('no argument', function() {
            var t = thing_manager.make();
            t._reset();
            
            var model_code = t.connect();

//XXX            assert.strictEqual(model_code, undefined);
        });
        it('model:Test / string argument', function() {
            var t = thing_manager.make();
            t._reset();
            
            var model_code = t.connect("Test");

//XXX            assert.strictEqual(model_code, "test");
        });
        it('model:Test / string argument + dictionary', function() {
            var t = thing_manager.make();
            t._reset();
            
            var model_code = t.connect("Test", {
                parameter: 123,
            });

//XXX            assert.strictEqual(model_code, "test");
        });
        it('model:Test / dictionary', function() {
            var t = thing_manager.make();
            t._reset();
            
            var model_code = t.connect({
                model_id: "Test",
                parameter: 123,
            });

//XXX            assert.strictEqual(model_code, "test");
        });
        it('model:Test / dictionary (obsolete way)', function() {
            var t = thing_manager.make();
            t._reset();
            
            var model_code = t.connect({
                model_id: "Test",
                parameter: 123,
            });

//XXX            assert.strictEqual(model_code, "test");
        });
        it('multiple dictionaries', function() {
            var t = thing_manager.make();
            t._reset();
            
            var model_code = t.connect({
                model_id: "Test",
            }, {
                parameter: 123,
            }, {
                "iot:name": "David",
            })
             

//XXX            assert.strictEqual(model_code, "test");
        });
        describe('bad', function() {
            it('bad argument', function() {
                var t = thing_manager.make();
                t._reset();
                
                assert.throws(function() {
                    var model_code = t.connect(123);
                }, Error);
            });
            it('bad model code', function() {
                var t = thing_manager.make();
                t._reset();
                
                assert.throws(function() {
                    var model_code = t.connect({
                        model_id: 123,
                    });
                }, Error);
            });
            it('bad second argument', function() {
                var t = thing_manager.make();
                t._reset();
                
                assert.throws(function() {
                    var model_code = t.connect({
                        model_id: "ModelCode",
                    }, 1234);
                }, Error);
            });
            it('bad third argument', function() {
                var t = thing_manager.make();
                t._reset();
                
                assert.throws(function() {
                    var model_code = t.connect({
                        model_id: "ModelCode",
                    }, {}, 1234);
                }, Error);
            });
        });
        /*
        describe('discover_bridge', function() {
            it('simple', function() {
                var t = thing_manager.make();
                t._reset();
                
                var model_code = t.discover({
                    model_id: "Test",
                    bridge: "test-bridge",
                });
            });
        });
        */
        describe('disconnect', function() {
            it('nothing connected', function() {
                var t = thing_manager.make();
                t._reset();
                t.disconnect();
            });
            it('something connected', function(done) {
                var t = thing_manager.make();
                t._reset();
                
                var ts = t.connect({
                    model_id: "Test",
                });

                ts.on("thing", function() {
                    t.disconnect();
                    done();
                });

            });
        });
    });
});
