/*
 *  test_ld_compact.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-02
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

/* --- tests --- */
describe('test_ld_compact', function() {
    describe('compact', function() {
        describe('simple', function() {
            it('null', function() {
                var value = null;
                var result = _.ld.compact(value);
                var expected = null

                assert.strictEqual(result, expected);
            });
            it('undefined', function() {
                var value = undefined;
                var result = _.ld.compact(value);
                var expected = undefined

                assert.strictEqual(result, expected);
            });
            it('string - ""', function() {
                var value = "";
                var result = _.ld.compact(value);
                var expected = "";

                assert.strictEqual(result, expected);
            });
            it('string', function() {
                var value = "hi";
                var result = _.ld.compact(value);
                var expected = "hi"

                assert.strictEqual(result, expected);
            });
            it('boolean - 0', function() {
                var value = false;
                var result = _.ld.compact(value);
                var expected = false

                assert.strictEqual(result, expected);
            });
            it('boolean', function() {
                var value = true;
                var result = _.ld.compact(value);
                var expected = true;

                assert.strictEqual(result, expected);
            });
            it('boolean with json:false', function() {
                var value = true;
                var result = _.ld.compact(value, { json: false });
                var expected = true;

                assert.strictEqual(result, expected);
            });
            it('integer - 0', function() {
                var value = 0;
                var result = _.ld.compact(value);
                var expected = 0

                assert.strictEqual(result, expected);
            });
            it('integer', function() {
                var value = 3;
                var result = _.ld.compact(value);
                var expected = 3;

                assert.strictEqual(result, expected);
            });
            it('integer with json:false', function() {
                var value = 3;
                var result = _.ld.compact(value, { json: false });
                var expected = 3;

                assert.strictEqual(result, expected);
            });
            it('number - 0', function() {
                var value = 0;
                var result = _.ld.compact(value);
                var expected = 0

                assert.strictEqual(result, expected);
            });
            it('number', function() {
                var value = 3.14;
                var result = _.ld.compact(value);
                var expected = 3.14

                assert.strictEqual(result, expected);
            });
            it('number with json:false', function() {
                var value = 3.14;
                var result = _.ld.compact(value, { json: false });
                var expected = 3.14

                assert.strictEqual(result, expected);
            });
            it('function', function() {
                var value = function() {};
                var result = _.ld.compact(value);
                var expected = undefined;

                assert.strictEqual(result, expected);
            });
            it('function with json:false', function() {
                var value = function() {};
                var result = _.ld.compact(value, { json: false });
                var expected = undefined;

                assert.strictEqual(result, expected);
            });
        });
        describe('qnames', function() {
            it('array known', function() {
                var values = [
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#one",
                    "http://www.w3.org/2000/01/rdf-schema#one",
                    "http://schema.org/one",
                    "https://en.wikipedia.org/wiki/one",
                    "https://iotdb.org/pub/iot#one",
                    "https://iotdb.org/pub/iot-purpose#one",
                    "https://iotdb.org/pub/iot-facet#one",
                    "https://iotdb.org/pub/iot-unit#one",
                ]
                var expected = [
                    'rdf:one',
                    'rdfs:one',
                    'schema:one',
                    'wikipedia:one',
                    'iot:one',
                    'iot-purpose:one',
                    'iot-facet:one',
                    'iot-unit:one'
                ]

                var result = _.ld.compact(values);

                assert.deepEqual(result, expected);
            });
            it('array unknown', function() {
                var values = [
                    "http://www.google.com/one",
                    "http://www.davidjanes.com/one",
                    "https://iotdb.org/one",
                ]
                var expected = values;

                var result = _.ld.compact(values);

                assert.deepEqual(result, expected);
            });
            it('dictionary known', function() {
                var values = [
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#one",
                    "http://www.w3.org/2000/01/rdf-schema#one",
                    "http://schema.org/one",
                    "https://en.wikipedia.org/wiki/one",
                    "https://iotdb.org/pub/iot#one",
                    "https://iotdb.org/pub/iot-purpose#one",
                    "https://iotdb.org/pub/iot-facet#one",
                    "https://iotdb.org/pub/iot-unit#one",
                ]
                var values = _.object(values, values);
                var expected = [
                    'rdf:one',
                    'rdfs:one',
                    'schema:one',
                    'wikipedia:one',
                    'iot:one',
                    'iot-purpose:one',
                    'iot-facet:one',
                    'iot-unit:one'
                ]
                var expected = _.object(expected, expected);

                var result = _.ld.compact(values);

                assert.deepEqual(result, expected);
            });
            it('array unknown', function() {
                var values = [
                    "http://www.google.com/one",
                    "http://www.davidjanes.com/one",
                    "https://iotdb.org/one",
                ]
                var values = _.object(values, values);
                var expected = values;

                var result = _.ld.compact(values);

                assert.deepEqual(result, expected);
            });
        });
        describe('misc', function() {
            it('compact with non-JSON values', function() {
                var values = [
                    "https://iotdb.org/pub/iot#one",
                    "http://www.google.com/one",
                    function() {},
                    undefined,
                    "hello world",
                ]
                var expected = [
                    "iot:one",
                    "http://www.google.com/one",
                    "hello world",
                ]

                var result = _.ld.compact(values);

                assert.deepEqual(result, expected);
            });
            it('deep with scrub:true', function() {
                // this is not supposed to make sense
                var values = {
                    "@context": "something",
                    "iot:purpose": {
                        "@id": "something",
                        "iot:purpose": "iot-unit:one",
                        "iot:unit": "some value",
                        "hello": "world",
                        'iot:function': function() {},
                    },
                    "a": "b",
                }
                var expected = { 'iot:purpose': { 'iot:purpose': 'iot-unit:one', 'iot:unit': 'some value' } };

                var result = _.ld.compact(values, {
                    scrub: true
                });

                assert.deepEqual(result, expected);
            });
            it('deep with jsonld:true', function() {
                // this is not supposed to make sense
                var values = {
                    "@context": "something",
                    "iot:purpose": {
                        "@id": "something",
                        "iot:purpose": "iot-unit:one",
                        "iot:unit": "some value",
                        "hello": "world",
                        'iot:function': function() {},
                    },
                    "a": "b",
                }
                var expected = {
                    '@context': 'something',
                    'iot:purpose': {
                        '@id': 'something',
                        'iot:purpose': 'iot-unit:one',
                        'iot:unit': 'some value'
                     }
                };

                var result = _.ld.compact(values, {
                    jsonld: true
                });

                assert.deepEqual(result, expected);
            });
        });
    });
})
