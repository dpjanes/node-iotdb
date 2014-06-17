/*
 *  things/values/datetime.js
 *
 *  David Janes
 *  IOTDB
 *  2014-04-21
 *
 *  An number value
 */

"use strict";

var iotdb = require("iotdb")
var attribute = iotdb.attribute

exports.Model = iotdb.make_model('AbstractValueDatetime')
    .attribute(
        attribute.make_datetime("value")
    )
    .make()
    ;
