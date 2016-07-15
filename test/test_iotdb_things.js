/*
 *  test_iotdb_things.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-03
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var iotdb = require("../iotdb");

require('./instrument/iotdb');

describe('test_iotdb_things', function() {
    describe('things', function() {
        describe('global', function() {
            it('no arguments', function() {
                iotdb.shims.reset();
                var things = iotdb.things();

                assert.strictEqual(things.count(), 0);
            });
            /*
            it('valid model code argument', function() {
                iotdb.instance = null;
                var things = iotdb.things("Test");

                assert.strictEqual(things.count(), 0);
            });
            it('invalid model code argument', function() {
                iotdb.instance = null;
                var things = iotdb.things("NotATest");

                assert.strictEqual(things.count(), 0);
            });
            */
        });
        describe('clean setup', function() {
            it('no arguments', function() {
                iotdb.shims.reset();
                var iot = iotdb.iot()
                var things = iot.things();

                assert.strictEqual(things.count(), 0);
            });
            /*
            it('valid model code argument', function() {
                var iot = iotdb.iot()
                var things = iot.things("Test");

                assert.strictEqual(things.count(), 0);
            });
            it('invalid model code argument', function() {
                var iot = iotdb.iot()
                var things = iot.things("NotATest");

                assert.strictEqual(things.count(), 0);
            });
            */
        });
        describe('setup with Thing existing', function() {
            it('connected', function(done) {
                iotdb.shims.reset();
                var iot = iotdb.iot()

                var ts = iot.connect("Test");
                ts.on("thing", function() {
                    assert.strictEqual(iot.things().count(), 1);
                    // assert.strictEqual(iot.things("Test").count(), 1);
                    // assert.strictEqual(iot.things("NotATest").count(), 0);
                    done();
                });
            });
            it('invalid', function(done) {
                iotdb.shims.reset();
                var iot = iotdb.iot()

                var ts = iot.connect("NotATest");
                setTimeout(function() {
                    assert.strictEqual(iot.things().count(), 0);
                    // assert.strictEqual(iot.things("Test").count(), 0);
                    // assert.strictEqual(iot.things("NotATest").count(), 0);
                    done();
                }, 250);
            });
        });
    });
});
