/*
 *  id.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-03
 *
 *  Things related to identifiers
 *
 *  Copyright [2013-2015] [David P. Janes]
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

var crypto = require('crypto');
var _ = require("../helpers");

/**
 *  Unique thing
 */
var _thing_urn_unique = function() {
    var parts = [ "urn", "iotdb", "thing" ];
    for (var ai in arguments) {
        parts.push(encodeURIComponent(arguments[ai]));
    }

    return parts.join(":");
};

/**
 *  Unique thing, but hashing required of last com
 */
var _thing_urn_unique_hash = function() {
    var parts = [ "urn", "iotdb", "thing" ];
    for (var ai = 0; ai < arguments.length - 1; ai++) {
        parts.push(encodeURIComponent(arguments[ai]));
    }

    var hasher = crypto.createHash('md5');
    hasher.update(arguments[ai - 1]);
    parts.push(hasher.digest("hex"));

    return parts.join(":");
};

/**
 *  Unique on this network
 */
var _thing_urn_network = function() {
    var hasher = crypto.createHash('md5');
    hasher.update("some-network-id");

    var parts = [ "urn", "iotdb", "thing" ];
    for (var ai in arguments) {
        parts.push(encodeURIComponent(arguments[ai]));
        hasher.update("" + arguments[ai]);
    }

    parts.push(hasher.digest("hex"));

    return parts.join(":");
};

/**
 *  Unique on this machine
 */
var _thing_urn_machine = function() {
    var hasher = crypto.createHash('md5');
    hasher.update("some-machine-id");

    var parts = [ "urn", "iotdb", "thing" ];
    for (var ai in arguments) {
        parts.push(encodeURIComponent(arguments[ai]));
        hasher.update("" + arguments[ai]);
    }

    parts.push(hasher.digest("hex"));

    return parts.join(":");
};

exports.id = {
    thing_urn: {
        unique: _thing_urn_unique,
        unique_hash: _thing_urn_unique_hash,
        network_unique: _thing_urn_network,
        machine_unique: _thing_urn_machine,
    },
};
