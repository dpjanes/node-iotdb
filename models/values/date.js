/*
 *  things/values/date.js
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

exports.Model = iotdb.make_model('AbstractValueDate')
    .attribute(
        attribute.make_date("value")
    )
    .make()
    ;
