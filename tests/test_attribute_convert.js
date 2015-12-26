/*
 *  test_attribute_convert.js
 *
 *  David Janes
 *  IOTDB
 *  2013-12-28
 *
 *  Test attribute conversions
 */

"use strict";

var assert = require("assert")
var attribute = require("../attribute")
var _ = require("../helpers")
var constants = require("../constants")

/* --- tests --- */
describe('test_attribute_convert:', function(){
  describe('boolean->', function(){
      describe('->boolean', function(){
        it('return true or false as appropriate', function(){
            var a = new attribute.Attribute();
            /* simple converion */
            assert.strictEqual(false, a._convert(false, [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert(true, [ constants.iot_boolean ]))
        })
      })
      describe('->integer', function(){
        it('return 0 or 1 as appropriate', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(0, a._convert(false, [ constants.iot_integer ]))
            assert.strictEqual(1, a._convert(true, [ constants.iot_integer ]))
        })
        it('return 10 or 99 as appropriate', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(10, a._convert_boolean(false, [ constants.iot_integer ], 10, 99))
            assert.strictEqual(99, a._convert_boolean(true, [ constants.iot_integer ], 10, 99))
        })
      })
      describe('->number', function(){
        it('return 0 or 1 as appropriate', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(0, a._convert(false, [ constants.iot_integer ]))
            assert.strictEqual(1, a._convert(true, [ constants.iot_integer ]))
        })
        it('return -99.1 or 99.9 as appropriate', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(-99.1, a._convert_boolean(false, [ constants.iot_integer ], -99.1, 99.9))
            assert.strictEqual(99.9, a._convert_boolean(true, [ constants.iot_integer ], -99.1, 99.9))
        })
      })
      describe('->string', function(){
        it('return true or false as appropriate', function(){
            var a = new attribute.Attribute();
            assert.strictEqual("0", a._convert(false, [ constants.iot_string ]))
            assert.strictEqual("1", a._convert(true, [ constants.iot_string ]))
        })
      })
    })
  describe('integer->', function(){
      describe('->boolean', function(){
        it('return true or false as appropriate', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(false, a._convert(0, [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert(1, [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert(-1, [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert(-99, [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert(99, [ constants.iot_boolean ]))
        })
      })
      describe('->integer', function(){
        it('return same number', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(0, a._convert(0, [ constants.iot_integer ]))
            assert.strictEqual(1, a._convert(1, [ constants.iot_integer ]))
            assert.strictEqual(-1, a._convert(-1, [ constants.iot_integer ]))
            assert.strictEqual(-99, a._convert(-99, [ constants.iot_integer ]))
            assert.strictEqual(99, a._convert(99, [ constants.iot_integer ]))
        })
      })
      describe('->number', function(){
        it('return same number', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(0, a._convert(0, [ constants.iot_number ]))
            assert.strictEqual(1, a._convert(1, [ constants.iot_number ]))
            assert.strictEqual(-1, a._convert(-1, [ constants.iot_number ]))
            assert.strictEqual(-99, a._convert(-99, [ constants.iot_number ]))
            assert.strictEqual(99, a._convert(99, [ constants.iot_number ]))
        })
      })
      describe('->string', function(){
        it('return true or false as appropriate', function(){
            var a = new attribute.Attribute();
            assert.strictEqual("0", a._convert(0, [ constants.iot_string ]))
            assert.strictEqual("1", a._convert(1, [ constants.iot_string ]))
            assert.strictEqual("-1", a._convert(-1, [ constants.iot_string ]))
            assert.strictEqual("-99", a._convert(-99, [ constants.iot_string ]))
            assert.strictEqual("99", a._convert(99, [ constants.iot_string ]))
        })
      })
    })
  describe('number->', function(){
      describe('->boolean', function(){
        it('return true or false as appropriate', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(false, a._convert(0.0, [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert(1.0, [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert(-1.0, [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert(-99.0, [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert(99.0, [ constants.iot_boolean ]))

            assert.strictEqual(true, a._convert(".9", [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert(".5", [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert(".4999", [ constants.iot_boolean ]))

            assert.strictEqual(true, a._convert("100.49", [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert("100.01", [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert("99.9", [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert("99.5", [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert("99.499", [ constants.iot_boolean ]))
        })
      })
      describe('->integer', function(){
        it('return same number', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(0, a._convert(0.0, [ constants.iot_integer ]))
            assert.strictEqual(1, a._convert(1.0, [ constants.iot_integer ]))
            assert.strictEqual(-1, a._convert(-1.0, [ constants.iot_integer ]))
            assert.strictEqual(-99, a._convert(-99.0, [ constants.iot_integer ]))
            assert.strictEqual(99, a._convert(99.0, [ constants.iot_integer ]))

            assert.strictEqual(1, a._convert(".9", [ constants.iot_integer ]))
            assert.strictEqual(1, a._convert(".5", [ constants.iot_integer ]))
            assert.strictEqual(0, a._convert(".4999", [ constants.iot_integer ]))

            assert.strictEqual(100, a._convert("100.49", [ constants.iot_integer ]))
            assert.strictEqual(100, a._convert("100.01", [ constants.iot_integer ]))
            assert.strictEqual(100, a._convert("99.9", [ constants.iot_integer ]))
            assert.strictEqual(100, a._convert("99.5", [ constants.iot_integer ]))
            assert.strictEqual(99, a._convert("99.499", [ constants.iot_integer ]))
        })
      })
      describe('->number', function(){
        it('return same number', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(0.0, a._convert(0.0, [ constants.iot_number ]))
            assert.strictEqual(1.0, a._convert(1.0, [ constants.iot_number ]))
            assert.strictEqual(-1.0, a._convert(-1.0, [ constants.iot_number ]))
            assert.strictEqual(-99.0, a._convert(-99.0, [ constants.iot_number ]))
            assert.strictEqual(99.0, a._convert(99.0, [ constants.iot_number ]))

            assert.strictEqual(.9, a._convert(".9", [ constants.iot_number ]))
            assert.strictEqual(.5, a._convert(".5", [ constants.iot_number ]))
            assert.strictEqual(.4999, a._convert(".4999", [ constants.iot_number ]))

            assert.strictEqual(100.49, a._convert("100.49", [ constants.iot_number ]))
            assert.strictEqual(100.01, a._convert("100.01", [ constants.iot_number ]))
            assert.strictEqual(99.9, a._convert("99.9", [ constants.iot_number ]))
            assert.strictEqual(99.5, a._convert("99.5", [ constants.iot_number ]))
            assert.strictEqual(99.499, a._convert("99.499", [ constants.iot_number ]))
        })
      })
      describe('->string', function(){
        it('return true or false as appropriate', function(){
            var a = new attribute.Attribute();
            assert.strictEqual("0", a._convert(0.0, [ constants.iot_string ]))
            assert.strictEqual("1", a._convert(1.0, [ constants.iot_string ]))
            assert.strictEqual("-1", a._convert(-1.0, [ constants.iot_string ]))
            assert.strictEqual("-99", a._convert(-99.0, [ constants.iot_string ]))
            assert.strictEqual("99", a._convert(99.0, [ constants.iot_string ]))

            assert.strictEqual(".9", a._convert(".9", [ constants.iot_string ]))
            assert.strictEqual(".5", a._convert(".5", [ constants.iot_string ]))
            assert.strictEqual(".4999", a._convert(".4999", [ constants.iot_string ]))

            assert.strictEqual("100.49", a._convert("100.49", [ constants.iot_string ]))
            assert.strictEqual("100.01", a._convert("100.01", [ constants.iot_string ]))
            assert.strictEqual("99.9", a._convert("99.9", [ constants.iot_string ]))
            assert.strictEqual("99.5", a._convert("99.5", [ constants.iot_string ]))
            assert.strictEqual("99.499", a._convert("99.499", [ constants.iot_string ]))
        })
      })
    })
  describe('string->', function(){
      describe('->boolean', function(){
        it('return true or false as appropriate', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(false, a._convert("", [ constants.iot_boolean ]))
            assert.strictEqual(false, a._convert("off", [ constants.iot_boolean ]))
            assert.strictEqual(false, a._convert("false", [ constants.iot_boolean ]))
            assert.strictEqual(false, a._convert("no", [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert("yes", [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert("on", [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert("true", [ constants.iot_boolean ]))
            assert.strictEqual(true, a._convert("any string really", [ constants.iot_boolean ]))
        })
      })
      describe('->integer', function(){
        it('return same number or rounded as needed', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(0, a._convert("0", [ constants.iot_integer ]))
            assert.strictEqual(1, a._convert("1", [ constants.iot_integer ]))
            assert.strictEqual(-1, a._convert("-1", [ constants.iot_integer ]))
            assert.strictEqual(-99, a._convert("-99", [ constants.iot_integer ]))
            assert.strictEqual(99, a._convert("99", [ constants.iot_integer ]))

            assert.strictEqual(1, a._convert(".9", [ constants.iot_integer ]))
            assert.strictEqual(1, a._convert(".5", [ constants.iot_integer ]))
            assert.strictEqual(0, a._convert(".4999", [ constants.iot_integer ]))

            assert.strictEqual(100, a._convert("100.49", [ constants.iot_integer ]))
            assert.strictEqual(100, a._convert("100.01", [ constants.iot_integer ]))
            assert.strictEqual(100, a._convert("99.9", [ constants.iot_integer ]))
            assert.strictEqual(100, a._convert("99.5", [ constants.iot_integer ]))
            assert.strictEqual(99, a._convert("99.499", [ constants.iot_integer ]))

            assert.ok(isNaN(a._convert("", [ constants.iot_integer ])))
            assert.ok(isNaN(a._convert("off", [ constants.iot_integer ])))
            assert.ok(isNaN(a._convert("false", [ constants.iot_integer ])))
            assert.ok(isNaN(a._convert("no", [ constants.iot_integer ])))
            assert.ok(isNaN(a._convert("yes", [ constants.iot_integer ])))
            assert.ok(isNaN(a._convert("on", [ constants.iot_integer ])))
            assert.ok(isNaN(a._convert("true", [ constants.iot_integer ])))
            assert.ok(isNaN(a._convert("any string really", [ constants.iot_integer ])))
        })
      })
      describe('->number', function(){
        it('return same number', function(){
            var a = new attribute.Attribute();
            assert.strictEqual(0, a._convert("0", [ constants.iot_number ]))
            assert.strictEqual(1, a._convert("1", [ constants.iot_number ]))
            assert.strictEqual(-1, a._convert("-1", [ constants.iot_number ]))
            assert.strictEqual(-99, a._convert("-99", [ constants.iot_number ]))
            assert.strictEqual(99, a._convert("99", [ constants.iot_number ]))

            assert.strictEqual(.9, a._convert(".9", [ constants.iot_number ]))
            assert.strictEqual(.5, a._convert(".5", [ constants.iot_number ]))
            assert.strictEqual(.4999, a._convert(".4999", [ constants.iot_number ]))

            assert.strictEqual(100.49, a._convert("100.49", [ constants.iot_number ]))
            assert.strictEqual(100.01, a._convert("100.01", [ constants.iot_number ]))
            assert.strictEqual(99.9, a._convert("99.9", [ constants.iot_number ]))
            assert.strictEqual(99.5, a._convert("99.5", [ constants.iot_number ]))
            assert.strictEqual(99.499, a._convert("99.499", [ constants.iot_number ]))

            assert.ok(isNaN(a._convert("", [ constants.iot_number ])))
            assert.ok(isNaN(a._convert("off", [ constants.iot_number ])))
            assert.ok(isNaN(a._convert("false", [ constants.iot_number ])))
            assert.ok(isNaN(a._convert("no", [ constants.iot_number ])))
            assert.ok(isNaN(a._convert("yes", [ constants.iot_number ])))
            assert.ok(isNaN(a._convert("on", [ constants.iot_number ])))
            assert.ok(isNaN(a._convert("true", [ constants.iot_number ])))
            assert.ok(isNaN(a._convert("any string really", [ constants.iot_number ])))
        })
      })
      describe('->string', function(){
        it('return true or false as appropriate', function(){
            var a = new attribute.Attribute();
            assert.strictEqual("0", a._convert("0", [ constants.iot_string ]))
            assert.strictEqual("1", a._convert("1", [ constants.iot_string ]))
            assert.strictEqual("-1", a._convert("-1", [ constants.iot_string ]))
            assert.strictEqual("-99", a._convert("-99", [ constants.iot_string ]))
            assert.strictEqual("99", a._convert("99", [ constants.iot_string ]))

            assert.strictEqual(".9", a._convert(".9", [ constants.iot_string ]))
            assert.strictEqual(".5", a._convert(".5", [ constants.iot_string ]))
            assert.strictEqual(".4999", a._convert(".4999", [ constants.iot_string ]))

            assert.strictEqual("100.49", a._convert("100.49", [ constants.iot_string ]))
            assert.strictEqual("100.01", a._convert("100.01", [ constants.iot_string ]))
            assert.strictEqual("99.9", a._convert("99.9", [ constants.iot_string ]))
            assert.strictEqual("99.5", a._convert("99.5", [ constants.iot_string ]))
            assert.strictEqual("99.499", a._convert("99.499", [ constants.iot_string ]))

            assert.strictEqual("", a._convert("", [ constants.iot_string ]))
            assert.strictEqual("off", a._convert("off", [ constants.iot_string ]))
            assert.strictEqual("false", a._convert("false", [ constants.iot_string ]))
            assert.strictEqual("no", a._convert("no", [ constants.iot_string ]))
            assert.strictEqual("yes", a._convert("yes", [ constants.iot_string ]))
            assert.strictEqual("on", a._convert("on", [ constants.iot_string ]))
            assert.strictEqual("true", a._convert("true", [ constants.iot_string ]))
            assert.strictEqual("any string really", a._convert("any string really", [ constants.iot_string ]))
        })
      })
    })
})
