/*
 *  test_settings_set.js
 *
 *  David Janes
 *  IOTDB
 *  2016-09-08
 */

"use strict";

const assert = require("assert")
const fs = require('fs');
const path = require('path');

const iotdb = require("../iotdb");
const _ = require("../helpers");
const settings = require("../settings");

describe('test_settings', function() {
    describe('save', function() {
        let _filename = null;
        let _data = null;
        let _cwd = null;

        beforeEach(function() {
            _cwd = process.cwd();
            process.chdir(path.join(__dirname, "instrument", "settings"));

            settings.shims.writeFileSync((filename, data) => {
                _filename = filename;
                _data = data;
            });
        });
        afterEach(function() {
            process.chdir(_cwd);
            settings.shims.writeFileSync();
            _filename = null;
            _data = null;
        });

        it("exists", function(done) {
            settings.reset();
            const s = settings.instance();
            s.save("save", "b");
            process.nextTick(() => done());
        })
        it("correct value", function(done) {
            settings.reset();
            const s = settings.instance();
            assert.ok(!s.get("save"));

            s.save("save", "b");
            process.nextTick(() => {
                assert.deepEqual(JSON.parse(_data), { "save": "b" });
                done();
            });
        })
        it("staged on next tick", function(done) {
            settings.reset();
            const s = settings.instance();
            assert.ok(!s.get("save"));

            s.save("save", "b");
            s.save("bla", "c");
            process.nextTick(() => {
                assert.deepEqual(JSON.parse(_data), { "save": "b", "bla": "c" });
                done();
            });
        })
    });
});
