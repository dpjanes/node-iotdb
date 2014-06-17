/*
 *  things/values/unit.js
 *
 *  David Janes
 *  IOTDB
 *  2014-04-21
 *
 *  An number value between 0 and 1
 */

"use strict";

var iotdb = require("iotdb")
var attribute = iotdb.attribute

exports.Model = iotdb.make_model('AbstractValueUnit')
    .attribute(
        attribute.make_number("value")
            .minimum(0)
            .maximum(1)
            .unit(":math.fraction.unit")
    )
    .make()
    ;
