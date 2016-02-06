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

var _ = {
    is: require("./is").is,
    d: require("./d").d,
};

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
        add: 273.15,
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
        from: 'iot-unit:math.fraction.unit',
        to: 'iot-unit:math.fraction.percent',
        multiply: 100,
    },
];

/**
 *  This will return a path of conversion
 *  to convert from <from> to <to>
 */
var _find = function(from, to, froms) {
    var ci;
    var cd;

    // stop loops!
    if (froms.indexOf(from) !== -1) {
        return;
    }

    froms = froms.slice();
    froms.push(from);

    // matches right away
    for (ci in conversions) {
        cd = conversions[ci];
        if ((cd.from !== from) || (cd.to !== to)) {
            continue;
        }

        return [ cd ];
    }

    // do a depth-first search
    for (ci in conversions) {
        cd = conversions[ci];
        if (cd.from !== from) {
            continue;
        }

        var nds = _find(cd.to, to, froms);
        if (nds) {
            nds.splice(0, 0, cd);
            return nds;
        }
    }
};


/**
 *  This will "do the right thing" for add and multiply.
 *  It will also add an inverse function
 */
var _massage = function(cd) {
    var id;

    if (cd._massaged) {
        return;
    }

    cd._massaged = true;

    if (cd.add) {
        cd.convert = function(paramd) {
            return paramd.value + cd.add;
        };

        id = _.d.clone.shallow(cd);
        id.from = cd.to;
        id.to = cd.from;
        id._inverse = true;
        id.convert = function(paramd) {
            return paramd.value - cd.add;
        };

        conversions.push(id);
    } else if (cd.multiply) {
        cd.convert = function(paramd) {
            return paramd.value * cd.multiply;
        };

        id = _.d.clone.shallow(cd);
        id.from = cd.to;
        id.to = cd.from;
        id._inverse = true;
        id.convert = function(paramd) {
            return paramd.value / cd.multiply;
        };

        conversions.push(id);
    }
};

/**
 *  This will one time massage everything
 */
var _massaged = false;
var _massage_all = function() {
    if (_massaged) {
        return;
    }
    _massaged = true;
    conversions.map(_massage);
};

/**
 *  It's just horrible
 */
var _fixed = function(value, p) {
    var xvalue = value.toExponential();
    var xmatch = xvalue.match(/^(.*)e(.*)$/);
    // var mantissa = parseFloat(xmatch[1]);
    var exponent = parseInt(xmatch[2]);
    if (exponent < 0) {
        p -= exponent;
    }

    return parseFloat(value.toFixed(p));
};

/**
 */
var convert = function(paramd) {
    paramd = _.d.compose.shallow(paramd, {
        precision: true,
        original: paramd.value,
        from_power: 0,
        to_power: 0,
    });

    /*
    if (paramd.precision === true) {
        var ivalue = Math.round(paramd.value);
        if (ivalue === 0) {
            paramd.precision = 3;
        } else {
            paramd.precision = 3 + ("" + ivalue).length;
        }
    }
    */

    var result;

    // powers
    var from_match = paramd.from.match(/^(iot-unit:[^.]*[.][^.]*[.][^.]*)[.](-?\d+)/);
    if (from_match) {
        paramd.from = from_match[1];
        paramd.from_power = parseInt(from_match[2]);
    }

    var to_match = paramd.to.match(/^(iot-unit:[^.]*[.][^.]*[.][^.]*)[.](-?\d+)/);
    if (to_match) {
        paramd.to = to_match[1];
        paramd.to_power = parseInt(to_match[2]);
    }

    // no conversion
    if (paramd.from === paramd.to) {
        result = paramd.value;
    } else {
        _massage_all();

        // find a conversion
        var cds = _find(paramd.from, paramd.to, []);
        if (!cds) {
            return null;
            // throw new Error("no conversion found from '" + paramd.from + "' to '" + paramd.to + "'");
        }

        // console.log("conversions", cds);

        // convert
        cds.map(function(cd) {
            // console.log("OLD", paramd.value);
            paramd.value = cd.convert(paramd);
            // console.log("NEW", paramd.value);
        });

        if (paramd.precision === true) {
            var p = 0;

            var source = "" + paramd.original;
            var dotx = source.indexOf('.');
            if (dotx !== -1) {
                p = source.length - dotx - 1;
            }

            result = _fixed(paramd.value, Math.max(p, 3));
        } else if (_.is.Number(paramd.precision)) { 
            result = _fixed(paramd.value, paramd.precision);
        } else {
            result = paramd.value;
        }
    }

    if (paramd.from_power !== 0) {
        result *= Math.pow(10, paramd.from_power);
    }
    if (paramd.to_power !== 0) {
        result *= Math.pow(10, -paramd.to_power);
    }

    return result;
};

/**
 */
var add = function(paramd) {
    if (_.is.Array(paramd)) {
        paramd.map(add);
    } else if (_.is.Object(paramd)) {
        var cd = _.d.clone.shallow(paramd);
        _massage(cd);

        conversions.push(cd);
    } else {
        throw new Error("_.convert.add: unexpected argument type: " + paramd);
    }
};

/**
 *  API
 */
exports.convert = {
    convert: convert,
    add: add,
};
