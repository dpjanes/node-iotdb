/*
 *  things/abstract/stove-oven.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-05
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('AbstractStoveOven')
    .attribute(
        iotdb.make_boolean(':on')
            .control()
    )
    .make_attribute_reading('on', 'on-value')
    .attribute(
        iotdb.make_integer(':temperature')
            .control()
            .unit("temperature.si.celsius")
            .minimum(0)
            .maximum(300)
    )
    .make_attribute_reading('temperature', 'temperature-value')
    .make();
