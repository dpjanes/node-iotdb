/*
 *  FirmataInputUnit.js
 *
 *  David Janes
 *  IOTDB
 *  2014-04-30
 */

"use strict";

var iotdb = require("iotdb")
var attribute = iotdb.attribute

exports.Model = iotdb.make_model('FirmataInputUnit')
    .product("http://www.seeedstudio.com/depot/Grove-Rotary-Angle-Sensor-p-770.html")
    .help("make sure to set initd.pin")
    .attribute(
        attribute.make_unit(":value")
            .reading()
    )
    .driver_identity(":firmata")
    .driver_setup(function(paramd) {
        paramd.initd.pins = "value:mode=analog-input"
    })
    .make()
    ;
