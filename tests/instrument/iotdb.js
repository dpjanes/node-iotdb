/*
 *  iotdb.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-06
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");

var path = require("path");

var iotdb = require("../../iotdb");
var keystore = require("../../keystore");

var _keystore;
iotdb.keystore = function() {
    if (!_keystore) {
        _keystore = new keystore.Keystore();
        _keystore.d = {
            "modules": {
                "homestar-test": path.join(__dirname, "./homestar-test"),
                "homestar-broken": path.join(__dirname, "./homestar-broken"),
            }
        };
    }

    return _keystore;
};
