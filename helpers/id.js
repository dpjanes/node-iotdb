/*
 *  id.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-03
 *
 *  Things related to identifiers
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

const crypto = require('crypto');

const _safe = function (component) {
    return encodeURIComponent(component).replace('%', '$');
};

/**
 */
const machine_id = () => {
    const iotdb = require("../iotdb");
    const settings = iotdb.settings();
    // return settings.get("/homestar/runner/keys/homestar/key", settings.get("/machine_id", ""));
    return settings.get("/machine_id", "");
}

/**
 *  Unique thing
 */
const _thing_urn_unique = function () {
    const parts = ["urn", "iotdb", "thing"];
    for (let ai in arguments) {
        parts.push(_safe(arguments[ai]));
    }

    return parts.join(":");
};

/**
 *  Unique thing, but hashing required of last com
 */
const _thing_urn_unique_hash = function () {
    const parts = ["urn", "iotdb", "thing"];
    for (let ai = 0; ai < arguments.length - 1; ai++) {
        parts.push(_safe(arguments[ai]));
    }

    const hasher = crypto.createHash('md5');
    if (arguments.length) {
        hasher.update("" + arguments[arguments.length - 1]);
    }
    parts.push(hasher.digest("hex"));

    return parts.join(":");
};

/**
 *  Unique on this machine
 */
const _thing_urn_machine = function () {
    const hasher = crypto.createHash('md5');
    hasher.update(machine_id());

    const parts = ["urn", "iotdb", "thing"];
    for (let ai in arguments) {
        parts.push(_safe(arguments[ai]));
        hasher.update("" + arguments[ai]);
    }

    parts.push(hasher.digest("hex"));

    return parts.join(":");
};

exports.id = {
    machine_id: machine_id,
    thing_urn: {
        unique: _thing_urn_unique,
        unique_hash: _thing_urn_unique_hash,
        machine_unique: _thing_urn_machine,
    },
};
