/*
 *  version.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-02-13
 *
 *  Copyright [2013-2016] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";


var semver = require('semver');
var _ = require("../helpers");

var _die = function(error, paramd) {
    if (!error) {
        return;
    }

    console.log("#######################");
    console.log("## " + _.error.message(error));
    console.log("## ");

    if (paramd.satisfies) {
        console.log("## Expected Version: " + paramd.satisfies);
    }
    if (paramd.version) {
        console.log("## Got Version: " + paramd.version);
    }
    if (paramd.cause) {
        console.log("## Cause: " + paramd.cause);
    }

    console.log("## ");
    console.log("#######################");

    process.exit(1);
};

var _check = function(paramd, callback) {
    if (!paramd.version) {
        return callback(null, null);
    }

    if (paramd.satisfies && !semver.satisfies(paramd.version, paramd.satisfies)) {
        return callback(new Error(paramd.error || "Version not satisfied"), paramd);
    }

    return callback(null, null);
};

var check_node = function (callback) {
    _check({
        message: "Bad Node.JS Version",
        version: process.versions.node,
        satisfies: ">=4.0.0",
        cause: "Older Node.JS installed. Upgrade your version of Node.JS to something more modern",
    }, callback || _die);
};

exports.version = {
    check: {
        node: check_node,
    },
};
