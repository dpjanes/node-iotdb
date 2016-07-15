/*
 *  test_hash.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-01
 *  "The Frickin Future"
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

describe('test_hash', function() {
    describe('md5', function() {
        it('empty', function() {
            var value = "";
            var result = _.hash.md5(value);
            var expect = 'd41d8cd98f00b204e9800998ecf8427e';

            assert.strictEqual(result, expect);
        });
        it('string', function() {
            var value = "now is the time for all";
            var result = _.hash.md5(value);
            var expect = '9748a1abafb2a097bef146f489ab4cd3';

            assert.strictEqual(result, expect);
        });
        it('complex', function() {
            var value = [ "now is the time", "for all" ];
            var result = _.hash.md5(value);
            var expect = '0bedbd5a12866adaac42deb6b5efc869';

            assert.strictEqual(result, expect);
        });
    });
    describe('sha1', function() {
        it('empty', function() {
            var value = "";
            var result = _.hash.sha1(value);
            var expect = 'da39a3ee5e6b4b0d3255bfef95601890afd80709';

            assert.strictEqual(result, expect);
        });
        it('string', function() {
            var value = "now is the time for all";
            var result = _.hash.sha1(value);
            var expect = '090a137e8c4ec8dc57699f20a13933cbd7620531';

            assert.strictEqual(result, expect);
        });
        it('complex', function() {
            var value = [ "now is the time", "for all" ];
            var result = _.hash.sha1(value);
            var expect = 'dd247543bd3d9bf8e3d50a6100cfda0b1ba7d8c3';

            assert.strictEqual(result, expect);
        });
    });
    describe('sha256', function() {
        it('empty', function() {
            var value = "";
            var result = _.hash.sha256(value);
            var expect = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

            assert.strictEqual(result, expect);
        });
        it('string', function() {
            var value = "now is the time for all";
            var result = _.hash.sha256(value);
            var expect = 'b52f56d3e60905f4dc70b62f2c78fe7b16f018238c80616ee4f1398f7a1dc96e';

            assert.strictEqual(result, expect);
        });
        it('complex', function() {
            var value = [ "now is the time", "for all" ];
            var result = _.hash.sha256(value);
            var expect = 'b2e43c30f1ffc388debf6de6563f0a55ca84951fe47951b49b13425626f0d3ed';

            assert.strictEqual(result, expect);
        });
    });
    describe('sha512', function() {
        it('empty', function() {
            var value = "";
            var result = _.hash.sha512(value);
            var expect = 'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e';

            assert.strictEqual(result, expect);
        });
        it('string', function() {
            var value = "now is the time for all";
            var result = _.hash.sha512(value);
            var expect = '440f5ee19f4b316c403744673d9c1ad76e1de573a8c7fbde992542b96a65f8ccbfa0b81f86e792a8d2f0eeb9ac23d7d74b9f0e0559e753e9775a8e76199f78d7';

            assert.strictEqual(result, expect);
        });
        it('complex', function() {
            var value = [ "now is the time", "for all" ];
            var result = _.hash.sha512(value);
            var expect = 'b24102b0ab662614b59060a262ecf1aa4be4486aefe04279e2b2c9c6c9323ef5c1622355a6205a4850d7b9fc2dce102a8c0a1173143b570e5dbab96f16c22c7b';

            assert.strictEqual(result, expect);
        });
    });
    describe('short', function() {
        it('empty', function() {
            var value = "";
            var result = _.hash.short(value);
            var expect = '1B2M2Y8A';

            assert.strictEqual(result, expect);
        });
        it('string', function() {
            var value = "now is the time for all";
            var result = _.hash.short(value);
            var expect = 'l0ihq6-y';

            assert.strictEqual(result, expect);
        });
        it('complex', function() {
            var value = [ "now is the time", "for all" ];
            var result = _.hash.short(value);
            var expect = 'qOpBe4vs';

            assert.strictEqual(result, expect);
        });
    });
});

