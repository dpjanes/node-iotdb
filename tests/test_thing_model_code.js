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
