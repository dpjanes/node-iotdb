/*
 *  libs.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-15
 *
 *  Define common libraries
 */

"use strict";

var color = require("./color")
var temperature = require("./temperature")

exports.libs = {
    Color: color.Color,
    temperature : temperature.temperature,
}
