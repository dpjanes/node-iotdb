/*
 *  test_parse_link.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-01
 *  "The Frickin Future"
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var _ = require("../helpers")

describe('test_parse_link', function() {
    describe('parse_link', function() {
        it('empty', function() {
            var value = "";
            var result = _.http.parse_link(value);
            var expect = {};

            assert.ok(_.is.Equal(result, expect));
        });
        it('simple', function() {
            var value = '<tcp://mqtt.iotdb.org:1883>';
            var result = _.http.parse_link(value);
            var expect = { 'tcp://mqtt.iotdb.org:1883': {} };

            assert.ok(_.is.Equal(result, expect));
        });
        it('simple with kinda malformed extension', function() {
            var value = '<tcp://mqtt.iotdb.org:1883>; ';
            var result = _.http.parse_link(value);
            var expect = { 'tcp://mqtt.iotdb.org:1883': {} };

            assert.ok(_.is.Equal(result, expect));
        });
        it('single', function() {
            var value = '<tcp://mqtt.iotdb.org:1883>; rel="mqtt"; payload=PUT; topic="bedroom/light"'
            var result = _.http.parse_link(value);
            var expect = { 'tcp://mqtt.iotdb.org:1883': { rel: 'mqtt', payload: 'PUT', topic: 'bedroom/light' } };

            assert.ok(_.is.Equal(result, expect));
        });
        it('multi', function() {
            var value = '<tcp://mqtt.iotdb.org:1883>; rel="mqtt"; payload=PUT; topic="bedroom/light",<ssl://mqtt.iotdb.org:1883>; rel="mqtt"; payload=PUT; topic="bedroom/light",'
            var result = _.http.parse_link(value);
            var expect = { 'tcp://mqtt.iotdb.org:1883': { rel: 'mqtt', payload: 'PUT', topic: 'bedroom/light' },
  'ssl://mqtt.iotdb.org:1883': { rel: 'mqtt', payload: 'PUT', topic: 'bedroom/light' } }

            assert.ok(_.is.Equal(result, expect));
        });
        /*
        it('multi-line', function() {
            var value = "";
            var result = _.http.parse_link(value);
            var expect = {};

            console.log(result);
            // assert.strictEqual(result, expect);
        });
        it('bad', function() {
            var value = 124;
            var result = _.http.parse_link(value);
            var expect = {};

            console.log(result);
            // assert.strictEqual(result, expect);
        });
        */
        it('bad', function() {
            var value = "http://www.google.com";
            var result = _.http.parse_link(value);
            var expect = {};

            assert.ok(_.is.Equal(result, expect));
        });
    });
});
