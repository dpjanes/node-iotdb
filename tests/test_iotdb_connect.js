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
var things = require("../things");
var keystore = require("../keystore");

require('./instrument/iotdb');

describe('test_connect', function() {
    describe('connect', function() {
        describe('clean setup', function() {
            it('no arguments', function() {
                var iot = new iotdb.IOT()
                var things = iot.connect();

                assert.strictEqual(things.length, 0);
            });
            it('valid model code argument', function(done) {
                var iot = new iotdb.IOT()
                var things = iot.connect("Test");

                things.on("thing", function() {
                    assert.strictEqual(things.length, 1);
                    done();
                });
            });
            it('invalid model code argument', function() {
                var iot = new iotdb.IOT()
                var things = iot.connect("NotATest");

                assert.strictEqual(things.length, 0);
            });
        });
    });
});
