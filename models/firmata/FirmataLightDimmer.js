/*
 *  FirmataLightDimmer.js
 *
 *  David Janes
 *  IOTDB
 *  2014-04-30
 */

"use strict";

var iotdb = require("iotdb")
var attribute = iotdb.attribute

exports.Model = iotdb.make_model('FirmataLightDimmer')
    .product("http://www.seeedstudio.com/depot/Grove-Red-LED-p-1142.html")
    .product("http://www.seeedstudio.com/depot/Grove-Blue-LED-p-1139.html")
    .product("http://www.seeedstudio.com/depot/Grove-Green-LED-p-1144.html")
    .help("make sure to set initd.pin")
    .attribute(
        attribute.make_boolean(":on")
            .control()
    )
    .attribute(
        attribute.make_unit(":brightness")
            .control()
    )
    .driver_identity(":firmata")
    .driver_setup(function(paramd) {
        paramd.initd.pins = "brightness:mode=analog-output"
    })
    .driver_out(function(paramd) {
        var brightness = 1
        if (paramd.thingd.on !== undefined) {
            brightness *= paramd.thingd.on ? 1 : 0
        }
        if (paramd.thingd.brightness !== undefined) {
            brightness *= paramd.thingd.brightness
        }

        paramd.driverd.brightness = brightness
    })
    .make()
    ;
