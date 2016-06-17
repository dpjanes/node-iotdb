/*
 *  test_helpers_identifier.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-16
 *
 *  Test indentifier_* functions in helpers
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var inputs = [
    "UUID",
    "MyCamelCaseString",
    "my-camel-case-string",
    "My_Camel_Case_String",
    "AModel",
    "A-Model",
    "a-model",
    "a__model",
    "TestID",
    "Test_ID",
    "Test-ID",
    "Good10Good",
    "FirmataDHT11"
]
/* --- tests --- */
describe('test_helpers_identifier:', function(){
    it('CamelCase', function(){
        var expects = [ 'Uuid',
          'MyCamelCaseString',
          'MyCamelCaseString',
          'MyCamelCaseString',
          'AModel',
          'AModel',
          'AModel',
          'AModel',
          'TestId',
          'TestId',
          'TestId' ,
          'Good10Good',
          'FirmataDht11'
          ];
        var gots = []
        for (var ii in inputs) {
            gots.push(_.id.to_camel_case(inputs[ii]))
        }
        assert.ok(_.is.Equal(expects, gots))
    });
    it('underscore_case', function(){
        var expects = [ 'uuid',
          'my_camel_case_string',
          'my_camel_case_string',
          'my_camel_case_string',
          'a_model',
          'a_model',
          'a_model',
          'a_model',
          'test_id',
          'test_id',
          'test_id' ,
          'good10_good',
          'firmata_dht11'
          ];
        var gots = []
        for (var ii in inputs) {
            gots.push(_.id.to_underscore_case(inputs[ii]))
        }
        assert.ok(_.is.Equal(expects, gots))
    });
    it('dash-case', function(){
        var expects = [ 'uuid',
          'my-camel-case-string',
          'my-camel-case-string',
          'my-camel-case-string',
          'a-model',
          'a-model',
          'a-model',
          'a-model',
          'test-id',
          'test-id',
          'test-id',
          'good10-good',
          'firmata-dht11'
          ];
        var gots = []
        for (var ii in inputs) {
            gots.push(_.id.to_dash_case(inputs[ii]))
        }
        assert.ok(_.is.Equal(expects, gots))

    });
    it('illegals', function(){
        var bads = [
            // illegal characters
            " ",
            "a thing",
            "a$thing",
            "a#thing",

            // must have at least one character
            "",

            // cannot start with a number, underscore or dash
            "1BadString",
            "_BadString",
            "-BadString",

            // cannot be other objects
            true,
            false,
            0,
            1,
            3.14,
            [],
            {}
        ]
        var fs = [
            _.id.to_camel_case,
            _.id.to_underscore_case,
            _.id.to_dash_case
        ]
        for (var fi in fs) {
            var f = fs[fi];

            for (var bi in bads) {
                var b = bads[bi];
                assert.throws(function() {
                    f(b);
                }, Error)
            }
        }
    });
})
