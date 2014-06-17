/*
 *  test_thing.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-16
 *
 *  Test Thing inheretance
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
describe('test_thing_inherit:', function(){
    it('constructor', function(){
        var AModel = model.make_model('A')
            .make();

        var BModel = model.make_model('B')
            .inherit(AModel)
            .make()
            ;
    });
    it('constructor', function(){
        var AModel = model.make_model('A')
            .attribute(attribute.make_boolean('on').control())
            .make();

        var BModel = model.make_model('B')
            .inherit(AModel)
            .make()
            ;

        var a = new AModel();
        a.set('on', false)

        var b = new BModel();
        b.set('on', true)

        assert.strictEqual(false, a.get('on'))
        assert.strictEqual(true, b.get('on'))
    });
    it('attribute validation', function(){
        var AModel = model.make_model('A')
            .attribute(
                attribute.make_boolean('on').control()
                    .validator(function(paramd) {
                        paramd.value = 0;
                    })
            )
            .make();

        var BModel = model.make_model('B')
            .inherit(AModel)
            .make()
            ;

        var a = new AModel();
        a.set('on', false)

        var b = new BModel();
        b.set('on', true)

        assert.strictEqual(0, a.get('on'))
        assert.strictEqual(0, b.get('on'))
    });
    it('model validation', function(){
        var AModel = model.make_model('A')
            .attribute(
                attribute.make_boolean('on').control()
            )
            .validator(function(paramd) {
                paramd.changed['on'] = 0;
            })
            .make();

        var BModel = model.make_model('B')
            .inherit(AModel)
            .make()
            ;

        var a = new AModel();
        a.set('on', false)

        var b = new BModel();
        b.set('on', true)

        assert.strictEqual(0, a.get('on'))
        assert.strictEqual(0, b.get('on'))
    });
})
