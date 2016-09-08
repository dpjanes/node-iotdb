/*
 *  test_thing_set_connect.js
 *
 *  David Janes
 *  IOTDB
 *  2016-07-15
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var iotdb = require("../iotdb");
var thing_manager = require("../thing_manager");
var thing_set = require("../thing_set");

require('./instrument/iotdb');

describe("test_thing_set_connect", function() {
    describe("creation", function() {
        it("from empty thing_set", function(done) {
            const ts_1 = thing_set.make();
            assert.ok(ts_1.empty());

            const ts_2 = ts_1.connect("Test", {}, { "schema:name": "A", });
            ts_2.on("thing", function() {
                assert.ok(ts_2.count(), 1);
                done();
            });
        });
        it("from non-empty thing_set", function(done) {
            var tm = thing_manager.make();
            tm.reset();
            
            var ts_1 = tm.connect("Test", { number: 1 }, { "schema:name": "A" });
            ts_1.once("thing", function(thing) {
                const ts_2 = ts_1.connect("Test", { number: 2}, { "schema:name": "B", });
                ts_2.on("thing", function() {
                    assert.ok(ts_2.count(), 2);
                    done();
                });
            });
        });
    });
});
