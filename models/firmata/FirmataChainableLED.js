/*
 *  FirmataChainableLED.js
 *
 *  David Janes
 *  IOTDB
 *  2014-04-30
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('FirmataChainableLED')
    .product("http://www.seeedstudio.com/depot/Grove-Chainable-RGB-LED-p-850.html")
    .attribute(
        iotdb.make_color(":color")
            .control()
        )
    .driver_identity(":firmata")
    .driver_setup(function(paramd) {
        paramd.initd["pins"] = "rgb:pin=7,mode=sysex-output-int8,extension=cled"
    })
    .driver_in(function(paramd) {
        // console.log(paramd.driverd)
    })
    .driver_out(function(paramd) {
        if (paramd.thingd.color !== undefined) {
            var c = new paramd.libs.Color(paramd.thingd.color)
            paramd.driverd.rgb = [ c.r * 255, c.g * 255, c.b * 255 ]
        }
    })
    .make()
    ;
