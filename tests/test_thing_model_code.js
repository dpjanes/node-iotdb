/*
 *  test_thing_code.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-16
 *
 *  Test the code setting variants
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
describe('test_thing_model_code:', function(){
    it('no-code', function(){
        assert.throws(function() {
            var AModel = model.make_model()
            .make();
        }, Error);
    });
    it('has-code', function(){
        assert.doesNotThrow(function() {
            var AModel = model.make_model('AModel')
            .make();
        }, Error);
    });
    it('has-code', function(){
        assert.doesNotThrow(function() {
            var AModel = model.make_model()
                .code('AModel')
                .make();
        }, Error);
    });
    it('code-case', function(){
        var AModel = model.make_model()
            .code('AModel')
            .make();
        var a = new AModel();
        assert.strictEqual("a-model", a.code);
    });
    it('code-case', function(){
        var AModel = model.make_model()
            .code('aModel')
            .make();
        var a = new AModel();
        assert.strictEqual("a-model", a.code);
    });
    it('code-case', function(){
        assert.throws(function() {
            var AModel = model.make_model()
                .code('$$$')
                .make();
        });
    });
})
