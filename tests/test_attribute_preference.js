/*
 *  test_attribute_preference.js
 *
 *  David Janes
 *  IOTDB
 *  2013-12-28
 *
 *  Test attribute conversions preferences
 */

"use strict";

var assert = require("assert")
var attribute = require("./instrument/attribute")
var _ = require("../helpers")
var constants = require("../constants")

/* --- tests --- */
describe('test_attribute_preference:', function(){
  describe('boolean', function(){
    it('conversion where there are choices', function(){
        var a = new attribute.Attribute();
        assert.strictEqual(true, a._convert(true, [ constants.iot_boolean, constants.iot_integer ]))
        assert.strictEqual(true, a._convert(true, [ constants.iot_boolean, constants.iot_number ]))
        assert.strictEqual(true, a._convert(true, [ constants.iot_boolean, constants.iot_string ]))

        assert.strictEqual(1, a._convert(true, [ constants.iot_integer, constants.iot_number ]))
        assert.strictEqual(1, a._convert(true, [ constants.iot_integer, constants.iot_string ]))
        assert.strictEqual(1, a._convert(true, [ constants.iot_number, constants.iot_string ]))
    });
  });
  describe('integer', function(){
    it('conversion where there are choices', function(){
        var a = new attribute.Attribute();
        assert.strictEqual(true, a._convert(3, [ constants.iot_boolean, constants.iot_integer ]))
        assert.strictEqual(true, a._convert(3, [ constants.iot_boolean, constants.iot_number ]))
        assert.strictEqual(true, a._convert(3, [ constants.iot_boolean, constants.iot_string ]))

        assert.strictEqual(3, a._convert(3, [ constants.iot_integer, constants.iot_number ]))
        assert.strictEqual(3, a._convert(3, [ constants.iot_integer, constants.iot_string ]))
        assert.strictEqual(3, a._convert(3, [ constants.iot_number, constants.iot_string ]))
    });
  });
  describe('number', function(){
    it('conversion where there are choices', function(){
        var a = new attribute.Attribute();
        assert.strictEqual(true, a._convert(3.14, [ constants.iot_boolean, constants.iot_integer ]))
        assert.strictEqual(true, a._convert(3.14, [ constants.iot_boolean, constants.iot_number ]))
        assert.strictEqual(true, a._convert(3.14, [ constants.iot_boolean, constants.iot_string ]))

        assert.strictEqual(3.14, a._convert(3.14, [ constants.iot_integer, constants.iot_number ]))
        assert.strictEqual(3, a._convert(3.14, [ constants.iot_integer, constants.iot_string ]))
        assert.strictEqual(3.14, a._convert(3.14, [ constants.iot_number, constants.iot_string ]))
    });
  });
  describe('number', function(){
    it('conversion where there are choices', function(){
        var a = new attribute.Attribute();
        assert.strictEqual(true, a._convert("on", [ constants.iot_boolean, constants.iot_integer ]))
        assert.strictEqual(true, a._convert("on", [ constants.iot_boolean, constants.iot_number ]))
        assert.strictEqual("on", a._convert("on", [ constants.iot_boolean, constants.iot_string ]))

        assert.ok(isNaN(a._convert("on", [ constants.iot_integer, constants.iot_number ])))
        assert.strictEqual("on", a._convert("on", [ constants.iot_integer, constants.iot_string ]))
        assert.strictEqual("on", a._convert("on", [ constants.iot_number, constants.iot_string ]))
    });
  });
})
