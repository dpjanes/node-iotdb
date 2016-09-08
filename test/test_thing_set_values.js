/*
 *  test_thing_set_values.js
 *
 *  David Janes
 *  IOTDB
 *  2016-09-08
 */

"use strict";

const assert = require("assert")
const _ = require("../helpers")

const iotdb = require("../iotdb");
const thing_manager = require("../thing_manager");
const thing_set = require("../thing_set");

require('./instrument/iotdb');

const _make_a_thing = function(callback) {
    const t = thing_manager.make();
    t.reset();
    
    const ts = t.connect("Test", {}, {
        "schema:name": "The Thing Name",
        "schema:description": "My Thing",
        "iot:thing-number": 32,
    });
    ts.on("thing", function() {
        callback(ts.any());
    });
};

describe("test_thing_set_values", function() {
    describe("connection", function() {
        it("has controller values", function(done) {
            _make_a_thing(function(thing) {
                const connection = thing.state("connection");
                const controller = iotdb.controller_meta();

                assert.ok(_.d.is.superset(connection, controller));
                done();
            });
        });
        it("has iot:reachable", function(done) {
            _make_a_thing(function(thing) {
                const connection = thing.state("connection");

                assert.ok(connection["iot:reachable"])
                done();
            });
        });
    });
});
