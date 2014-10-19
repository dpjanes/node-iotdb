/*
 *  interaction.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-10-19
 *
 *  Interact with the user. The idea being this stuff
 *  can be trapped
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

var util = require('util');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'interaction',
});

var Interaction = function () {
    var self = this;

    self.lines = ["", ];
};

Interaction.prototype.header = function () {
    var self = this;

    self.lines.push(util.format.apply(util.format, arguments));
};

Interaction.prototype.code = function () {
    var self = this;

    self.lines.push(util.format.apply(util.format, arguments));
};

Interaction.prototype.log = function () {
    var self = this;

    self.lines.push(util.format.apply(util.format, arguments));
};

Interaction.prototype.end = function () {
    var self = this;

    self.lines.push("");
    logger.info({
        interaction: self.lines.join("\n  ")
    });
};

exports.Interaction = Interaction;
