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
                _.ld.remove(d, key, what);

                assert.ok(true);
            });
            it('null', function() {
                var d = null;
                var key = "something";
                var what = "what";
                var expect = null;
                _.ld.remove(d, key, what);

                assert.ok(true);
            });
            it('number', function() {
                var d = 1;
                var key = "something";
                var expect = false;
                var what = "what";

                assert.throws(function() {
                    _.ld.remove(d, key, what);
                }, Error);
            });
        });
        describe('empty dictionary', function() {
            it('empty string', function() {
                var d = {};
                var key = "something";
                var what = "";

                var expect = {};

                _.ld.remove(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('string', function() {
                var d = {};
                var key = "something";
                var what = "what";

                var expect = {};

                _.ld.remove(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('0 number', function() {
                var d = {};
                var key = "something";
                var what = 0;

                var expect = {};

                _.ld.remove(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('number', function() {
                var d = {};
                var key = "something";
                var what = 3.14;

                var expect = {};

                _.ld.remove(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('empty array', function() {
                var d = {};
                var key = "something";
                var what = [];

                var expect = {};

                _.ld.remove(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('array', function() {
                var d = {};
                var key = "something";
                var what = [ "a", "b", "c" ];

                var expect = {};

                _.ld.remove(d, key, what);

                assert.deepEqual(d, expect);
            });
        });
        describe('key-in-use dictionary', function() {
            it('value does not match', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = "b value";

                var expect = { "something": "a value" };

                _.ld.remove(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('value matches', function() {
                var d = { "something": "a value" };
                var key = "something";
                var what = "a value";

                var expect = {};

                _.ld.remove(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('value array - remove to get 0', function() {
                var d = { "something": [ "a value", ] };
                var key = "something";
                var what = "a value";

                var expect = {
                };

                _.ld.remove(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('value array - remove to get 1', function() {
                var d = { "something": [ "a value", "b value" ] };
                var key = "something";
                var what = "a value";

                var expect = {
                    something: "b value",
                };

                _.ld.remove(d, key, what);

                assert.deepEqual(d, expect);
            });
            it('value array - remove to get 2', function() {
                var d = { "something": [ "a value", "b value", "c value", ] };
                var key = "something";
                var what = "a value";

                var expect = {
                    something: [ "b value", "c value" ],
                };

                _.ld.remove(d, key, what);

                assert.deepEqual(d, expect);
            });
        });
    });
})
