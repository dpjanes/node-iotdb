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
var bridge = require("../bridge");

require('./instrument/iotdb');

describe('test_reset', function() {
    describe('iotdb', function() {
        it("exists", function() {
            iotdb.reset();
        });
        it("it will create a new object", function() {
            const iot_1 = iotdb.iot();
            iot_1.__A = 1

            iotdb.reset();

            const iot_2 = iotdb.iot();

            assert.ok(iot_1.__A);
            assert.ok(!iot_2.__A);
        });
        it("edge case if statement", function() {
            iotdb.reset();
            iotdb.reset();
        });
    });
    describe("modules", function() {
        it("exists", function() {
            modules.reset();
        });
        it("it will create new object", function() {
            const m_1 = modules.instance();
            m_1.__A = 1;

            modules.reset();

            const m_2 = modules.instance();

            assert.ok(m_1.__A);
            assert.ok(!m_2.__A);

        });
    });
    describe("bridge", function() {
        it("exists", function() {
            const b = new bridge.Bridge();
            b.reset();
        });
    });
    describe("thing_manager", function() {
        it("exists", function() {
            const tm = thing_manager.make();
            tm.reset();
        });

        it("actually resets", function(done) {
            const tm = thing_manager.make();
            tm.connect("Test");
            tm.on("thing", function() {
                assert.ok(tm.things().count());
                tm.reset();
                assert.strictEqual(tm.things().count(), 0);
                done();
            });
        });

        it("resets bridge", function(done) {
            const tm = thing_manager.make();
            tm.connect("Test");
            tm.on("thing", function() {
                assert.ok(tm.things().count());
                const thing = tm.things().any();
                assert.ok(thing);
                assert.ok(thing.__bridge);

                const bridge = thing.__bridge;
                assert.ok(bridge);

                bridge._reset_reset();
                assert.strictEqual(bridge._reset_count(), 0);

                tm.reset();
                assert.ok(bridge.__reset);
                assert.strictEqual(bridge._reset_count(), 2); // exemplar + instance

                done();
            });
        });
    });
    describe("settings", function() {
        it("exists", function() {
            settings.reset();
        });
        it("it will create new object", function() {
            const s_1 = settings.instance();
            s_1.__A = 1;

            settings.reset();

            const s_2 = settings.instance();

            assert.ok(s_1.__A);
            assert.ok(!s_2.__A);

        });
        it("nothing sticks around", function() {
            const s_1 = settings.instance();
            s_1.set("/a/b", 1);

            settings.reset();

            const s_2 = settings.instance();

            assert.ok(s_1.get("/a/b"));
            assert.ok(!s_2.get("/a/b"));

        });
    });
});
