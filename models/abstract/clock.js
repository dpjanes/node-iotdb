/*
 *  things/abstract/clock.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-07
 *
 *  A clock, that supports date & time
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('AbstractClock')
    .attribute(
        iotdb.make_datetime(":when", "when")
            .reading()
    )
    .attribute(
        iotdb.make_datetime(":when", "when-set")
            .control()
    )
    .link_control_reading("when-set", "when")
    .facet(":clock")
    .make()
