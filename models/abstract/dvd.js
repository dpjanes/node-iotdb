/*
 *  things/abstract/dvd.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-07
 *
 *  A DVD player
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('AbstractDVD')
    .attribute(
        iotdb.make_boolean("on")
            .control()
    )
    .make_attribute_reading("on", "on-value")
    .attribute(
        iotdb.make_string("media")
            .control()
            .enumeration([ "stop", "play", "pause" ])
    )
    .make_attribute_reading("media", "media-value")
    .make()
    ;
