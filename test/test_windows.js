/*
 *  test_windows.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-06
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var _ = require("../helpers")

var windows = require('../windows');

var setup = function(HOME, USERPROFILE, callback) {
    var old_HOME = process.env.HOME;
    var old_USERPROFILE = process.env.USERPROFILE;

    if (!HOME) {
        delete process.env.HOME;
    } else {
        process.env.HOME = HOME;
    }

    if (!USERPROFILE) {
        delete process.env.USERPROFILE;
    } else {
        process.env.USERPROFILE = USERPROFILE;
    }

    windows.setup();
    callback();

    process.env.HOME = old_HOME;
    process.env.USERPROFILE = old_USERPROFILE;

}

describe('test_windows', function() {
    it('!HOME !USERPROFILE', function(done) {
        // no change
        var HOME = undefined;
        var USERPROFILE = undefined;
        setup(HOME, USERPROFILE, function() {
            assert.strictEqual(HOME, process.env.HOME);
            done();
        });
    });
    it('HOME !USERPROFILE', function(done) {
        // no change
        var HOME = undefined;
        var USERPROFILE = undefined;
        setup(HOME, USERPROFILE, function() {
            assert.strictEqual(HOME, process.env.HOME);
            done();
        });
    });
    it('!HOME USERPROFILE', function(done) {
        // change!!!
        var HOME = undefined;
        var USERPROFILE = "/user/robert";
        setup(HOME, USERPROFILE, function() {
            assert.strictEqual(USERPROFILE, process.env.HOME);
            done();
        });
    });
    it('HOME USERPROFILE', function(done) {
        // no change
        var HOME = "/user/david";
        var USERPROFILE = "/user/robert";
        setup(HOME, USERPROFILE, function() {
            assert.strictEqual(HOME, process.env.HOME);
            done();
        });
    });
});
