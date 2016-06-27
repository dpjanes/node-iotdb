/*
 *  test_modules.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-06
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var _ = require("../helpers")

var iotdb = require("../iotdb");
var modules = require("../modules");
var keystore = require("../keystore");

require('./instrument/iotdb');

describe('test_modules', function() {
    describe('constructor', function() {
        it('global', function() {
            var m = modules.modules();
            var ms = m.modules();

            assert.ok(_.is.Array(ms));
            assert.strictEqual(ms.length, 1);
            assert.strictEqual(ms[0].module_name, 'homestar-test');

            var m2 = modules.modules();
            assert.strictEqual(m, m2);
        });
        /*
        it('new', function() {
            var m = new modules.Modules();
            var ms = m.modules();

            assert.ok(_.is.Array(ms));
            assert.strictEqual(ms.length, 1);
            assert.strictEqual(ms[0].module_name, 'homestar-test');
        });
        */
    });
    describe('name', function() {
        it('find by name', function() {
            var m = modules.modules();
            var module = m.module("homestar-test");

            assert.ok(module);
            assert.strictEqual(module.module_name, 'homestar-test');
        });
        it('find by name (missing)', function() {
            var m = modules.modules();
            var module = m.module("homestar-bad");

            assert.ok(_.is.Equal(module, undefined));
        });
    });
    describe('bindings', function() {
        it('returns expected values', function() {
            var m = modules.modules();
            var bindings = m.bindings();

            assert.ok(_.is.Array(bindings));
            assert.strictEqual(bindings.length, 3);

            var binding = bindings[0];
            assert.strictEqual(binding.model_code, 'test');
            assert.ok(binding.model);
            assert.ok(binding.bridge);
            assert.strictEqual(binding.bridge.module_name, 'homestar-test');
            assert.strictEqual(binding.bridge.bridge_name, 'test-bridge');
        });
        it('returns same bindings', function() {
            var m = modules.modules();
            var bindings1 = m.bindings();
            var bindings2 = m.bindings();

            // note no longer strict equal
            assert.deepEqual(bindings1, bindings2);
        });

    });
    describe('bridges', function() {
        it('returns something', function() {
            var m = modules.modules();
            var bridges = m.bridges();

            assert.ok(_.is.Array(bridges));
            assert.strictEqual(bridges.length, 1);

            var bridge = bridges[0];
            assert.strictEqual(bridge.module_name, 'homestar-test');
            assert.strictEqual(bridge.bridge_name, 'test-bridge');
        });
        it('returns same object', function() {
            var m = modules.modules();
            var bridges1 = m.bridges();
            var bridges2 = m.bridges();
            assert.strictEqual(bridges1, bridges2);
        });
    });
    describe('bridge', function() {
        it('find by name', function() {
            var m = modules.modules();
            var bridge = m.bridge("homestar-test");
            assert.ok(bridge);
        });
        it('find by name (missing)', function() {
            var m = modules.modules();
            var bridge = m.bridge("test-bridge");
            assert.ok(!bridge);
        });
    });
});
