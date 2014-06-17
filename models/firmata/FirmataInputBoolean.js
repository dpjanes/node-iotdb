/*
 *  FirmataInputBoolean.js
 *
 *  David Janes
 *  IOTDB
 *  2014-04-30
 */

"use strict";

var iotdb = require("iotdb")
var attribute = iotdb.attribute

exports.Model = iotdb.make_model('FirmataInputBoolean')
    .product("http://www.seeedstudio.com/depot/Grove-ButtonP-p-1243.html")
    .product("http://www.seeedstudio.com/depot/Grove-Button-p-766.html")
    .product("http://www.seeedstudio.com/depot/Grove-SwitchP-p-1252.html")
    .help("make sure to set initd.pin")
    .attribute(
        attribute.make_boolean(":value")
            .reading()
    )
    .driver_identity(":firmata")
    .driver_setup(function(paramd) {
        paramd.initd.pins = "value:mode=digital-input"
    })
    .make()
    ;
