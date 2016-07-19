/*
 *  test_settings.js
 *
 *  David Janes
 *  IOTDB
 *  2016-06-19
 */

"use strict";

const assert = require("assert")
const fs = require('fs');
const path = require('path');

const iotdb = require("../iotdb");
const _ = require("../helpers");
const settings = require("../settings");

describe('test_settings', function() {
    describe('paths', function() {
        let cwd;
        beforeEach(function() {
            cwd = process.cwd();
            process.chdir(path.join(__dirname, "instrument", "settings"));
        });
        afterEach(function() {
            process.chdir(cwd);
        });
        it('paths', function() {
            const paths = settings.shims.paths();
            assert.ok(_.is.Array(paths));

            paths
                .map(path => fs.statSync(path))
                .forEach(stbuf => assert.ok(stbuf.isDirectory()));
        });
    });
    describe('set', function() {
        it('initial state', function() {
            const s = settings.make();
            s.d = {};

            assert.deepEqual(s.get("/value", null), null);
        });
        it('changes value', function() {
            const s = settings.make();
            s.d = {};

            s.set("/value", 123);

            assert.deepEqual(s.get("/value", null), 123);
        });
        it('deep value', function() {
            const s = settings.make();
            s.d = {};

            s.set("/deep/value", 456);

            assert.deepEqual(s.get("/deep/value", null), 456);
            assert.deepEqual(s.get("/deep", null), { value: 456 });
        });
        it('emits', function() {
            const s = settings.make();
            s.d = {};

            s.set("/value", 123);
            s.on("changed", key => {
                assert.deepEqual(key, "/value");
            });
        });
    });
    it('instance', function() {
        const s1 = settings.instance();
        const s2 = settings.instance();

        assert.ok(s1);
        assert.strictEqual(s1, s2);
    });
});
