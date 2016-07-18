/*
 *  test_thing_manager.js
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

describe('test_thing_manager', function() {
    describe('constructor', function() {
        it('new', function() {
            const tm = thing_manager.make();
            const ts = tm.things();

            assert.ok(_.is.ThingSet(ts));
            assert.strictEqual(ts.count(), 0);
        });
    });
    describe('connect', function() {
        it('no argument', function() {
            const tm = thing_manager.make();
            tm._reset();
            
            var model_code = tm.connect();

//XXX            assert.strictEqual(model_code, undefined);
        });
        it('model:Test / string argument', function() {
            const tm = thing_manager.make();
            tm._reset();
            
            var model_code = tm.connect("Test");

//XXX            assert.strictEqual(model_code, "test");
        });
        it('model:Test / string argument + dictionary', function() {
            const tm = thing_manager.make();
            tm._reset();
            
            var model_code = tm.connect("Test", {
                parameter: 123,
            });

//XXX            assert.strictEqual(model_code, "test");
        });
        it('model:Test / dictionary', function() {
            const tm = thing_manager.make();
            tm._reset();
            
            var model_code = tm.connect({
                model_id: "Test",
                parameter: 123,
            });

//XXX            assert.strictEqual(model_code, "test");
        });
        it('model:Test / dictionary (obsolete way)', function() {
            const tm = thing_manager.make();
            tm._reset();
            
            var model_code = tm.connect({
                model_id: "Test",
                parameter: 123,
            });

//XXX            assert.strictEqual(model_code, "test");
        });
        it('multiple dictionaries', function() {
            const tm = thing_manager.make();
            tm._reset();
            
            var model_code = tm.connect({
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
                const tm = thing_manager.make();
                tm._reset();
                
                assert.throws(function() {
                    var model_code = tm.connect(123);
                }, Error);
            });
            it('bad model code', function() {
                const tm = thing_manager.make();
                tm._reset();
                
                assert.throws(function() {
                    var model_code = tm.connect({
                        model_id: 123,
                    });
                }, Error);
            });
            it('bad second argument', function() {
                const tm = thing_manager.make();
                tm._reset();
                
                assert.throws(function() {
                    var model_code = tm.connect({
                        model_id: "ModelCode",
                    }, 1234);
                }, Error);
            });
            it('bad third argument', function() {
                const tm = thing_manager.make();
                tm._reset();
                
                assert.throws(function() {
                    var model_code = tm.connect({
                        model_id: "ModelCode",
                    }, {}, 1234);
                }, Error);
            });
        });
        /*
        describe('discover_bridge', function() {
            it('simple', function() {
                const tm = thing_manager.make();
                tm._reset();
                
                var model_code = tm.discover({
                    model_id: "Test",
                    bridge: "test-bridge",
                });
            });
        });
        */
        describe('disconnect', function() {
            it('nothing connected', function() {
                const tm = thing_manager.make();
                tm._reset();
                tm.disconnect();
            });
            it('something connected', function(done) {
                const tm = thing_manager.make();
                tm._reset();
                
                const ts = tm.connect({
                    model_id: "Test",
                });

                ts.on("thing", function() {
                    tm.disconnect();
                    done();
                });

            });
        });
    });
});
