/*
 *  test_bridge.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-06
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var bridge = require("../bridge");

describe('test_bridge', function() {
    describe('underlying', function() {
        it('constructor', function() {
            var b = new bridge.Bridge();

            assert.ok(!b.native);
            assert.ok(_.is.Dictionary(b.initd));
            assert.ok(_.is.Empty(b.initd));
            assert.ok(_.is.Dictionary(b.connectd));

            assert.ok(_.is.Bridge(b));
        });
        it('data_in', function() {
            var paramd = {
                rawd: {
                    a: 1
                },
                cookd: {
                    b: 2
                },
            };

            var b = new bridge.Bridge();
            b.connectd.data_in(paramd);

            assert.strictEqual(paramd.cookd.a, 1);
            assert.strictEqual(paramd.cookd.b, 2);
            assert.strictEqual(paramd.rawd.a, 1);
            assert.strictEqual(paramd.rawd.b, undefined);
        });
        it('data_out', function() {
            var paramd = {
                rawd: {
                    a: 1
                },
                cookd: {
                    b: 2
                },
            };

            var b = new bridge.Bridge();
            b.connectd.data_out(paramd);

            assert.strictEqual(paramd.rawd.a, 1);
            assert.strictEqual(paramd.rawd.b, 2);
            assert.strictEqual(paramd.cookd.a, undefined);
            assert.strictEqual(paramd.cookd.b, 2);
        });
        /*
        it('name', function() {
            var b = new bridge.Bridge();
            assert.strictEqual(b.name(), "");
        });
        */
        it('discover', function() {
            var b = new bridge.Bridge();
            b.discover();
        });
        it('connect no arguments', function() {
            var b = new bridge.Bridge();
            assert.throws(function() {
                b.connect();
            }, Error);
        });
        it('connect dictionary', function() {
            var b = new bridge.Bridge();
            b.connect({});
        });
        it('disconnect', function() {
            var b = new bridge.Bridge();
            b.disconnect();
        });
        it('push no arguments', function() {
            var b = new bridge.Bridge();
            assert.throws(function() {
                b.push();
            }, Error);
        });
        it('push dictionary', function() {
            var b = new bridge.Bridge();
            assert.throws(function() {
                b.push({});
            }, Error);
        });
        it('push dictionary + function', function(done) {
            var b = new bridge.Bridge();
            b.push({}, done);
        });
        it('pull', function() {
            var b = new bridge.Bridge();
            b.pull();
        });
        it('meta', function() {
            var b = new bridge.Bridge();
            var meta = b.meta();
            assert.ok(_.is.Dictionary(meta));
            assert.ok(_.is.Empty(meta));
        });
        it('reachable', function() {
            var b = new bridge.Bridge();
            var reachable = b.reachable();
            assert.ok(reachable);
        });
        it('configure no arguments', function() {
            var b = new bridge.Bridge();
            assert.throws(function() {
                b.configure();
            }, Error);
        });
        it('configure dictionary', function() {
            var b = new bridge.Bridge();
            assert.throws(function() {
                b.configure({});
            }, Error);
        });
        it('configure express-like object', function() {
            var b = new bridge.Bridge();
            b.configure({
                put: _.noop,
                get: _.noop,
            });
        });
        it('discovered', function() {
            var b = new bridge.Bridge();
            assert.throws(function() {
                b.discovered();
            }, Error);
        });
        it('pulled', function() {
            var b = new bridge.Bridge();
            assert.throws(function() {
                b.pulled();
            }, Error);
        });
    });
});
