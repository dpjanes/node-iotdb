/*
 *  HuueLight.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-26
 */

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('HueLight')
    .facet(":lighting")
    .name("Hue Light")
    .description("Philips Hue colored light")
    .attribute(
        iotdb.make_boolean(":on")
            .name("on / off")
            .control()
            .reading()
            .description("turn the light on or off")
    )
    .attribute(
        iotdb.make_color(":color")
            .control()
            .reading()
            .description("set the color of the light")
    )
    .driver_identity("iot-driver:hue")
    .make()
    ;
