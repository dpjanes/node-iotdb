/*
 *  test_users.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-06
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var iotdb = require("../iotdb");

describe('test_users', function() {
    it('default owner', function() {
        assert.strictEqual(iotdb.users.owner(), null);
    });
    it('default authorize', function(done) {
        iotdb.users.authorize({}, function(error, authorized) {
            assert.strictEqual(error, null);
            assert.strictEqual(authorized, true);
            done();
        });
    });
});
