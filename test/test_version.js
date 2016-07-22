/*
 *  test_version.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-06
 */

"use strict";

var assert = require("assert")

var version = require("../helpers/version");
var _ = require("../helpers");

describe('test_version', function() {
    describe('current version', function() {
        it('should be ok!', function(done) {
            version.version.check.node();
            done();
        });
        it('should do callback', function(done) {
            version.version.check.node((error, paramd) => {
                assert.ok(!error);
                assert.ok(paramd);
                assert.strictEqual(paramd.version, process.versions.node);
                assert.ok(paramd.satisfies);
                done();
            });
        });
    });
    describe('out of date version', function() {
        beforeEach(function() {
            version.shims.version("0.12.3");
        });
        afterEach(function() {
            version.shims.version();
        });
        it('should fail', function() {
            assert.throws(() => {
                version.version.check.node();
            });
        });
        it('should do callback', function(done) {
            version.version.check.node((error, paramd) => {
                assert.ok(error);
                assert.ok(paramd);
                assert.strictEqual(paramd.version, "0.12.3");
                assert.ok(paramd.satisfies);
                done();
            });
        });
    });
});
