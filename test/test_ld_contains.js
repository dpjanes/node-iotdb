/*
 *  test_ld_contains.js
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
    describe('contains', function() {
        describe('no dictionary', function() {
            it('undefined', function() {
                var d = undefined;
                var key = "something";
                var expect = false;
                var what = "what";
                var result = _.ld.contains(d, key, what);

                assert.strictEqual(result, expect);
            });
            it('null', function() {
                var d = null;
                var key = "something";
                var expect = false;
                var what = "what";
                var result = _.ld.contains(d, key, what);

                assert.strictEqual(result, expect);
            });
            it('number', function() {
                var d = 1;
                var key = "something";
                var expect = false;
                var what = "what";

                assert.throws(function() {
                    _.ld.contains(d, key, what);
                }, Error);
            });
        });
        describe('missing', function() {
            it('missing', function() {
                var d = {};
                var key = "something";
                var expect = false;
                var what = undefined;
                var result = _.ld.contains(d, key, what);

                assert.strictEqual(result, expect);
            });
        });
        describe('single value', function() {
            it('string - contained', function() {
                var d = {
                    something: "a",
                };
                var key = "something";
                var expect = true;
                var what = "a";
                var result = _.ld.contains(d, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('number - contained', function() {
                var d = {
                    something: 123,
                };
                var key = "something";
                var expect = true;
                var what = 123;
                var result = _.ld.contains(d, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('string - not contained', function() {
                var d = {
                    something: "a",
                };
                var key = "something";
                var expect = false;
                var what = "b";
                var result = _.ld.contains(d, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('number - not contained', function() {
                var d = {
                    something: 123,
                };
                var key = "something";
                var expect = false;
                var what = 124;
                var result = _.ld.contains(d, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
        });
        describe('multi value', function() {
            it('string/"" - contained', function() {
                var d = {
                    something: [ "a", "b", "" ],
                };
                var key = "something";
                var expect = true;
                var what = "";
                var result = _.ld.contains(d, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('number/0 - contained', function() {
                var d = {
                    something: [ 12, 123, 0, ],
                };
                var key = "something";
                var expect = true;
                var what = 0;
                var result = _.ld.contains(d, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('string - contained', function() {
                var d = {
                    something: [ "a", "b" ],
                };
                var key = "something";
                var expect = true;
                var what = "a";
                var result = _.ld.contains(d, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('number - contained', function() {
                var d = {
                    something: [ 12, 123, ],
                };
                var key = "something";
                var expect = true;
                var what = 123;
                var result = _.ld.contains(d, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('string - not contained', function() {
                var d = {
                    something: [ "a", "c" ],
                };
                var key = "something";
                var expect = false;
                var what = "b";
                var result = _.ld.contains(d, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('number - not contained', function() {
                var d = {
                    something: [ 123, 12345 ],
                };
                var key = "something";
                var expect = false;
                var what = 124;
                var result = _.ld.contains(d, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
        });
    });
})
