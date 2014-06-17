/*
 *  things/values/string.js
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

exports.Model = iotdb.make_model('AbstractValueString')
    .attribute(
        attribute.make_string("value")
    )
    .make()
    ;
