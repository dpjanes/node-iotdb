/*
 *  test_attribute_list.js
 *
 *  David Janes
 *  IOTDB
 *  2015-06-28
 *
 *  Test attribtues with lists
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

/* --- tests --- */
describe('test_attribute_rgb:', function(){
  describe('validate string/list conversions', function(){
    it('', function(){
        var a = attribute.make_string("value").list();

        var x = a.validate_value(null)
        assert.ok(_.isEqual(x, []))

        var x = a.validate_value("")
        assert.ok(_.isEqual(x, [ "" ]))

        var x = a.validate_value("a")
        assert.ok(_.isEqual(x, [ "a" ]))

        var x = a.validate_value(1)
        assert.ok(_.isEqual(x, [ "1" ]))

        var x = a.validate_value([ 1 ])
        assert.ok(_.isEqual(x, [ "1" ]))

        var x = a.validate_value([ 1, 3, 5 ])
        assert.ok(_.isEqual(x, [ "1", "3", "5" ]))

        var x = a.validate_value([ "1", 3, "5", 1 ])
        assert.ok(_.isEqual(x, [ "1", "3", "5", "1" ]))

        var x = a.validate_value([ "1 3 5" ])
        assert.ok(_.isEqual(x, [ "1 3 5" ]))

        var x = a.validate_value("1 3 5")
        assert.ok(_.isEqual(x, [ "1 3 5" ]))
    });
  });
  describe('validate data/list conversions', function(){
    it('', function(){
        var a = attribute.make_datetime("value").list();

        var x = a.validate_value(null)
        assert.ok(_.isEqual(x, []))

        // because undefined
        var x = a.validate_value("")
        assert.ok(_.isEqual(x, []))

        var now_dt = new Date();
        var now_iso = now_dt.toISOString();

        var x = a.validate_value(now_dt)
        assert.ok(_.isEqual(x, [ now_iso, ]))

        var x = a.validate_value([ now_dt, now_dt  ])
        assert.ok(_.isEqual(x, [ now_iso, now_iso, ]))
    });
  });
  describe('model', function(){
    it('Model string/list', function(){
        var AModel = model.make_model('A')
            .attribute(
                attribute
                    .make_string('value')
                    .list()
            )
            .make();

        var a = new AModel();
        a._clear_ostate = function() {};

        a.set('value', null)
        var x = a.state("ostate").value;
        assert.ok(_.isEqual(x, []))

        a.set('value', "")
        var x = a.state("ostate").value;
        assert.ok(_.isEqual(x, [ "" ]))

        a.set('value', "a")
        var x = a.state("ostate").value;
        assert.ok(_.isEqual(x, [ "a" ]))

        a.set('value', 1)
        var x = a.state("ostate").value;
        assert.ok(_.isEqual(x, [ "1" ]))

        a.set('value', [ 1 ])
        var x = a.state("ostate").value;
        assert.ok(_.isEqual(x, [ "1" ]))

        a.set('value', [ 1, 3, 5 ])
        var x = a.state("ostate").value;
        assert.ok(_.isEqual(x, [ "1", "3", "5" ]))

        a.set('value', [ "1", 3, "5", 1 ])
        var x = a.state("ostate").value;
        assert.ok(_.isEqual(x, [ "1", "3", "5", "1" ]))

        a.set('value', [ "1 3 5" ])
        var x = a.state("ostate").value;
        assert.ok(_.isEqual(x, [ "1 3 5" ]))

        a.set('value', "1 3 5")
        var x = a.state("ostate").value;
        assert.ok(_.isEqual(x, [ "1 3 5" ]))
    });
  });
})
