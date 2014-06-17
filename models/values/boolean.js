/*
 *  things/values/boolean.js
 *
 *  David Janes
 *  IOTDB
 *  2014-04-21
 *
 *  A boolean value
 */

"use strict";

var iotdb = require("iotdb")
var attribute = iotdb.attribute

exports.Model = iotdb.make_model('AbstractValueBoolean')
    .attribute(
        attribute.make_boolean(":value")
    )
    .make()
    ;
