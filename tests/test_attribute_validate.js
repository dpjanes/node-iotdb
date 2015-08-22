/*
 *  test_attribute_validate.js
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
describe('test_attribute_validate:', function(){
  describe('boolean->', function(){
      describe('->boolean', function(){
        it('return true or false as appropriate', function(){
            var a = attribute.make_boolean("value").reading()
            /* simple converion */
            assert.strictEqual(false, wrap_validate(a, false));
            assert.strictEqual(true, wrap_validate(a, true));
        })
      })
      describe('->integer', function(){
        it('return 0 or 1 as appropriate', function(){
            var a = attribute.make_integer("value").reading()
            assert.strictEqual(0, wrap_validate(a, false));
            assert.strictEqual(1, wrap_validate(a, true));
        })
      })
      describe('->number', function(){
        it('return 0 or 1 as appropriate', function(){
            var a = attribute.make_integer("value").reading()
            assert.strictEqual(0, wrap_validate(a, false));
            assert.strictEqual(1, wrap_validate(a, true));
        })
      })
      describe('->string', function(){
        it('return true or false as appropriate', function(){
            var a = attribute.make_string("value").reading()
            assert.strictEqual("0", wrap_validate(a, false));
            assert.strictEqual("1", wrap_validate(a, true));
        })
      })
    })
  describe('integer->', function(){
      describe('->boolean', function(){
        it('return true or false as appropriate', function(){
            var a = attribute.make_boolean("value").reading()
            assert.strictEqual(false, wrap_validate(a, 0));
            assert.strictEqual(true, wrap_validate(a, 1));
            assert.strictEqual(true, wrap_validate(a, -1));
            assert.strictEqual(true, wrap_validate(a, -99));
            assert.strictEqual(true, wrap_validate(a, 99));
        })
      })
      describe('->integer', function(){
        it('return same number', function(){
            var a = attribute.make_integer("value").reading()
            assert.strictEqual(0, wrap_validate(a, 0));
            assert.strictEqual(1, wrap_validate(a, 1));
            assert.strictEqual(-1, wrap_validate(a, -1));
            assert.strictEqual(-99, wrap_validate(a, -99));
            assert.strictEqual(99, wrap_validate(a, 99));
        })
      })
      describe('->number', function(){
        it('return same number', function(){
            var a = attribute.make_number("value").reading()
            assert.strictEqual(0, wrap_validate(a, 0));
            assert.strictEqual(1, wrap_validate(a, 1));
            assert.strictEqual(-1, wrap_validate(a, -1));
            assert.strictEqual(-99, wrap_validate(a, -99));
            assert.strictEqual(99, wrap_validate(a, 99));
        })
      })
      describe('->string', function(){
        it('return true or false as appropriate', function(){
            var a = attribute.make_string("value").reading()
            assert.strictEqual("0", wrap_validate(a, 0));
            assert.strictEqual("1", wrap_validate(a, 1));
            assert.strictEqual("-1", wrap_validate(a, -1));
            assert.strictEqual("-99", wrap_validate(a, -99));
            assert.strictEqual("99", wrap_validate(a, 99));
        })
      })
    })
  describe('number->', function(){
      describe('->boolean', function(){
        it('return true or false as appropriate', function(){
            var a = attribute.make_boolean("value").reading()
            assert.strictEqual(false, wrap_validate(a, 0.0));
            assert.strictEqual(true, wrap_validate(a, 1.0));
            assert.strictEqual(true, wrap_validate(a, -1.0));
            assert.strictEqual(true, wrap_validate(a, -99.0));
            assert.strictEqual(true, wrap_validate(a, 99.0));

            assert.strictEqual(true, wrap_validate(a, ".9"));
            assert.strictEqual(true, wrap_validate(a, ".5"));
            assert.strictEqual(true, wrap_validate(a, ".4999"));

            assert.strictEqual(true, wrap_validate(a, "100.49"));
            assert.strictEqual(true, wrap_validate(a, "100.01"));
            assert.strictEqual(true, wrap_validate(a, "99.9"));
            assert.strictEqual(true, wrap_validate(a, "99.5"));
            assert.strictEqual(true, wrap_validate(a, "99.499"));
        })
      })
      describe('->integer', function(){
        it('return same number', function(){
            var a = attribute.make_integer("value").reading()
            assert.strictEqual(0, wrap_validate(a, 0.0));
            assert.strictEqual(1, wrap_validate(a, 1.0));
            assert.strictEqual(-1, wrap_validate(a, -1.0));
            assert.strictEqual(-99, wrap_validate(a, -99.0));
            assert.strictEqual(99, wrap_validate(a, 99.0));

            assert.strictEqual(1, wrap_validate(a, ".9"));
            assert.strictEqual(1, wrap_validate(a, ".5"));
            assert.strictEqual(0, wrap_validate(a, ".4999"));

            assert.strictEqual(100, wrap_validate(a, "100.49"));
            assert.strictEqual(100, wrap_validate(a, "100.01"));
            assert.strictEqual(100, wrap_validate(a, "99.9"));
            assert.strictEqual(100, wrap_validate(a, "99.5"));
            assert.strictEqual(99, wrap_validate(a, "99.499"));
        })
      })
      describe('->number', function(){
        it('return same number', function(){
            var a = attribute.make_number("value").reading()
            assert.strictEqual(0.0, wrap_validate(a, 0.0));
            assert.strictEqual(1.0, wrap_validate(a, 1.0));
            assert.strictEqual(-1.0, wrap_validate(a, -1.0));
            assert.strictEqual(-99.0, wrap_validate(a, -99.0));
            assert.strictEqual(99.0, wrap_validate(a, 99.0));

            assert.strictEqual(.9, wrap_validate(a, ".9"));
            assert.strictEqual(.5, wrap_validate(a, ".5"));
            assert.strictEqual(.4999, wrap_validate(a, ".4999"));

            assert.strictEqual(100.49, wrap_validate(a, "100.49"));
            assert.strictEqual(100.01, wrap_validate(a, "100.01"));
            assert.strictEqual(99.9, wrap_validate(a, "99.9"));
            assert.strictEqual(99.5, wrap_validate(a, "99.5"));
            assert.strictEqual(99.499, wrap_validate(a, "99.499"));
        })
      })
      describe('->string', function(){
        it('return true or false as appropriate', function(){
            var a = attribute.make_string("value").reading()
            assert.strictEqual("0", wrap_validate(a, 0.0));
            assert.strictEqual("1", wrap_validate(a, 1.0));
            assert.strictEqual("-1", wrap_validate(a, -1.0));
            assert.strictEqual("-99", wrap_validate(a, -99.0));
            assert.strictEqual("99", wrap_validate(a, 99.0));

            assert.strictEqual(".9", wrap_validate(a, ".9"));
            assert.strictEqual(".5", wrap_validate(a, ".5"));
            assert.strictEqual(".4999", wrap_validate(a, ".4999"));

            assert.strictEqual("100.49", wrap_validate(a, "100.49"));
            assert.strictEqual("100.01", wrap_validate(a, "100.01"));
            assert.strictEqual("99.9", wrap_validate(a, "99.9"));
            assert.strictEqual("99.5", wrap_validate(a, "99.5"));
            assert.strictEqual("99.499", wrap_validate(a, "99.499"));
        })
      })
    })
  describe('string->', function(){
      describe('->boolean', function(){
        it('return true or false as appropriate', function(){
            var a = attribute.make_boolean("value").reading()
            assert.strictEqual(false, wrap_validate(a, ""));
            assert.strictEqual(false, wrap_validate(a, "off"));
            assert.strictEqual(false, wrap_validate(a, "false"));
            assert.strictEqual(false, wrap_validate(a, "no"));
            assert.strictEqual(true, wrap_validate(a, "yes"));
            assert.strictEqual(true, wrap_validate(a, "on"));
            assert.strictEqual(true, wrap_validate(a, "true"));
            assert.strictEqual(true, wrap_validate(a, "any string really"));
        })
      })
      describe('->integer', function(){
        it('return same number or rounded as needed', function(){
            var a = attribute.make_integer("value").reading()
            assert.strictEqual(0, wrap_validate(a, "0"));
            assert.strictEqual(1, wrap_validate(a, "1"));
            assert.strictEqual(-1, wrap_validate(a, "-1"));
            assert.strictEqual(-99, wrap_validate(a, "-99"));
            assert.strictEqual(99, wrap_validate(a, "99"));

            assert.strictEqual(1, wrap_validate(a, ".9"));
            assert.strictEqual(1, wrap_validate(a, ".5"));
            assert.strictEqual(0, wrap_validate(a, ".4999"));

            assert.strictEqual(100, wrap_validate(a, "100.49"));
            assert.strictEqual(100, wrap_validate(a, "100.01"));
            assert.strictEqual(100, wrap_validate(a, "99.9"));
            assert.strictEqual(100, wrap_validate(a, "99.5"));
            assert.strictEqual(99, wrap_validate(a, "99.499"));

            assert.strictEqual(undefined, wrap_validate(a, ""));
            assert.strictEqual(undefined, wrap_validate(a, "off"));
            assert.strictEqual(undefined, wrap_validate(a, "false"));
            assert.strictEqual(undefined, wrap_validate(a, "no"));
            assert.strictEqual(undefined, wrap_validate(a, "yes"));
            assert.strictEqual(undefined, wrap_validate(a, "on"));
            assert.strictEqual(undefined, wrap_validate(a, "true"));
            assert.strictEqual(undefined, wrap_validate(a, "any string really"));
        })
      })
      describe('->number', function(){
        it('return same number', function(){
            var a = attribute.make_number("value").reading()
            assert.strictEqual(0, wrap_validate(a, "0"));
            assert.strictEqual(1, wrap_validate(a, "1"));
            assert.strictEqual(-1, wrap_validate(a, "-1"));
            assert.strictEqual(-99, wrap_validate(a, "-99"));
            assert.strictEqual(99, wrap_validate(a, "99"));

            assert.strictEqual(.9, wrap_validate(a, ".9"));
            assert.strictEqual(.5, wrap_validate(a, ".5"));
            assert.strictEqual(.4999, wrap_validate(a, ".4999"));

            assert.strictEqual(100.49, wrap_validate(a, "100.49"));
            assert.strictEqual(100.01, wrap_validate(a, "100.01"));
            assert.strictEqual(99.9, wrap_validate(a, "99.9"));
            assert.strictEqual(99.5, wrap_validate(a, "99.5"));
            assert.strictEqual(99.499, wrap_validate(a, "99.499"));

            assert.strictEqual(undefined, wrap_validate(a, ""));
            assert.strictEqual(undefined, wrap_validate(a, "off"));
            assert.strictEqual(undefined, wrap_validate(a, "false"));
            assert.strictEqual(undefined, wrap_validate(a, "no"));
            assert.strictEqual(undefined, wrap_validate(a, "yes"));
            assert.strictEqual(undefined, wrap_validate(a, "on"));
            assert.strictEqual(undefined, wrap_validate(a, "true"));
            assert.strictEqual(undefined, wrap_validate(a, "any string really"));
        })
      })
      describe('->string', function(){
        it('return true or false as appropriate', function(){
            var a = attribute.make_string("value").reading()
            assert.strictEqual("0", wrap_validate(a, "0"));
            assert.strictEqual("1", wrap_validate(a, "1"));
            assert.strictEqual("-1", wrap_validate(a, "-1"));
            assert.strictEqual("-99", wrap_validate(a, "-99"));
            assert.strictEqual("99", wrap_validate(a, "99"));

            assert.strictEqual(".9", wrap_validate(a, ".9"));
            assert.strictEqual(".5", wrap_validate(a, ".5"));
            assert.strictEqual(".4999", wrap_validate(a, ".4999"));

            assert.strictEqual("100.49", wrap_validate(a, "100.49"));
            assert.strictEqual("100.01", wrap_validate(a, "100.01"));
            assert.strictEqual("99.9", wrap_validate(a, "99.9"));
            assert.strictEqual("99.5", wrap_validate(a, "99.5"));
            assert.strictEqual("99.499", wrap_validate(a, "99.499"));

            assert.strictEqual("", wrap_validate(a, ""));
            assert.strictEqual("off", wrap_validate(a, "off"));
            assert.strictEqual("false", wrap_validate(a, "false"));
            assert.strictEqual("no", wrap_validate(a, "no"));
            assert.strictEqual("yes", wrap_validate(a, "yes"));
            assert.strictEqual("on", wrap_validate(a, "on"));
            assert.strictEqual("true", wrap_validate(a, "true"));
            assert.strictEqual("any string really", wrap_validate(a, "any string really"));
        })
      })
    })
})
