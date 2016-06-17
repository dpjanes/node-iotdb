/*
 *  test_ld_extend.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-01
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

/* --- tests --- */
describe('test_ld_extend', function() {
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
});
