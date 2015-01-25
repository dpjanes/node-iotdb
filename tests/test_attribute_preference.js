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
var iot_js_boolean = _.ld.expand("iot:boolean");
var iot_js_integer = _.ld.expand("iot:integer");
var iot_js_number = _.ld.expand("iot:number");
var iot_js_string = _.ld.expand("iot:string");

var iot_js_type = _.ld.expand("iot:type");

var iot_js_minimum = _.ld.expand("iot:minimum");
var iot_js_maximum = _.ld.expand("iot:maximum");

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
