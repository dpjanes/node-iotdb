/*
 *  test_iotdb_things.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-03
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var _ = require("../helpers")

var iotdb = require("../iotdb");
var things = require("../things");
var keystore = require("../keystore");

require('./instrument/iotdb');

describe('test_iotdb', function() {
    describe('things', function() {
        describe('clean setup', function() {
            it('no arguments', function() {
                var iot = new iotdb.IOT()
                var things = iot.things();

                assert.strictEqual(things.length, 0);
            });
            it('valid model code argument', function() {
                var iot = new iotdb.IOT()
                var things = iot.things("Test");

                assert.strictEqual(things.length, 0);
            });
            it('invalid model code argument', function() {
                var iot = new iotdb.IOT()
                var things = iot.things("NotATest");

                assert.strictEqual(things.length, 0);
            });
        });
        describe('setup with Thing existing', function() {
            /*
            it('no arguments', function(done) {
                var iot = new iotdb.IOT()

                var ts = iot.connect("Test");
                ts.on("thing", function() {
                    var things = iot.things();

                    assert.strictEqual(things.length, 1);
                });
            });
            it('valid model code argument', function() {
                var iot = new iotdb.IOT()

                var ts = iot.connect("Test");
                ts.on("thing", function() {
                    var things = iot.things("Test");

                    assert.strictEqual(things.length, 1);
                });
            });
            */
            /*
            it('invalid model code argument', function() {
                var iot = new iotdb.IOT()

                var ts = iot.connect("Test");
                console.log("INVALID", ts.length);
                ts.on("thing", function() {
                    var things = iot.things("NotATest");

                    assert.strictEqual(things.length, 0);
                });
            });
             */
        });
    });
});
