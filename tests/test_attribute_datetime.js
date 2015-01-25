/*
 *  test_attribute_datetime.js
 *
 *  David Janes
 *  IOTDB
 *  2014-02-14
 *
 *  Test datetime with attributes
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

var iot_js_format = _.ld.expand("iot:format");
var iot_js_color = _.ld.expand("iot:color");
var iot_js_time = _.ld.expand("iot:time");
var iot_js_date = _.ld.expand("iot:date");
var iot_js_datetime = _.ld.expand("iot:datetime");

var wrap_validate = function(a, value, paramd) {
    if (paramd === undefined) {
        paramd = {}
    }
    paramd['value'] = value

    a.validate(paramd)
    return paramd.value
}

/* --- tests --- */
describe('test_attribute_format:', function(){
  describe('format', function(){
    it('bad datetime - no otherwise', function(){
        var a = attribute.make_string("value").reading()
            .format("datetime")

        var x = wrap_validate(a, "a")
        assert.ok(x === undefined)
    });
    it('bad datetime - default otherwise', function(){
        var a = attribute.make_string("value").reading()
            .format("datetime")

        var x = wrap_validate(a, "a", {
            use_otherwise: true
        })
        assert.ok(x !== undefined)
    });
    it('bad datetime - specified otherwise', function(){
        var a = attribute.make_string("value").reading()
            .format("datetime")

        var x = wrap_validate(a, "a", {
            use_otherwise: true,
            otherwise_datetime: "2014-02-14T05:00:00.000Z"
        })
        assert.ok(x === "2014-02-14T05:00:00.000Z")
    });
  });
  describe('in Thing', function(){
    it('valid values', function(){
        var T = model.make_model('T')
            .attribute(
                attribute.make_string("when").format("datetime").reading()
            )
            .make();
        var t = new T();
        assert.ok(t.stated.when === null)

        t.set('when', "2014-02-14T05:00:00.000Z")
        assert.ok(t.stated.when === "2014-02-14T05:00:00.000Z")

        var d = new Date(2014, 2, 14, 5, 0, 0, 0)
        t.set('when', d)
        assert.ok(t.stated.when === d.toISOString())

        t.set('when', null)
        assert.ok(t.stated.when === null)

        var d = new Date()
        t.set('when', d)
        assert.ok(t.stated.when === d.toISOString())
        // assert.ok(t.stated.when === null)

        // console.log(t.stated)
    });
    
  })
})
