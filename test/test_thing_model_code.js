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
var attribute = require("./instrument/attribute")
var model = require("../model")
var _ = require("../helpers")
var constants = require("../constants")

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
        assert.strictEqual("a-model", a.code());
    });
    it('code-case', function(){
        var AModel = model.make_model()
            .code('aModel')
            .make();
        var a = new AModel();
        assert.strictEqual("a-model", a.code());
    });
    it('code-case', function(){
        assert.throws(function() {
            var AModel = model.make_model()
                .code('$$$')
                .make();
        });
    });
})
