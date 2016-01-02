/*
 *  test_ld_set.js
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
    describe('set', function() {
        describe('no dictionary', function() {
            it('undefined', function() {
                var d = undefined;
                var key = "something";
                var what = "what";
                var expect = undefined;
                _.ld.set(d, key, what);

                assert.ok(true);
            });
            it('null', function() {
                var d = null;
                var key = "something";
                var what = "what";
                var expect = null;
                _.ld.set(d, key, what);

                assert.ok(true);
            });
            it('number', function() {
                var d = 1;
                var key = "something";
                var expect = false;
                var what = "what";

                assert.throws(function() {
                    _.ld.set(d, key, what);
                }, Error);
            });
        });
        describe('empty dictionary', function() {
            it('empty string', function() {
                var d = {};
                var key = "something";
                var what = "";

                var expect = {};
                expect[key] = what;

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('string', function() {
                var d = {};
                var key = "something";
                var what = "what";

                var expect = {};
                expect[key] = what;

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('0 number', function() {
                var d = {};
                var key = "something";
                var what = 0;

                var expect = {};
                expect[key] = what;

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('number', function() {
                var d = {};
                var key = "something";
                var what = 3.14;

                var expect = {};
                expect[key] = what;

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('empty array', function() {
                var d = {};
                var key = "something";
                var what = [];

                var expect = {};

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('array with 1', function() {
                var d = {};
                var key = "something";
                var what = [ "a", ];

                var expect = {};
                expect[key] = "a";

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('array with many', function() {
                var d = {};
                var key = "something";
                var what = [ "a", "b", "c" ];

                var expect = {};
                expect[key] = what;

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
        });
        describe('key-in-use dictionary', function() {
            it('null', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = null;

                var expect = {};

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('undefined', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = undefined;

                var expect = {};

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('empty string', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = "";

                var expect = {};
                expect[key] = what;

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('string', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = "what";

                var expect = {};
                expect[key] = what;

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('0 number', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = 0;

                var expect = {};
                expect[key] = what;

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('number', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = 3.14;

                var expect = {};
                expect[key] = what;

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('empty array', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = [];

                var expect = {};

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('array', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = [ "a", "b", "c" ];

                var expect = {};
                expect[key] = what;

                _.ld.set(d, key, what);

                assert.deepEqual(d, expect);
            });
        });
    });
})
