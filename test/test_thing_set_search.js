/*
 *  test_thing_set_search.js
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

describe("test_thing_set_search", function() {
    describe("creation", function() {
        it("thing can be found after made", function(done) {
            const tm = thing_manager.make();
            const ts = thing_set.make(tm);
            assert.ok(ts.empty());

            ts.connect("Test", {}, { "schema:name": "A", });
            ts.on("thing", function() {
                const ss = ts.search({
                    "meta:schema:name": "A",
                });

                assert.strictEqual(ss.count(), 1);
                done();
            });
        });
        it("thing gets added after creation", function(done) {
            const tm = thing_manager.make();
            const ts = thing_set.make(tm);
            assert.ok(ts.empty());

            const ss = ts.search({
                "meta:schema:name": "A",
            });

            ts.connect("Test", {}, { "schema:name": "A", });
            ss.on("thing", function() {
                assert.strictEqual(ss.count(), 1);
                done();
            });
        });
    });
    describe("meta changes", function() {
        it("thing gets added after name change", function(done) {
            const tm = thing_manager.make();
            const ts = thing_set.make(tm);
            assert.ok(ts.empty());

            const ss = ts.search({
                "meta:schema:name": "B",
            });

            ts.connect("Test", {}, { "schema:name": "A", });
            ts.on("thing", function(thing) {
                thing.update("meta", { "schema:name": "B" });

                ss.on("thing", function() {
                    assert.strictEqual(ss.count(), 1);
                    done();
                });
            });
        });
    });
});
