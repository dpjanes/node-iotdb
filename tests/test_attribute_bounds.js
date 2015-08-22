/*
 *  test_attribute_bounds.js
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
var iot_js_boolean = _.ld.expand("iot:type.boolean");
var iot_js_integer = _.ld.expand("iot:type.integer");
var iot_js_number = _.ld.expand("iot:type.number");
var iot_js_string = _.ld.expand("iot:type.string");

var iot_js_type = _.ld.expand("iot:type");

var iot_js_minimum = _.ld.expand("iot:minimum");
var iot_js_maximum = _.ld.expand("iot:maximum");

var wrap_validate = function(a, value) {
    var paramd = {
        value: value
    }
    a.validate(paramd)
    return paramd.value
}

/* --- tests --- */
describe('test_attribute_bounds:', function(){
  describe('underlying', function(){
    it('test bounds', function(){
        var a = new attribute.Attribute();
        assert.strictEqual(1.5, a._bounded(-1, 1.5, 5.5))
        assert.strictEqual(1.5, a._bounded(0, 1.5, 5.5))
        assert.strictEqual(1.5, a._bounded(1.5, 1.5, 5.5))
        assert.strictEqual(2.5, a._bounded(2.5, 1.5, 5.5))
        assert.strictEqual(5.5, a._bounded(5.5, 1.5, 5.5))
        assert.strictEqual(5.5, a._bounded(6, 1.5, 5.5))
        assert.strictEqual(5.5, a._bounded(99, 1.5, 5.5))
    });
  });
  describe('boolean', function(){
    it('test bounds', function(){
        var a = attribute.make_boolean("value").reading()
            .minimum(10)
            .maximum(20)
        // no effect
        assert.strictEqual(true, wrap_validate(a, true));
        assert.strictEqual(false, wrap_validate(a, false));
    });
  });
  describe('integer', function(){
    it('test bounds', function(){
        var a = attribute.make_integer("value").reading()
            .minimum(10)
            .maximum(20)
        assert.strictEqual(10, wrap_validate(a, 0));
        assert.strictEqual(10, wrap_validate(a, 9));
        assert.strictEqual(10, wrap_validate(a, 10));
        assert.strictEqual(15, wrap_validate(a, 15));
        assert.strictEqual(20, wrap_validate(a, 20));
        assert.strictEqual(20, wrap_validate(a, 25));
    });
  });
  describe('number', function(){
    it('test bounds', function(){
        var a = attribute.make_number("value").reading()
            .minimum(1.0)
            .maximum(2.0)
        assert.strictEqual(1.0, wrap_validate(a, 0));
        assert.strictEqual(1.0, wrap_validate(a, .9));
        assert.strictEqual(1.0, wrap_validate(a, 1.0));
        assert.strictEqual(1.5, wrap_validate(a, 1.5));
        assert.strictEqual(2.0, wrap_validate(a, 2.0));
        assert.strictEqual(2.0, wrap_validate(a, 2.5));
    });
  });
  describe('string', function(){
    it('test bounds', function(){
        var a = attribute.make_string("value").reading()
            .minimum(1.0)
            .maximum(2.0)
        assert.strictEqual("", wrap_validate(a, ""));
        assert.strictEqual("now is the time", wrap_validate(a, "now is the time"));
    });
  });
})
