/*
 *  is.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-04-15
 *
 *  Test types
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

var _ = require("../helpers");

/**
 */
var isThingArray = function (o) {
    return o && o._isThingArray;
};

/**
 */
var isTransport = function (o) {
    return o && o._isTransport;
};

/**
 */
var isModel = function (o) {
    return o && o._isModel;
};

/**
 */
var isThing = function (o) {
    return o && o._isThing;
};

exports.is = {
    Thing: isThing,
    Model: isModel,
    ThingArray: isThingArray,
    Transport: isTransport,
    Transporter: isTransport,
};
