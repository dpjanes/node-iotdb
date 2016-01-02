/*
 *  test_error.js
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

describe('test_error', function() {
    describe('message', function() {
        it('empty', function() {
            var value = undefined;
            var result = _.error.message(value);
            var expect = null;

            assert.strictEqual(result, expect);
        });
        it('string', function() {
            var value = "an error";
            var result = _.error.message(value);
            var expect = "an error";

            assert.strictEqual(result, expect);
        });
        it('error', function() {
            var value = new Error("an error");
            var result = _.error.message(value);
            var expect = "an error";

            assert.strictEqual(result, expect);
        });
        it('bad with otherwise', function() {
            var value = 1234;
            var result = _.error.message(value, "an error");
            var expect = "an error";

            assert.strictEqual(result, expect);
        });
    });
});
