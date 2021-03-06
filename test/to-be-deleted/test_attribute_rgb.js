/*
 *  test_attribute_rgb.js
 *
 *  David Janes
 *  IOTDB
 *  2014-02-14
 *
 *  Test RGB with attributes
 */

"use strict";

var assert = require("assert")
var iotdb = require("../iotdb")
var attribute = require("./instrument/attribute")
var model = require("../model")
var _ = require("../helpers")
var constants = require("../constants")

var wrap_validate = function(a, value, paramd) {
    if (paramd === undefined) {
        paramd = {}
    }
    paramd['value'] = value

    a.validate(paramd)
    return paramd.value
}

/* --- tests --- */
describe('test_attribute_rgb:', function(){
  describe('validate', function(){
    it('bad RGB - no otherwise', function(){
        var a = attribute.make_string("value").reading()
            .format("color")

        var x = wrap_validate(a, "a")
        assert.ok(x === undefined)

        var x = wrap_validate(a, "")
        assert.ok(x === undefined)

        var x = wrap_validate(a, "FF")
        assert.ok(x === undefined)
    });
  });
  describe('model', function(){
    it('bad RGB - no otherwise', function(){
        var AModel = model.make_model('A')
            .attribute(
                attribute.make_string('rgb').reading()
                    .format("color")
            )
            .make();

        var a = new AModel();
        a._clear_ostate = function() {};
        a.set('rgb', 'A')
        assert.strictEqual(a.state("ostate").rgb, null)

        a.set('rgb', '')
        assert.strictEqual(a.state("ostate").rgb, null)

        a.set('rgb', 'FF')
        assert.strictEqual(a.state("ostate").rgb, null)
    });
    it('good RGB', function(){
        var AModel = model.make_model('A')
            .attribute(
                attribute.make_string('rgb').reading()
                    .format("color")
            )
            .make();

        var a = new AModel();
        a._clear_ostate = function() {};
        a.set('rgb', '#000000')
        assert.strictEqual(a.state("ostate").rgb, "#000000")

        a.set('rgb', '#FF00FF')
        assert.strictEqual(a.state("ostate").rgb, "#FF00FF")

        a.set('rgb', '#FFFFFF')
        assert.strictEqual(a.state("ostate").rgb, "#FFFFFF")
    });
    it('good color', function(){
        var AModel = model.make_model('A')
            .attribute(
                attribute.make_string('rgb').reading()
                    .format("color")
            )
            .make();

        var a = new AModel();
        a._clear_ostate = function() {};
        a.set('rgb', 'red')
        assert.strictEqual(a.state("ostate").rgb, "#FF0000")

        a.set('rgb', 'green')
        assert.strictEqual(a.state("ostate").rgb, "#008000")

        a.set('rgb', 'blue')
        assert.strictEqual(a.state("ostate").rgb, "#0000FF")
    });
  });
})
