/*
 *  test_thing_set_search_dynamic.js
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

describe("test_thing_set_search_dynamic", function() {
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

            console.log("ss._sid", ss._sid);
            console.log("ts._sid", ts._sid);

            console.log("HERE:A.1");
            const zs = ts.connect("Test", {}, { "schema:name": "A", });
            ts.on("thing", function(thing) {
                assert.strictEqual(ss.count(), 0);
                console.log("HERE:B.1", thing.name());
                thing.update("meta", { "schema:name": "B" });
                console.log("HERE:B.2", thing.name());

                ss.on("thing", function() {
                    console.log("DONE");
                    assert.strictEqual(ss.count(), 1);
                    done();
                });
            });
        });
        it("thing gets removed after name change", function(done) {
            const tm = thing_manager.make();
            const ts = thing_set.make(tm);
            assert.ok(ts.empty());

            const ss = ts.search({
                "meta:schema:name": "A",
            });

            console.log("BEFORE CONNECT");
            ts.connect("Test", {}, { "schema:name": "A", });
            console.log("AFTER CONNECT");
            ss.on("thing", function(thing) {
                console.log("IN", thing.thing_id());
                assert.strictEqual(ss.count(), 1);
                console.log("HERE:SET META", ss._sid);
                thing.update("meta", { "schema:name": "B" });

                ss.on("removed", function() {
                    assert.strictEqual(ss.count(), 0);
                    done();
                });
            });
        });
    });
});
