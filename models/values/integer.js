/*
 *  things/values/integer.js
 *
 *  David Janes
 *  IOTDB
 *  2014-04-21
 *
 *  An integer value
 */

"use strict";

var iotdb = require("iotdb")
var attribute = iotdb.attribute

exports.Model = iotdb.make_model('AbstractValueInteger')
    .attribute(
        attribute.make_integer("value")
    )
    .make()
    ;
