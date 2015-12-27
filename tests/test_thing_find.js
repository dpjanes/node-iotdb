/*
 *  test_thing_find.js
 *
 *  David Janes
 *  IOTDB
 *  2015-12-27
 *
 *  Test the "find" function
 */

"use strict";

var assert = require("assert")
var attribute = require("../attribute")
var model = require("../model")
var _ = require("../helpers")
var constants = require("../constants")

var T = model.make_model('T')
    .attribute(
        attribute.make_boolean('on')
            .property_value("iot:read", true)
            .property_value("iot:write", true)
            .property_value("iot:actuator", true)
            .code("actuator")
    )
    .attribute(
        attribute.make_boolean('on')
            .property_value("iot:read", true)
            .property_value("iot:sensor", true)
            .code("sensor")
    )
    .make();

/* --- tests --- */
describe('test_thing_find', function(){
    describe('semantic:', function(){
        it('default', function() {
            var t = new T();
            var rd = t.find(":on");
            assert.strictEqual(rd.attribute.code(), "sensor");
            assert.ok(rd.attribute.is_sensor());
            assert.ok(!rd.attribute.is_actuator());
        });
        it('get', function() {
            var t = new T();
            var rd = t.find(":on", { mode: "get", });
            assert.strictEqual(rd.attribute.code(), "sensor");
            assert.ok(rd.attribute.is_sensor());
            assert.ok(!rd.attribute.is_actuator());
        });
        it('on', function() {
            var t = new T();
            var rd = t.find(":on", { mode: "on", });
            assert.strictEqual(rd.attribute.code(), "sensor");
            assert.ok(rd.attribute.is_sensor());
            assert.ok(!rd.attribute.is_actuator());
        });
        it('set', function() {
            var t = new T();
            var rd = t.find(":on", { mode: "set", });
            assert.strictEqual(rd.attribute.code(), "actuator");
            assert.ok(!rd.attribute.is_sensor());
            assert.ok(rd.attribute.is_actuator());
        });
        it('bad', function() {
            var t = new T();
            var rd = t.find(":nothing");
            assert.strictEqual(rd, undefined);
        });
    });
})
