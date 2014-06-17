/*
 *  FirmataLightSimple.js
 *
 *  David Janes
 *  IOTDB
 *  2014-04-30
 */

"use strict";

var iotdb = require("iotdb")
var attribute = iotdb.attribute

exports.Model = iotdb.make_model('FirmataLightSimple')
    .product("http://www.seeedstudio.com/depot/Grove-Red-LED-p-1142.html")
    .product("http://www.seeedstudio.com/depot/Grove-Blue-LED-p-1139.html")
    .product("http://www.seeedstudio.com/depot/Grove-Green-LED-p-1144.html")
    .help("make sure to set initd.pin")
    .attribute(
        attribute.make_boolean(":on")
            .control()
    )
    .driver_identity(":firmata")
    .driver_setup(function(paramd) {
        paramd.initd.pins = "on:mode=digital-output"
    })
    .make()
    ;
