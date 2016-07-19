/*
 *  test_iotdb_id.js
 *
 *  David Janes
 *  IOTDB
 *  2016-07-15
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var iotdb = require("../iotdb");
var settings = require("../settings");

describe('test_iotdb_id', function() {
    describe('returns first', function() {
        let ok;
        beforeEach(function() {
            ok = iotdb.shims.settings(() => ({
                get: ( key, otherwise ) => {
                    if (key === "/homestar/runner/keys/homestar/key") {
                        return "first";
                    } else {
                        return otherwise;
                    }
                }
            }));
        });
        afterEach(function() {
            iotdb.shims.settings(ok);
        });
        it('returns first', function() {
            const metad = iotdb.controller_meta()
            assert.strictEqual(metad["iot:runner.id"], "first");
        });
    });
    describe('returns second', function() {
        let ok;
        beforeEach(function() {
            ok = iotdb.shims.settings(() => ({
                get: ( key, otherwise ) => {
                    if (key === "/homestar/runner/keys/homestar/key") {
                        return otherwise;
                    } else if (key === "/machine_id") {
                        return "second";
                    } else {
                        return otherwise;
                    }
                }
            }));
        });
        afterEach(function() {
            iotdb.shims.settings(ok);
        });
        it('returns second', function() {
            const metad = iotdb.controller_meta()
            assert.strictEqual(metad["iot:runner.id"], "second");
        });
    });
    it('has timestamp', function() {
        const metad = iotdb.controller_meta()
        const timestamp = metad["iot:runner.timestamp"];

        assert.ok(timestamp <= _.timestamp.make());
        assert.ok(_.is.Timestamp(timestamp));
    });
});
