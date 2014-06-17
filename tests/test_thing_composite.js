/*
 *  test_thing_composite.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-05
 *
 *  Test composite devices
 */

"use strict";

var assert = require("assert")
var attribute = require("../attribute")
var model = require("../model")
var _ = require("../helpers")

/* --- constants --- */
var iot_js_boolean = _.expand("iot-js:boolean");
var iot_js_integer = _.expand("iot-js:integer");
var iot_js_number = _.expand("iot-js:number");
var iot_js_string = _.expand("iot-js:string");

var iot_js_type = _.expand("iot-js:type");

var iot_js_minimum = _.expand("iot-js:minimum");
var iot_js_maximum = _.expand("iot-js:maximum");

var iot_attribute = _.expand("iot:attribute");
var iot_purpose = _.expand("iot:purpose");

/* --- tests --- */
describe('test_thing_composite:', function(){
  describe('set', function(){
    it('simple set / no transaction', function(){
        var S = model.make_model('S')
            .attribute(attribute.make_boolean('on').reading())
            .make();

        var T = model.make_model('T')
            .subthing('subthing', S)
            .attribute(attribute.make_boolean('on').reading())
            .make();


        var t = new T();
        assert.ok(_.equals({ on: null, subthing: { on: null } }, t.state()))
        t.set('on', true);
        assert.ok(_.equals({ on: true, subthing: { on: null } }, t.state()))
        t.set('on', false);
        assert.ok(_.equals({ on: false, subthing: { on: null } }, t.state()))
        t.set('subthing/on', true);
        assert.ok(_.equals({ on: false, subthing: { on: true } }, t.state()))
        t.set('subthing/on', false);
        assert.ok(_.equals({ on: false, subthing: { on: false } }, t.state()))
    });
    it('simple set / transaction (delayed validation)', function(){
        var S = model.make_model('S')
            .attribute(attribute.make_boolean('on').reading())
            .make();

        var T = model.make_model('T')
            .subthing('subthing', S)
            .attribute(attribute.make_boolean('on').reading())
            .make();


        var t = new T();
        t.start()
        assert.ok(_.equals({ on: null, subthing: { on: null } }, t.state()))
        t.set('on', 1);
        assert.ok(_.equals({ on: 1, subthing: { on: null } }, t.state()))
        t.set('on', 0);
        assert.ok(_.equals({ on: 0, subthing: { on: null } }, t.state()))
        t.set('subthing/on', 1);
        assert.ok(_.equals({ on: 0, subthing: { on: 1 } }, t.state()))
        t.set('subthing/on', 0);
        assert.ok(_.equals({ on: 0, subthing: { on: 0 } }, t.state()))
        t.end();
        assert.ok(_.equals({ on: false, subthing: { on: false } }, t.state()))
    });
    it('simple set / transaction (no validation)', function(){
        var S = model.make_model('S')
            .attribute(attribute.make_boolean('on').reading())
            .make();

        var T = model.make_model('T')
            .subthing('subthing', S)
            .attribute(attribute.make_boolean('on').reading())
            .make();


        var t = new T();
        t.start({ validate: false })
        assert.ok(_.equals({ on: null, subthing: { on: null } }, t.state()))
        t.set('on', 1);
        assert.ok(_.equals({ on: 1, subthing: { on: null } }, t.state()))
        t.set('on', 0);
        assert.ok(_.equals({ on: 0, subthing: { on: null } }, t.state()))
        t.set('subthing/on', 1);
        assert.ok(_.equals({ on: 0, subthing: { on: 1 } }, t.state()))
        t.set('subthing/on', 0);
        assert.ok(_.equals({ on: 0, subthing: { on: 0 } }, t.state()))
        t.end();
        assert.ok(_.equals({ on: 0, subthing: { on: 0 } }, t.state()))
    });
  });
})
