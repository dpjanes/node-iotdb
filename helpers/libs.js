/*
 *  libs.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-15
 *
 *  Define common libraries
 *
 *  Copyright [2013-2014] [David P. Janes]
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

var color = require("./color");
var temperature = require("./temperature");
var parse_link = require("./parse_link");

exports.libs = {
    Color: color.Color,
    temperature: temperature.temperature,
    http: {
        parse_link: parse_link.parse_link
    }
};
