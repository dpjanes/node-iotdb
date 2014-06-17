/*
 *  things/abstract/light-dimmer.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-01
 *
 *  A dimmer
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('AbstractLightDimmer')
    .attribute(
        iotdb.make_boolean("on")
            .control()
    )
    .attribute(
        iotdb.make_unit("brightness")
            .control()
    )
    .make()
