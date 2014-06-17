/*
 *  test_thing_validate.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-16
 *
 *  Test validation at the Thing level
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
describe('test_thing_validate', function(){
    it('attribute validation', function(){
        /**
         *  Test that attribute validation is called
         *  and that the return value is <i>not</i>
         *  checked against the required types
         */
        var AModel = model.make_model('A')
            .attribute(
                attribute.make_boolean('on').control()
                    .validator(function(paramd) {
                        paramd.value = 0;
                    })
            )
            .make();

        var a = new AModel();
        a.set('on', false)

        assert.strictEqual(0, a.get('on'))
    });
    it('model validation', function(){
        /**
         *  Test that model validation is called
         *  and that the return value is <i>not</i>
         *  checked against the required types
         */
        var AModel = model.make_model('A')
            .attribute(
                attribute.make_boolean('on').control()
            )
            .validator(function(paramd) {
                paramd.changed['on'] = 0;
            })
            .make();

        var a = new AModel();
        a.set('on', false)

        assert.strictEqual(0, a.get('on'))
    });
    it('model validation (broken)', function(){
        /**
         *  Test that 'thingd' can't be used
         *  to alter the model's state
         */
        var AModel = model.make_model('A')
            .attribute(
                attribute.make_boolean('on').control()
            )
            .validator(function(paramd) {
                paramd.thingd['on'] = 0;
            })
            .make();

        var a = new AModel();
        a.set('on', false)

        assert.strictEqual(false, a.get('on'))
    });
})
