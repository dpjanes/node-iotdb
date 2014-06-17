/*
 *  things/abstract/tv.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-07
 *
 *  A simple TV set
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('AbstractTV')
    .attribute(
        iotdb.make_boolean(":on")
            .control()
    )
    .attribute(
        iotdb.make_integer(":channel")
            .control()
            .minimum(1)
    )
    .attribute(
        iotdb.make_unit(":volume")
            .control()
    )
    .attribute(
        iotdb.make_string(":band")
            .control()
            .enumeration([ "Cable", "Video 1", "Video 2", "HDMI 1", "HDMI 2", "HDMI 3" ]) 
    )
    .make()
    ;
