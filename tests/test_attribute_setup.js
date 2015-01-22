/*
 *  test_attribute_setup.js
 *
 *  David Janes
 *  IOTDB
 *  2013-12-28
 *
 *  Test setting up attributes
 */

"use strict";

var assert = require("assert")
var attribute = require("../attribute")
var _ = require("../helpers")

/* --- constants --- */
var iot_js_boolean = _.ld.expand("iot-js:boolean");
var iot_js_integer = _.ld.expand("iot-js:integer");
var iot_js_number = _.ld.expand("iot-js:number");
var iot_js_string = _.ld.expand("iot-js:string");

var iot_js_type = _.ld.expand("iot-js:type");

var iot_js_minimum = _.ld.expand("iot-js:minimum");
var iot_js_maximum = _.ld.expand("iot-js:maximum");

var iot_attribute = _.ld.expand("iot:Attribute");
var iot_purpose = _.ld.expand("iot:purpose");

/* --- tests --- */
describe('test_attribute_setup', function(){
  describe('setup', function(){
    it('empty setup', function(){
        var d = { '@type': iot_attribute };
        {
            var a = attribute.make("value");
            assert.deepEqual(a["@type"], d["@type"]);
        }
        {
            var e = _.deepCopy(d);
            e[iot_js_type] = iot_js_boolean;

            var a = attribute.make_boolean("value").reading()
            assert.deepEqual(a["@type"], e["@type"]);
        }
        {
            var e = _.deepCopy(d);
            e[iot_js_type] = iot_js_integer;

            var a = attribute.make_integer("value").reading()
            assert.deepEqual(a["@type"], e["@type"]);
        }
        {
            var e = _.deepCopy(d);
            e[iot_js_type] = iot_js_number;

            var a = attribute.make_number("value").reading()
            assert.deepEqual(a["@type"], e["@type"]);
        }
        {
            var e = _.deepCopy(d);
            e[iot_js_type] = iot_js_string;

            var a = attribute.make_string("value").reading()
            assert.deepEqual(a["@type"], e["@type"]);
        }
    });
    it('simple setup with purpose_key', function(){
        var d = { '@type': iot_attribute };
        d[iot_purpose] = _.ld.expand("iot-attribute:on");
        d["@id"] = "#on";
        {
            var e = _.deepCopy(d);
            e[iot_js_type] = iot_js_boolean;

            var a = attribute.make_boolean("on").reading()

            assert.deepEqual(a["@type"], e["@type"]);
        }
        {
            var e = _.deepCopy(d);
            e[iot_js_type] = iot_js_integer;

            var a = attribute.make_integer("on").reading()
            assert.deepEqual(a["@type"], e["@type"]);
        }
        {
            var e = _.deepCopy(d);
            e[iot_js_type] = iot_js_number;

            var a = attribute.make_number("on").reading()
            assert.deepEqual(a["@type"], e["@type"]);
        }
        {
            var e = _.deepCopy(d);
            e[iot_js_type] = iot_js_string;

            var a = attribute.make_string("on").reading()
            assert.deepEqual(a["@type"], e["@type"]);
        }
    });
    it('complicated setup', function(){
        var d = { 
            '@type': 'https://iotdb.org/pub/iot#Attribute',
            '@id': '#temperature_f',
            'https://iotdb.org/pub/iot#name': 'value',
            'https://iotdb.org/pub/iot#purpose': 'https://iotdb.org/pub/iot-attribute#temperature',
            'https://iotdb.org/pub/iot#role': 'https://iotdb.org/pub/iot-attribute#role-reading',
            'https://iotdb.org/pub/iot#unit': 'https://iotdb.org/pub/iot-unit#temperature.si.fahrenheit',
            'https://iotdb.org/pub/iot-js#type': 'https://iotdb.org/pub/iot-js#number',
            'https://iotdb.org/pub/iot-js#write': false,
            'https://iotdb.org/pub/iot-js#minimum': 0,
            'https://iotdb.org/pub/iot-js#maximum': 500 
        }

        var a = attribute.make_number("value")
            .reading()
            .code('temperature_f')
            .purpose("temperature")
            .unit("temperature.si.fahrenheit")
            .minimum(0)
            .maximum(500)
            .read_only()
            .make()
            ;

        console.log(a)

        assert.deepEqual(a, d);
    });
    it('IRI expansion', function(){
        var d = { '@type': 'https://iotdb.org/pub/iot#Attribute',
          'https://iotdb.org/pub/iot#purpose': 'https://iotdb.org/pub/iot-attribute#value',
          '@id': '#value',
          'https://iotdb.org/pub/iot#name': 'value',
          'https://iotdb.org/pub/iot#11': 'https://iotdb.org/pub/iot#a',
          'https://iotdb.org/pub/iot#12': 'iot_b',
          iot_13: 'https://iotdb.org/pub/iot#c',
          iot_14: 'iot_d',
          'https://iotdb.org/pub/iot#20': 'https://iotdb.org/pub/iot#a',
          'https://iotdb.org/pub/iot#21': 'a',
          'https://iotdb.org/pub/iot#22': 2,
          'https://iotdb.org/pub/iot#23': 3,
          'https://iotdb.org/pub/iot#24': false,
          'https://iotdb.org/pub/iot#30': 'iot:a',
          'https://iotdb.org/pub/iot#31': 'a',
          'https://iotdb.org/pub/iot#32': 2,
          'https://iotdb.org/pub/iot#33': 3,
          'https://iotdb.org/pub/iot#34': false }

        var a = attribute.make("value")
            .property("iot:11", "iot:a")
            .property("iot:12", "iot_b")
            .property("iot_13", "iot:c")
            .property("iot_14", "iot_d")

            .property("iot:20", "iot:a")
            .property("iot:21", "a")
            .property("iot:22", 2)
            .property("iot:23", 3.0)
            .property("iot:24", false)

            .property_value("iot:30", "iot:a")
            .property_value("iot:31", "a")
            .property_value("iot:32", 2)
            .property_value("iot:33", 3.0)
            .property_value("iot:34", false)
        ;
        assert.deepEqual(a, d);
    });
    it('multiples of same property', function(){
        {
            var d = {
                '@type': 'https://iotdb.org/pub/iot#Attribute',
                '@id': '#value',
                'https://iotdb.org/pub/iot#name': 'value',
                'https://iotdb.org/pub/iot#purpose': 'https://iotdb.org/pub/iot-attribute#on',
                'https://iotdb.org/pub/iot#role': [
                    'https://iotdb.org/pub/iot-attribute#role-reading',
                    'https://iotdb.org/pub/iot-attribute#role-control'
                ]
            }
            var a = attribute.make("value")
                .reading()
                .control()
                .purpose("on")
                .purpose("on")
            assert.deepEqual(a, d);
        }
        {
            var d = {
                '@type': 'https://iotdb.org/pub/iot#Attribute',
                '@id': '#value',
                'https://iotdb.org/pub/iot#purpose': 'https://iotdb.org/pub/iot-attribute#value',
                'https://iotdb.org/pub/iot#name': 'value',
                'https://iotdb.org/pub/iot#20': [ 'a', 'b' ]
            }
            var a = attribute.make("value")
                .property("iot:20", "a")
                .property("iot:20", "b")
                .property("iot:20", "a")
            assert.deepEqual(a, d);
        }
    });
    it('validator function', function(){
    });
  });
})
