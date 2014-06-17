/*
 *  things/abstract/radio.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-07
 *
 *  A simple Radio set
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('AbstractRadio')
    .attribute(
        iotdb.make_boolean(":on")
            .control()
    )
    .attribute(
        iotdb.make_unit(":volume")
            .control()
    )
    .attribute(
        iotdb.make_string(":band")
            .control()
            .enumeration([ "AM", "FM" ])
    )
    .attribute(
        iotdb.make_integer(":channel", "AM")
            .control()
            .description("AM Medium Band ITU2")
            .minimum(540)
            .minimum(1610)
            .unit("iot-unit:frequency.si.hertz")
            .unit_multiplier("1000")
            .active(function(paramd) {
                return paramd.stated['band'] === "AM";
            })
    )
    .make()
    ;
