/*
 *  test_ld.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-24
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

/* --- tests --- */
describe('test_ld', function() {
    describe('expand', function() {
        describe('string', function() {
            it('simple with iot namespace', function() {
                var src = "iot:value";
                var expanded = _.ld.expand(src);
                var expected = "https://iotdb.org/pub/iot#value"

                assert.strictEqual(expanded, expected);
            });
            it('no namespace', function() {
                var src = "value";
                var expanded = _.ld.expand(src);
                var expected = "value";

                assert.strictEqual(expanded, expected);
            });
            it('no namespace but with colon', function() {
                var src = ":value";
                var expanded = _.ld.expand(src);
                var expected = ":value";

                assert.strictEqual(expanded, expected);
            });
            it('no namespace, string default', function() {
                var src = "value";
                var expanded = _.ld.expand(src, "iot:");
                var expected = "https://iotdb.org/pub/iot#value"

                assert.strictEqual(expanded, expected);
            });
            it('no namespace but with colon, string default', function() {
                var src = ":value";
                var expanded = _.ld.expand(src, "iot:");
                var expected = "https://iotdb.org/pub/iot#value"

                assert.strictEqual(expanded, expected);
            });
            it('with namespace, string default (expect to be ignorned)', function() {
                var src = "iot-unit:value";
                var expanded = _.ld.expand(src, "iot:");
                var expected = "https://iotdb.org/pub/iot-unit#value"

                assert.strictEqual(expanded, expected);
            });
        });
    });
    describe('compact', function() {
    });
    describe('patchup', function() {
    });
    describe('set', function() {
    });
    describe('first', function() {
        describe('no dictionary', function() {
            it('undefined', function() {
                var valued = undefined;
                var key = "something";
                var expect = "otherwise";
                var otherwise = "otherwise";
                var result = _.ld.first(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('null', function() {
                var valued = null;
                var key = "something";
                var expect = "otherwise";
                var otherwise = "otherwise";
                var result = _.ld.first(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('number', function() {
                var valued = 1;
                var key = "something";
                var expect = "otherwise";
                var otherwise = "otherwise";

                assert.throws(function() {
                    _.ld.first(valued, key, otherwise);
                }, Error);
            });
        });
        describe('missing', function() {
            it('missing', function() {
                var valued = {};
                var key = "something";
                var expect = undefined;
                var otherwise = undefined;
                var result = _.ld.first(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('missing with null default', function() {
                var valued = {};
                var key = "something";
                var expect = null;
                var otherwise = null;
                var result = _.ld.first(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('missing with string default', function() {
                var valued = {};
                var key = "something";
                var expect = "else";
                var otherwise = "else";
                var result = _.ld.first(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
        });
        describe('single value', function() {
            it('string', function() {
                var valued = {
                    something: "a",
                };
                var key = "something";
                var expect = "a";
                var otherwise = null;
                var result = _.ld.first(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('number', function() {
                var valued = {
                    something: 123,
                };
                var key = "something";
                var expect = 123;
                var otherwise = null;
                var result = _.ld.first(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('dictionary', function() {
                var valued = {
                    something: { a: 1 },
                };
                var key = "something";
                var expect = { a: 1 };
                var otherwise = null;
                var result = _.ld.first(valued, key, otherwise);

                assert.ok(_.is.Equal(result, expect));
            });
        });
        describe('multi value', function() {
            it('string', function() {
                var valued = {
                    something: [ "a", "b", ],
                };
                var key = "something";
                var expect = "a";
                var otherwise = null;
                var result = _.ld.first(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('number', function() {
                var valued = {
                    something: [ 123, 456 ],
                };
                var key = "something";
                var expect = 123;
                var otherwise = null;
                var result = _.ld.first(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
        });
    });
    describe('list', function() {
        describe('no dictionary', function() {
            it('undefined', function() {
                var valued = undefined;
                var key = "something";
                var expect = "otherwise";
                var otherwise = "otherwise";
                var result = _.ld.list(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('null', function() {
                var valued = null;
                var key = "something";
                var expect = "otherwise";
                var otherwise = "otherwise";
                var result = _.ld.list(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('number', function() {
                var valued = 1;
                var key = "something";
                var expect = "otherwise";
                var otherwise = "otherwise";

                assert.throws(function() {
                    _.ld.list(valued, key, otherwise);
                }, Error);
            });
        });
        describe('missing', function() {
            it('missing', function() {
                var valued = {};
                var key = "something";
                var expect = undefined;
                var otherwise = undefined;
                var result = _.ld.list(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('missing with null default', function() {
                var valued = {};
                var key = "something";
                var expect = null;
                var otherwise = null;
                var result = _.ld.list(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
            it('missing with string default', function() {
                var valued = {};
                var key = "something";
                var expect = "else";
                var otherwise = "else";
                var result = _.ld.list(valued, key, otherwise);

                assert.strictEqual(result, expect);
            });
        });
        describe('single value', function() {
            it('string', function() {
                var valued = {
                    something: "a",
                };
                var key = "something";
                var expect = [ "a" ];
                var otherwise = null;
                var result = _.ld.list(valued, key, otherwise);

                assert.ok(_.is.Equal(result, expect));
            });
            it('number', function() {
                var valued = {
                    something: 123,
                };
                var key = "something";
                var expect = [ 123 ];
                var otherwise = null;
                var result = _.ld.list(valued, key, otherwise);

                assert.ok(_.is.Equal(result, expect));
            });
            it('dictionary', function() {
                var valued = {
                    something: { a: 1 },
                };
                var key = "something";
                var expect = [ { a: 1 } ];
                var otherwise = null;
                var result = _.ld.list(valued, key, otherwise);

                assert.ok(_.is.Equal(result, expect));
            });
        });
        describe('multi value', function() {
            it('string 1', function() {
                var valued = {
                    something: [ "a", ],
                };
                var key = "something";
                var expect = [ "a", ];
                var otherwise = null;
                var result = _.ld.list(valued, key, otherwise);

                assert.ok(_.is.Equal(result, expect));
            });
            it('string 2', function() {
                var valued = {
                    something: [ "a", "b", ],
                };
                var key = "something";
                var expect = [ "a", "b" ];
                var otherwise = null;
                var result = _.ld.list(valued, key, otherwise);

                assert.ok(_.is.Equal(result, expect));
            });
            it('number', function() {
                var valued = {
                    something: [ 123, 456 ],
                };
                var key = "something";
                var expect = [ 123, 456 ];
                var otherwise = null;
                var result = _.ld.list(valued, key, otherwise);

                assert.ok(_.is.Equal(result, expect));
            });
        });
    });
    describe('contains', function() {
        describe('no dictionary', function() {
            it('undefined', function() {
                var valued = undefined;
                var key = "something";
                var expect = false;
                var what = "what";
                var result = _.ld.contains(valued, key, what);

                assert.strictEqual(result, expect);
            });
            it('null', function() {
                var valued = null;
                var key = "something";
                var expect = false;
                var what = "what";
                var result = _.ld.contains(valued, key, what);

                assert.strictEqual(result, expect);
            });
            it('number', function() {
                var valued = 1;
                var key = "something";
                var expect = false;
                var what = "what";

                assert.throws(function() {
                    _.ld.contains(valued, key, what);
                }, Error);
            });
        });
        describe('missing', function() {
            it('missing', function() {
                var valued = {};
                var key = "something";
                var expect = false;
                var what = undefined;
                var result = _.ld.contains(valued, key, what);

                assert.strictEqual(result, expect);
            });
        });
        describe('single value', function() {
            it('string - contained', function() {
                var valued = {
                    something: "a",
                };
                var key = "something";
                var expect = true;
                var what = "a";
                var result = _.ld.contains(valued, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('number - contained', function() {
                var valued = {
                    something: 123,
                };
                var key = "something";
                var expect = true;
                var what = 123;
                var result = _.ld.contains(valued, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('string - not contained', function() {
                var valued = {
                    something: "a",
                };
                var key = "something";
                var expect = false;
                var what = "b";
                var result = _.ld.contains(valued, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('number - not contained', function() {
                var valued = {
                    something: 123,
                };
                var key = "something";
                var expect = false;
                var what = 124;
                var result = _.ld.contains(valued, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
        });
        describe('multi value', function() {
            it('string/"" - contained', function() {
                var valued = {
                    something: [ "a", "b", "" ],
                };
                var key = "something";
                var expect = true;
                var what = "";
                var result = _.ld.contains(valued, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('number/0 - contained', function() {
                var valued = {
                    something: [ 12, 123, 0, ],
                };
                var key = "something";
                var expect = true;
                var what = 0;
                var result = _.ld.contains(valued, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('string - contained', function() {
                var valued = {
                    something: [ "a", "b" ],
                };
                var key = "something";
                var expect = true;
                var what = "a";
                var result = _.ld.contains(valued, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('number - contained', function() {
                var valued = {
                    something: [ 12, 123, ],
                };
                var key = "something";
                var expect = true;
                var what = 123;
                var result = _.ld.contains(valued, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('string - not contained', function() {
                var valued = {
                    something: [ "a", "c" ],
                };
                var key = "something";
                var expect = false;
                var what = "b";
                var result = _.ld.contains(valued, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
            it('number - not contained', function() {
                var valued = {
                    something: [ 123, 12345 ],
                };
                var key = "something";
                var expect = false;
                var what = 124;
                var result = _.ld.contains(valued, key, what);

                assert.ok(_.is.Equal(result, expect));
            });
        });
    });
    describe('remove', function() {
    });
    describe('extend', function() {
    });
})
