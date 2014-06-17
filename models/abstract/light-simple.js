/*
 *  things/abstract/light-simple.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-01
 *
 *  A simple lightbulb that can be turned on and off
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('AbstractLightSimple')
    .attribute(
        iotdb.make_boolean("on")
            .control()
    )
    .make()
    ;
