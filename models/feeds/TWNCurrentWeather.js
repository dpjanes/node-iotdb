/*
 *  TWNCurrentWeather.js
 *
 *  David Janes
 *  IOTDB
 *  2014-05-05
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('TWNCurrentWeather')
    .attribute( 
        iotdb.make_number(":temperature")
            .unit(":temperature.si.celsius")
            .reading()
    )
    .attribute( 
        iotdb.make_number(":humidity")
            .unit(":math.fraction.percent")
            .reading()
    )
    .attribute( 
        iotdb.make_string(":message", "conditions")
            .reading()
    )
    .driver_identity(":feed")
    .driver_setup(function(paramd) {
        paramd.initd.track_links = false
    })
    .driver_in(function(paramd) {
        if (paramd.driverd.title !== "Current Weather") {
            return
        }

        var description = paramd.driverd.description
        if (description !== undefined) {
            // 'A few clouds,\r\n\t\t11&nbsp;&deg;C\t\t, Humidity\t\t43%\t\t, Wind\t\tSW 9km/h'
            var match = description.match(/^(.*?),/)
            if (match) {
                paramd.thingd.conditions = match[1]
            }

            var match = description.match(/([\d.]+)&nbsp;&deg;C/)
            if (match) {
                paramd.thingd.temperature = match[1]
            }

            var match = description.match(/Humidity\t\t(\d+)%\t\t/)
            if (match) {
                paramd.thingd.humidity = match[1]
            }
        }

        // console.log(paramd.thingd)
    })
    .make()
