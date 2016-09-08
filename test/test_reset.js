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

describe('test_reset', function() {
    describe('presence of functions', function() {
        it("iotdb", function() {
            iotdb.reset();
        });
        it("modules", function() {
            modules.reset();
        });
        it("thing_manager", function() {
            const tm = thing_manager.make();
            tm.reset();
        });
        it("settings", function() {
            settings.reset();
        });
    });
});
