/*
 *  FirmataSoundSensor.js
 *
 *  David Janes
 *  IOTDB
 *  2014-05-01
 */

"use strict";

var iotdb = require("iotdb")
var attribute = iotdb.attribute

exports.Model = iotdb.make_model('FirmataSoundSensor')
    .product("http://www.seeedstudio.com/depot/Grove-Sound-Sensor-p-752.html")
    .help("make sure to set initd.pin")
    .attribute(
        attribute.make_unit(":sound")
            .reading()
    )
    .driver_identity(":firmata")
    .driver_setup(function(paramd) {
        paramd.initd.pins = "value:mode=analog-input"
    })
    .make()
    ;
