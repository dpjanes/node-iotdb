/*
 *  test_net.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-01
 *  "The Frickin Future"
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

describe('test_net', function() {
    describe('ipv4', function() {
        it('default', function() {
            var result = _.net.ipv4();
            var expect_rex = /^\d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}$/;

            assert.ok(result.match(expect_rex));
        });
    });
    describe('ipv6', function() {
        it('default', function() {
            var result = _.net.ipv6();
            var expect_rex = /^[a-z0-9:]*$/;

            assert.ok(result.match(expect_rex));
        });
    });
    describe('mac', function() {
        it('default', function() {
            var result = _.net.mac();
            var expect_rex = /^([a-f0-9][a-f0-9]:){5}([a-f0-9][a-f0-9])$/;

            assert.ok(result.match(expect_rex));
        });
    });
});
