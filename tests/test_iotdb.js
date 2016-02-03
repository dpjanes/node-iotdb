/*
 *  test_iotdb.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-03
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var _ = require("../helpers")

var iotdb = require("../iotdb");
var things = require("../things");
var keystore = require("../keystore");

require('./instrument/iotdb');

describe('test_iotdb', function() {
    describe('constructor', function() {
        it('global', function() {
            var iot = iotdb.iot()
        });
    });
});
