/*
 *  test_iotdb_connect.js
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
var keystore = require("../keystore");

require('./instrument/iotdb');

describe('test_connect', function() {
    describe('connect', function() {
        describe('globals', function() {
            it('no arguments', function() {
                iotdb.instance = null;
                var things = iotdb.connect();

                assert.strictEqual(things.count(), 0);
            });
            it('valid model code argument', function(done) {
                iotdb.instance = null;
                var things = iotdb.connect("Test");

                things.on("thing", function() {
                    assert.strictEqual(things.count(), 1);
                    done();
                });
            });
            it('invalid model code argument', function() {
                iotdb.instance = null;
                var things = iotdb.connect("NotATest");

                assert.strictEqual(things.count(), 0);
            });
        });
        describe('clean setup', function() {
            it('no arguments', function() {
                var iot = new iotdb.IOT()
                var things = iot.connect();

                assert.strictEqual(things.count(), 0);
            });
            it('valid model code argument', function(done) {
                var iot = new iotdb.IOT()
                var things = iot.connect("Test");

                things.on("thing", function() {
                    assert.strictEqual(things.count(), 1);
                    done();
                });
            });
            it('invalid model code argument', function() {
                var iot = new iotdb.IOT()
                var things = iot.connect("NotATest");

                assert.strictEqual(things.count(), 0);
            });
        });
    });
});
