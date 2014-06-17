/*
 *  FoursquareCheckin.js
 *
 *  David Janes
 *  IOTDB
 *  2014-05-04
 */

"use strict";

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('FoursquareCheckin')
    .attribute(
        iotdb.make_iri("wikipedia:check-in", "where")
            .reading()
    )
    .attribute(
        iotdb.make_string(":name")
            .reading()
    )
    .attribute(
        iotdb.make_datetime(":timestamp")
            .reading()
    )
    .attribute(
        iotdb.make_number(":latitude")
            .reading()
    )
    .attribute(
        iotdb.make_number(":longitude")
            .reading()
    )
    .attribute(
        iotdb.make_boolean(":flag", "fresh")
            .reading()
    )
    .driver_identity(":feed")
    .driver_in(function(paramd) {
        // console.log(paramd.driverd)

        if (paramd.driverd.link !== undefined) {
            paramd.thingd.where = paramd.driverd.link
        }

        if (paramd.driverd.date !== undefined) {
            paramd.thingd.timestamp = paramd.driverd.date
        }

        if (paramd.driverd.title !== undefined) {
            paramd.thingd.name = paramd.driverd.title
        }

        if (paramd.driverd.fresh !== undefined) {
            paramd.thingd.fresh = paramd.driverd.fresh
        }

        var p = paramd.driverd.georss_point
        if (p) {
            var parts = p.split(' ')
            if (parts.length == 2) {
                paramd.thingd.latitude = parseFloat(parts[0])
                paramd.thingd.longitude = parseFloat(parts[1])
            }
        }
    })
    .make()
