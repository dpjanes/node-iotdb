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
var attribute = require("../attribute")
var _ = require("../helpers")

/* --- constants --- */
var iot_js_boolean = _.expand("iot-js:boolean");
var iot_js_integer = _.expand("iot-js:integer");
var iot_js_number = _.expand("iot-js:number");
var iot_js_string = _.expand("iot-js:string");

var iot_js_type = _.expand("iot-js:type");

var iot_js_minimum = _.expand("iot-js:minimum");
var iot_js_maximum = _.expand("iot-js:maximum");

/* --- tests --- */
describe('test_attribute_preference:', function(){
  describe('boolean', function(){
    it('conversion where there are choices', function(){
        var a = new attribute.Attribute();
        assert.strictEqual(true, a._convert(true, [ iot_js_boolean, iot_js_integer ]))
        assert.strictEqual(true, a._convert(true, [ iot_js_boolean, iot_js_number ]))
        assert.strictEqual(true, a._convert(true, [ iot_js_boolean, iot_js_string ]))

        assert.strictEqual(1, a._convert(true, [ iot_js_integer, iot_js_number ]))
        assert.strictEqual(1, a._convert(true, [ iot_js_integer, iot_js_string ]))
        assert.strictEqual(1, a._convert(true, [ iot_js_number, iot_js_string ]))
    });
  });
  describe('integer', function(){
    it('conversion where there are choices', function(){
        var a = new attribute.Attribute();
        assert.strictEqual(true, a._convert(3, [ iot_js_boolean, iot_js_integer ]))
        assert.strictEqual(true, a._convert(3, [ iot_js_boolean, iot_js_number ]))
        assert.strictEqual(true, a._convert(3, [ iot_js_boolean, iot_js_string ]))

        assert.strictEqual(3, a._convert(3, [ iot_js_integer, iot_js_number ]))
        assert.strictEqual(3, a._convert(3, [ iot_js_integer, iot_js_string ]))
        assert.strictEqual(3, a._convert(3, [ iot_js_number, iot_js_string ]))
    });
  });
  describe('number', function(){
    it('conversion where there are choices', function(){
        var a = new attribute.Attribute();
        assert.strictEqual(true, a._convert(3.14, [ iot_js_boolean, iot_js_integer ]))
        assert.strictEqual(true, a._convert(3.14, [ iot_js_boolean, iot_js_number ]))
        assert.strictEqual(true, a._convert(3.14, [ iot_js_boolean, iot_js_string ]))

        assert.strictEqual(3.14, a._convert(3.14, [ iot_js_integer, iot_js_number ]))
        assert.strictEqual(3, a._convert(3.14, [ iot_js_integer, iot_js_string ]))
        assert.strictEqual(3.14, a._convert(3.14, [ iot_js_number, iot_js_string ]))
    });
  });
  describe('number', function(){
    it('conversion where there are choices', function(){
        var a = new attribute.Attribute();
        assert.strictEqual(true, a._convert("on", [ iot_js_boolean, iot_js_integer ]))
        assert.strictEqual(true, a._convert("on", [ iot_js_boolean, iot_js_number ]))
        assert.strictEqual("on", a._convert("on", [ iot_js_boolean, iot_js_string ]))

        assert.ok(isNaN(a._convert("on", [ iot_js_integer, iot_js_number ])))
        assert.strictEqual("on", a._convert("on", [ iot_js_integer, iot_js_string ]))
        assert.strictEqual("on", a._convert("on", [ iot_js_number, iot_js_string ]))
    });
  });
})
