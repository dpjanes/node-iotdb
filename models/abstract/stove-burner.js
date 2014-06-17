/*
 *  things/abstract/stove-burner.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-05
 *
 *  The burner of a stove
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('AbstractStoveBurner')
    .attribute(
        iotdb.make_number(":intensity")
            .control()
            .minimum(0)
            .minimum(10)
    )
    .make()
    ;
