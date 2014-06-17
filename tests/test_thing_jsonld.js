/*
 *  test_thing.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-16
 *
 *  Test JSON-LD production
 */

var assert = require("assert")
var attribute = require("../attribute")
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
describe('test_thing_jsonld:', function(){
    it('constructor', function(){
    });
})
