/*
 *  test_thing_set.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-05
 *
 *  Test setting values
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
describe('test_thing_set:', function(){
    it('set', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .attribute(
                attribute.make_integer('intensity').control()
                    .maximum(10)
                    .minimum(0)
            )
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
    it('transaction - delay validation', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .make();
        var t = new T();

        // until 'end' is called, no notifcations will happen
        t.start();
        assert.ok(_.equals({ on: null}, t.stated))
        t.set('on', 1);
        assert.ok(_.equals({ on: 1}, t.stated))
        t.end()
        assert.ok(_.equals({ on: true}, t.stated))
    });
    it('transaction - no validation', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .make();
        var t = new T();

        // turn off validation
        t.start({ validate: false });
        assert.ok(_.equals({ on: null}, t.stated))
        t.set('on', 1);
        assert.ok(_.equals({ on: 1}, t.stated))
        t.end()
        assert.ok(_.equals({ on: 1}, t.stated))
    });
    it('transaction - force validation', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .make();
        var t = new T();

        // turn off validation
        t.start({ validate: true });
        assert.ok(_.equals({ on: null}, t.stated))
        t.set('on', 1);
        assert.ok(_.equals({ on: 1}, t.stated))
        t.end()
        assert.ok(_.equals({ on: true}, t.stated))
    });
    it('set - semantic', function(){
        var T = model.make_model('T')
            .attribute(
                attribute.make_boolean('on')
                    .control()
                    .code('powered')
            )
            .make();
        var t = new T();

        assert.strictEqual(null, t.stated['powered'])
        assert.ok(isNaN(t.stated['on']))

        t.set('powered', true)
        assert.strictEqual(true, t.stated['powered'])

        t.set('on', false)
        assert.strictEqual(true, t.stated['powered']) // no change

        t.set('iot-attribute:on', false)
        assert.strictEqual(false, t.stated['powered']) 

        t.set('iot-attribute:on', true)
        assert.strictEqual(true, t.stated['powered']) 
    });
})
