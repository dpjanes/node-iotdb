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
        it('no argument', function(done) {
            const tm = thing_manager.make();
            
            const ts = tm.connect();
            ts.on("thing", (thing) => {
                done();
            });
        });
        it('model:Test / string argument', function(done) {
            const tm = thing_manager.make();
            
            const ts = tm.connect("Test");
            ts.on("thing", (thing) => {
                done();
            });
        });
        it('model:Test / string argument + dictionary', function(done) {
            const tm = thing_manager.make();
            
            const ts = tm.connect("Test", { number: 20 } );
            ts.on("thing", (thing) => {
                const metad = thing.state("meta");
                assert.strictEqual(metad['iot:thing-number'], 20);

                done();
            });
        });
        it('model:Test / dictionary', function(done) {
            const tm = thing_manager.make();
            
            const ts = tm.connect({ 
                model_id: "Test",
                number: 30
            });
            ts.on("thing", (thing) => {
                const metad = thing.state("meta");
                assert.strictEqual(metad['iot:thing-number'], 30);

                done();
            });
        });
        it('multiple dictionaries', function(done) {
            const tm = thing_manager.make();
            
            const ts = tm.connect(
                { model_id: "Test" },
                { number: 40 },
                { "schema:name": "David" }
            );
            ts.on("thing", (thing) => {
                const metad = thing.state("meta");
                assert.strictEqual(metad['iot:thing-number'], 40);
                assert.strictEqual(thing.name(), "David");

                done();
            });

        });
    });
    describe('bad', function() {
        it('bad argument', function() {
            const tm = thing_manager.make();
            
            assert.throws(function() {
                tm.connect(123);
            }, Error);
        });
        it('bad model code', function() {
            const tm = thing_manager.make();
            
            assert.throws(function() {
                tm.connect({
                    model_id: 123,
                });
            }, Error);
        });
        it('bad second argument', function() {
            const tm = thing_manager.make();
            
            assert.throws(function() {
                tm.connect({
                    model_id: "ModelCode",
                }, 1234);
            }, Error);
        });
        it('bad third argument', function() {
            const tm = thing_manager.make();
            tm._reset();
            
            assert.throws(function() {
                tm.connect({
                    model_id: "ModelCode",
                }, {}, 1234);
            }, Error);
        });
    });
    describe('disconnect', function() {
        it('nothing connected', function() {
            const tm = thing_manager.make();
            tm.disconnect();
        });
        it('something connected', function(done) {
            const tm = thing_manager.make();
            
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
