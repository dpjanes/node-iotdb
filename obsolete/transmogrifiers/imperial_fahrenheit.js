/*
 *  transmogrifiers/imperial_fahrenheit.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-11-21
 *
 *  Convert all temperatures to Fahrenheit.
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

var iotdb = require('iotdb');
var _ = require("../helpers");
var transmogrifier = require('../transmogrifier');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'transmogrifier/imperial/fahrenheit',
});

/**
 */
var ImperialFahrenheitTransmogrifier = function (initd) {
    var self = this;

    self.___initd = _.defaults(initd, {});
    self.___xdd = {};
};

ImperialFahrenheitTransmogrifier.prototype = new transmogrifier.Transmogrifier();
ImperialFahrenheitTransmogrifier.prototype.transmogrifier_id = "iot-transmogrifier:imperial/fahrenheit";

/**
 *  See {@link Transmogrifier#___make Transmogrifier.___make}
 */
ImperialFahrenheitTransmogrifier.prototype.___make = function () {
    return new ImperialFahrenheitTransmogrifier(this.___initd);
};

/**
 *  See {@link Transmogrifier#___attach Transmogrifier.___attach}
 */
ImperialFahrenheitTransmogrifier.prototype.___attach = function () {
    var self = this;
    var thing = self.___wrapped;
    var attributes = thing.attributes();

    var unit_key = _.ld.expand("iot:unit");
    var unit_celsius = _.ld.expand("iot-unit:temperature.si.celsius");
    var unit_kelvin = _.ld.expand("iot-unit:temperature.si.kelvin");
    var unit_fahrenheit = _.ld.expand("iot-unit:temperature.imperial.fahrenheit");

    var xd_celsius = function (attribute) {
        attribute = _.clone(attribute);
        attribute[unit_key] = unit_fahrenheit;
        return {
            attribute: attribute,
            set: function (F) {
                return (F - 32) * 5 / 9;
            },
            get: function (C) {
                return C * 9 / 5 + 32;
            }
        };
    };
    var xd_kelvin = function (attribute) {
        attribute = _.clone(attribute);
        attribute[unit_key] = unit_fahrenheit;
        return {
            attribute: attribute,
            set: function (F) {
                return (F - 32) * 5 / 9 + 273.15;
            },
            get: function (K) {
                return (K - 273.15) * 1.8 + 32;
            }
        };
    };

    for (var ai in attributes) {
        var attribute = attributes[ai];
        var code = attribute.get_code();
        var unit = _.ld.first(attribute, unit_key);
        if (unit === unit_celsius) {
            self.___xdd[code] = xd_celsius(attribute);
        } else if (unit === unit_kelvin) {
            self.___xdd[code] = xd_kelvin(attribute);
        }
    }
};

exports.Transmogrifier = ImperialFahrenheitTransmogrifier;
