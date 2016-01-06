/*
 *  test_ld_add.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-02
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

/* --- tests --- */
describe('test_ld_add', function() {
    describe('add', function() {
        describe('no dictionary', function() {
            it('undefined', function() {
                var d = undefined;
                var key = "something";
                var what = "what";
                var expect = undefined;
                _.ld.add(d, key, what);

                assert.ok(true);
            });
            it('null', function() {
                var d = null;
                var key = "something";
                var what = "what";
                var expect = null;
                _.ld.add(d, key, what);

                assert.ok(true);
            });
            it('number', function() {
                var d = 1;
                var key = "something";
                var expect = false;
                var what = "what";

                assert.throws(function() {
                    _.ld.add(d, key, what);
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

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('string', function() {
                var d = {};
                var key = "something";
                var what = "what";

                var expect = {};
                expect[key] = what;

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('0 number', function() {
                var d = {};
                var key = "something";
                var what = 0;

                var expect = {};
                expect[key] = what;

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('number', function() {
                var d = {};
                var key = "something";
                var what = 3.14;

                var expect = {};
                expect[key] = what;

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('empty array', function() {
                var d = {};
                var key = "something";
                var what = [];

                var expect = {};

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('array', function() {
                var d = {};
                var key = "something";
                var what = [ "a", "b", "c" ];

                var expect = {};
                expect[key] = what;

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
        });
        describe('key-in-use dictionary', function() {
            it('null', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = null;

                var expect = {};
                expect[key] = "a value";

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('undefined', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = undefined;

                var expect = {};
                expect[key] = "a value";

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('empty string', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = "";

                var expect = {};
                expect[key] = [ "a value", what ];

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('string', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = "what";

                var expect = {};
                expect[key] = [ "a value", what ];

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('0 number', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = 0;

                var expect = {};
                expect[key] = [ "a value", what ];

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('number', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = 3.14;

                var expect = {};
                expect[key] = [ "a value", what ];

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('empty array', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = [];

                var expect = {};
                expect[key] = "a value";

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('array', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = [ "a", "b", "c" ];

                var expect = {};
                expect[key] = [ "a value", "a", "b", "c" ];

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('array with array', function() {
                var d = { "something": [ "a value", "b value" ] };
                var key = "something";
                var what = [ "a", "b", "c" ];

                var expect = {};
                expect[key] = [ "a value", "b value", "a", "b", "c" ];

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('array with array with repeats', function() {
                var d = { "something": [ "a value", "b value" ] };
                var key = "something";
                var what = [ "a value", "b value", "c" ];

                var expect = {};
                expect[key] = [ "a value", "b value", "c" ];

                _.ld.add(d, key, what);

                assert.deepEqual(d, expect);
            });
        });
    });
})
