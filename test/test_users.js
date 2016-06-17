/*
 *  test_users.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-06
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var _ = require("../helpers")

var iotdb = require("../iotdb");
var things = require("../things");
var keystore = require("../keystore");

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
