/*
 *  iotdb.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-06
 */

"use strict";

const path = require("path");

const iotdb = require("../../iotdb");
const keystore = require("../../keystore");

let _keystore;
iotdb.shims.keystore(() => {
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
});
