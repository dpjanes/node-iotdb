/*
 *  test_ld_first.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-02
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

/* --- tests --- */
describe('test_ld', function() {
    describe('first', function() {
        describe('no dictionary', function() {
            it('undefined', function() {
                var d = undefined;
                var key = "something";
                var expect = "otherwise";
                var otherwise = "otherwise";
                var result = _.ld.first(d, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('null', function() {
                var d = null;
                var key = "something";
                var expect = "otherwise";
                var otherwise = "otherwise";
                var result = _.ld.first(d, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('number', function() {
                var d = 1;
                var key = "something";
                var expect = "otherwise";
                var otherwise = "otherwise";

                assert.throws(function() {
                    _.ld.first(d, key, otherwise);
                }, Error);
            });
        });
        describe('missing', function() {
            it('missing', function() {
                var d = {};
                var key = "something";
                var expect = undefined;
                var otherwise = undefined;
                var result = _.ld.first(d, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('missing with null default', function() {
                var d = {};
                var key = "something";
                var expect = null;
                var otherwise = null;
                var result = _.ld.first(d, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('missing with string default', function() {
                var d = {};
                var key = "something";
                var expect = "else";
                var otherwise = "else";
                var result = _.ld.first(d, key, otherwise);

                assert.strictEqual(result, expect);
            });
        });
        describe('single value', function() {
            it('string', function() {
                var d = {
                    something: "a",
                };
                var key = "something";
                var expect = "a";
                var otherwise = null;
                var result = _.ld.first(d, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('number', function() {
                var d = {
                    something: 123,
                };
                var key = "something";
                var expect = 123;
                var otherwise = null;
                var result = _.ld.first(d, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('dictionary', function() {
                var d = {
                    something: { a: 1 },
                };
                var key = "something";
                var expect = { a: 1 };
                var otherwise = null;
                var result = _.ld.first(d, key, otherwise);

                assert.ok(_.is.Equal(result, expect));
            });
        });
        describe('multi value', function() {
            it('string', function() {
                var d = {
                    something: [ "a", "b", ],
                };
                var key = "something";
                var expect = "a";
                var otherwise = null;
                var result = _.ld.first(d, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('number', function() {
                var d = {
                    something: [ 123, 456 ],
                };
                var key = "something";
                var expect = 123;
                var otherwise = null;
                var result = _.ld.first(d, key, otherwise);

                assert.strictEqual(result, expect);
            });
        });
    });
})
