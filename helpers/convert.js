/*
 *  convert.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-07-20
 *
 *  Convert values from one type to another
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

var _ = require("../helpers");

var conversions = [
    {
        from: 'iot-unit:temperature.imperial.fahrenheit',
        to: 'iot-unit:temperature.si.celsius',
        convert: function(paramd) {
            return ( paramd.value - 32 ) / 1.8;
        },
    },
    {
        from: 'iot-unit:temperature.si.celsius',
        to: 'iot-unit:temperature.imperial.fahrenheit',
        convert: function(paramd) {
            return paramd.value * 1.8 + 32;
        },
    },
    {
        from: 'iot-unit:temperature.si.celsius',
        to: 'iot-unit:temperature.si.kelvin',
        convert: function(paramd) {
            return paramd.value + 273.15;
        },
    },
    {
        from: 'iot-unit:temperature.si.kelvin',
        to: 'iot-unit:temperature.si.celsius',
        convert: function(paramd) {
            return paramd.value - 273.15;
        },
    },
    {
        from: 'iot-unit:temperature.si.kelvin',
        to: 'iot-unit:temperature.si.mired',
        convert: function(paramd) {
            if (!paramd.value) {
                return 0;
            }

            return 1000000.0 / paramd.value;
        },
    },
    {
        from: 'iot-unit:temperature.si.mired',
        to: 'iot-unit:temperature.si.kelvin',
        convert: function(paramd) {
            if (!paramd.value) {
                return 0;
            }

            return 1000000.0 / paramd.value;
        },
    },
    {
        from: 'iot-unit:math.fraction.percent',
        to: 'iot-unit:math.fraction.unit',
        convert: function(paramd) {
            return paramd.value / 100;
        },
    },
    {
        from: 'iot-unit:math.fraction.unit',
        to: 'iot-unit:math.fraction.percent',
        convert: function(paramd) {
            return paramd.value * 100;
        },
    },
];

/**
 */
var _find = function(from, to) {
    var ci;
    var cd;

    // first
    for (ci in conversions) {
        cd = conversions[ci];
        if ((cd.from !== from) || (cd.to !== to)) {
            continue;
        }

        return [ cd ];
    }

    // search
    for (ci in conversions) {
        cd = conversions[ci];
        if (cd.from !== from) {
            continue;
        }

        var nds = _find(cd.to, to);
        if (nds) {
            nds.splice(0, 0, cd);
            return nds;
        }
    }
};

/**
 */
var convert = function(paramd) {
    paramd = _.defaults(paramd, {
        precision: true,
        original: paramd.value,
    });

    // no conversion
    if (paramd.from === paramd.to) {
        return paramd.value;
    }

    // find a conversion
    var cds = _find(paramd.from, paramd.to);
    if (!cds) {
        throw new Error("no conversion found from '" + paramd.from + "' to '" + paramd.to + "'");
    }

    // convert
    cds.map(function(cd) {
        paramd.value = cd.convert(paramd);
    });

    if (paramd.precision === true) {
        var p = 0;

        var source = "" + paramd.original;
        var dotx = source.indexOf('.');
        if (dotx !== -1) {
            p = source.length - dotx - 1;
        }

        return parseFloat(paramd.value.toFixed(Math.max(p, 3)));
    } else if (_.is.Number(paramd.precision)) { 
        return parseFloat(paramd.value.toFixed(paramd.precision));
    } else {
        return paramd.value;
    }
};

/**
 */
var add = function(paramd) {
    conversions.push(paramd);
};

/**
 *  API
 */
exports.convert = {
    convert: convert,
    add: add,
};
