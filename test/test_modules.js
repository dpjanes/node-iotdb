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

require('./instrument/iotdb');

describe('test_modules', function() {
    after('', function() {
        modules.shims.reset();
    });

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
            // assert.strictEqual(binding.model_code, 'test');
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
    describe('use', function() {
        beforeEach('before', function() {
            modules.shims.require(name => require("./instrument/" + name));
        });
        afterEach('after', function() {
            modules.shims.require(require);
        });
        it('one good argument', function() {
            modules.shims.reset();
            var m = modules.modules();
            m.use("homestar-test");
        });
        it('one bad argument', function() {
            var m = modules.modules();
            assert.throws(() => {
                m.use("homestar-test-xxx")
            }, Error);
        });
        it('two good argument', function() {
            var m = modules.modules();
            m.use("test", require("./instrument/homestar-test"));
        });
        it('second argument does not exist', function() {
            var m = modules.modules();
            assert.throws(() => {
                m.use("test", require("./instrument/homestar-test-xxx"));
            }, Error);
        });
        it('second argument is string', function() {
            var m = modules.modules();
            assert.throws(() => {
                m.use("test", "./instrument/homestar-test-xxx");
            }, Error);
        });
        it('module is called', function() {
            const m = modules.modules();
            let _use = false;
            let _setup = false;

            m.use("test", {
                use: () => _use = true,
                setup: () => _setup = true,
            });

            assert.ok(_use);
            assert.ok(_setup);
        });
        it('module is registered', function() {
            modules.shims.reset();
            const m = modules.modules();
            assert.ok(!m.module("test"));
            m.use("test", {});
            assert.ok(m.module("test"));
        });
        it('iotdb version', function() {
            let _use = false;
            let _setup = false;

            iotdb.use("test", {
                use: () => _use = true,
                setup: () => _setup = true,
            });

            assert.ok(_use);
            assert.ok(_setup);
        });
    });
});
