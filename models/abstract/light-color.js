/*
 *  things/abstract/light-color.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-04
 *
 *  A light with a settable color (such as Philips Hue)
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('AbstractLightColor')
    .attribute(
        iotdb.make_boolean("on")
            .control()
    )
    .attribute(
        iotdb.make_unit("brightness")
            .control()
    )
    .attribute(
        iotdb.make_color("color")
            .control()
    )
    .validator(function(paramd) {
        for (var code in paramd.attributed) {
            var attribute = paramd.attributed[code];
            var value = paramd.thingd[code];

            if (code == "brightness") {
                var c = paramd.thingd["color"];
                if (c === undefined) {
                    c = "#000000";
                }
                var color = new paramd.lib.Color(c);
                color.set_hsl(undefined, undefined, value);
                paramd.thingd["color"] = color.get_hex();
            } else if (code == "color") {
                var color = new paramd.lib.Color(value);
                paramd.thingd["brightness"] = color.l;
            }
        }
    })
    .make()
