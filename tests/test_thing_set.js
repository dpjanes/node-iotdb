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
var iot_js_boolean = _.ld.expand("iot:boolean");
var iot_js_integer = _.ld.expand("iot:integer");
var iot_js_number = _.ld.expand("iot:number");
var iot_js_string = _.ld.expand("iot:string");

var iot_js_type = _.ld.expand("iot:type");

var iot_js_minimum = _.ld.expand("iot:minimum");
var iot_js_maximum = _.ld.expand("iot:maximum");

var iot_attribute = _.ld.expand("iot:attribute");
var iot_purpose = _.ld.expand("iot:purpose");

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
        assert.ok(_.equals({ on: null, intensity: null }, t.state("ostate")))
        t.set('on', true);
        assert.ok(_.d.is.subset({ on: true, intensity: null }, t.state("ostate")))
        t.set('on', false);
        assert.ok(_.d.is.subset({ on: false, intensity: null }, t.state("ostate")))
        t.set('on', 10);
        assert.ok(_.d.is.subset({ on: true, intensity: null }, t.state("ostate")))
        t.set('on', 0);
        assert.ok(_.d.is.subset({ on: false, intensity: null }, t.state("ostate")))
        t.set('intensity', 10);
        assert.ok(_.d.is.subset({ on: false, intensity: 10 }, t.state("ostate")))
        t.set('intensity', 1);
        assert.ok(_.d.is.subset({ on: false, intensity: 1 }, t.state("ostate")))
    });
    /* NO MORE TRANSACTIONS
    it('transaction - no validation', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .make();
        var t = new T();

        // turn off validation
        t.start({ validate: false });
        assert.ok(_.equals({ on: null}, t.state("ostate")))
        t.set('on', 1);
        assert.ok(_.equals({ on: 1}, t.state("ostate")))
        t.end()
        assert.ok(_.equals({ on: 1}, t.state("ostate")))
    });
    */
    /* NO MORE TRANSACTIONS
    it('transaction - force validation', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .make();
        var t = new T();

        // turn on validation
        t.start({ validate: true });
        assert.ok(_.equals({ on: null}, t.state("ostate")))
        t.set('on', 1);
        assert.ok(_.equals({ on: true}, t.state("ostate")))
        t.end()
        assert.ok(_.equals({ on: true}, t.state("ostate")))
    });
    */
    it('set - semantic', function(){
        var T = model.make_model('T')
            .attribute(
                attribute.make_boolean('on')
                    .control()
                    .code('powered')
            )
            .make();
        var t = new T();

        assert.strictEqual(null, t.state("ostate")['powered'])
        assert.ok(isNaN(t.state("ostate")['on']))

        t.set('powered', true)
        assert.strictEqual(true, t.state("ostate")['powered'])

        t.set('on', false)
        assert.strictEqual(true, t.state("ostate")['powered']) // no change

        t.set('iot-attribute:on', false)
        assert.strictEqual(false, t.state("ostate")['powered']) 

        t.set('iot-attribute:on', true)
        assert.strictEqual(true, t.state("ostate")['powered']) 
    });
})
