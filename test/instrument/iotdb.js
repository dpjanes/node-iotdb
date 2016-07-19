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
const settings = require("../../settings");

let _settings;
iotdb.shims.settings(() => {
    if (!_settings) {
        _settings = new settings.Settings();
        _settings.d = {
            "modules": {
                "homestar-test": path.join(__dirname, "./homestar-test"),
                "homestar-broken": path.join(__dirname, "./homestar-broken"),
            }
        };
    }

    return _settings;
});
