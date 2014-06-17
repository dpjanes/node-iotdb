/*
 *  hue-light.js
 *
 *  An Internet of Things 'Model' downloaded from IOTDB.org
 *  https://iotdb.org
 *
 *  Downloaded: 2014-04-17T11:54:02
 */

var iotdb = require('iotdb');

exports.Model = iotdb.make_model()
    .code("hue-light")
    .name("Hue Light")
    .description("Philips Hue colored light")
    .attribute(
        iotdb.make_attribute()
            .code("on")
            .description("on")
            .purpose("iot-attribute:on")
            .type("iot-js:boolean")
    )
    .attribute(
        iotdb.make_attribute()
            .code("color")
            .name("light color")
            .description("set the color of the Hue Lamp")
            .purpose("iot-attribute:color")
            .type("iot-js:string")
            .format("iot-js:rgb")
    )
    .driver_identity({
      "driver_iri": "iot-driver:hue"
    })
   .make();
