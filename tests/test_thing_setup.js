/*
 *  test_thing_setup.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-05
 *
 *  Test setting up things
 */

"use strict";

var assert = require("assert")
var attribute = require("../attribute")
var model = require("../model")
var _ = require("../helpers")

/* --- constants --- */
var iot_js_boolean = _.ld.expand("iot-js:boolean");
var iot_js_integer = _.ld.expand("iot-js:integer");
var iot_js_number = _.ld.expand("iot-js:number");
var iot_js_string = _.ld.expand("iot-js:string");

var iot_js_type = _.ld.expand("iot-js:type");

var iot_js_minimum = _.ld.expand("iot-js:minimum");
var iot_js_maximum = _.ld.expand("iot-js:maximum");

var iot_attribute = _.ld.expand("iot:attribute");
var iot_purpose = _.ld.expand("iot:purpose");

/* --- tests --- */
describe('test_thing_setup:', function(){
    it('constructor', function(){
        var T = model.make_model('T')
            .make();
        assert.ok(typeof T === "function");
    });
    it('empty setup', function(){
        var T = model.make_model('T')
            .make();
        var t = new T();
        assert.ok(t.__is_thing)
        assert.ok(_.equals({}, t.stated))
    });
    it('single attribute setup', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .make();
        var t = new T();
        assert.ok(_.equals({ on: null }, t.stated))
        t.set('on', true);
        assert.ok(_.equals({ on: true }, t.stated))
        t.set('on', false);
        assert.ok(_.equals({ on: false }, t.stated))
        t.set('on', 10);
        assert.ok(_.equals({ on: true }, t.stated))
        t.set('on', 0);
        assert.ok(_.equals({ on: false }, t.stated))
    });
    it('multiple attribute setup', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .attribute(attribute.make_number('intensity').control())
            .make();
        var t = new T();
        assert.ok(_.equals({ on: null, intensity: null }, t.stated))
        t.set('on', true);
        assert.ok(_.equals({ on: true, intensity: null }, t.stated))
        t.set('on', false);
        assert.ok(_.equals({ on: false, intensity: null }, t.stated))
        t.set('on', 10);
        assert.ok(_.equals({ on: true, intensity: null }, t.stated))
        t.set('on', 0);
        assert.ok(_.equals({ on: false, intensity: null }, t.stated))
        t.set('intensity', 10);
        assert.ok(_.equals({ on: false, intensity: 10 }, t.stated))
        t.set('intensity', 1);
        assert.ok(_.equals({ on: false, intensity: 1 }, t.stated))
    });
})
