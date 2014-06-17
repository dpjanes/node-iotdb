/*
 *  temperature.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-01-05
 *
 *  Helper functions for temperature. We
 *  need this so often, we might as well
 *  make it part of the library
 *
 */

var c2f = function(c) {
    return c * 9 / 5 + 32;
}

var f2c = function(f) {
    return ( f - 32 ) * 5 / 9;
}

exports.temperature = {
    c2f: c2f,
    f2c: f2c
}
