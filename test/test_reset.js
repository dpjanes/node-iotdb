/*
 *  test_reset.js
 *
 *  David Janes
 *  IOTDB
 *  2016-09-08
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var iotdb = require("../iotdb");
var modules = require("../modules");
var settings = require("../settings");
var thing_manager = require("../thing_manager");

require('./instrument/iotdb');

describe('test_reset', function() {
    describe('iotdb', function() {
        it("exists", function() {
            iotdb.reset();
        });
        it("removes existing thing", function() {
            const iot_1 = iotdb.iot();
            iot_1.__A = 1

            iotdb.reset();

            const iot_2 = iotdb.iot();

            assert.ok(iot_1.__A);
            assert.ok(!iot_2.__A);
        });
        it("edge case if statement", function() {
            const iot_1 = iotdb.iot();
            iot_1.__A = 1

            iotdb.reset();
            iotdb.reset();
        });
    });
    describe("modules", function() {
        it("exists", function() {
            modules.reset();
        });
        it("there are modules", function() {
            const m = modules.instance();
            const bindings = m.bindings();
            console.log(bindings.length);

            modules.reset();
        });
    });
    describe("thing_manager", function() {
        it("exists", function() {
            const tm = thing_manager.make();
            tm.reset();
        });
    });
    describe("settings", function() {
        it("exists", function() {
            settings.reset();
        });
    });
});
