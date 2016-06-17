/*
 *  is.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-04-15
 *
 *  Test types
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

const _ = require("iotdb-helpers");

exports.is = {
    Thing: (o) => o && o._isThing,
    Model: (o) => o && o._isModel,
    ThingArray: (o) => o && o._isThingArray,
    Transport: (o) => o && o._isTransport,
    Transporter: (o) => o && o._isTransport,
    Bridge: (o) => o && o._isBridge,
    FindKey: (o) => _.is.String(o) || _.is.Dictionary(o),
};
