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

const semver = require('semver');
const _ = require("iotdb-helpers");

let _version = process.versions.node;

const _die = function (error, paramd) {
    if (!error) {
        return;
    }

    console.log("#######################");
    console.log("## " + _.error.message(error));
    console.log("## ");
    console.log("## Expected Version: " + paramd.satisfies);
    console.log("## Got Version: " + paramd.version);
    console.log("## Cause: " + paramd.cause);
    console.log("## ");
    console.log("#######################");

    throw error;
};

const _check = function (paramd, done) {
    if (!semver.satisfies(paramd.version, paramd.satisfies)) {
        return done(new Error("Version not satisfied: need " + paramd.satisfies + " got: " + paramd.version), paramd);
    }

    return done(null, paramd);
};

const check_node = function (done) {
    _check({
        message: "Bad Node.JS Version",
        version: _version,
        satisfies: ">=6.0.0",
        cause: "Older Node.JS installed. Upgrade your version of Node.JS to something more modern",
    }, done || _die);
};

exports.version = {
    check: {
        node: check_node,
    },
};
exports.shims = {
    version: v => {
        if (v) {
            _version = v;
        } else {
            _version = process.versions.node;
        }
    },
};
