/*
 *  we-mo-switch.js
 *
 *  An Internet of Things 'Model' downloaded from IOTDB.org
 *  https://iotdb.org
 *
 *  Downloaded: 2014-04-17T12:14:43
 */

var iotdb = require('iotdb');

exports.Model = iotdb.make_model()
    .code("we-mo-switch")
    .name("WeMo Switch")
    .description("Belkin WeMo Switch")
    .attribute(
        iotdb.make_attribute()
            .code("on")
            .purpose("iot-attribute:on")
            .type("iot:boolean")
    )
    .attribute(
        iotdb.make_attribute()
            .code("is-on")
            .purpose("iot-attribute:is-on")
            .purpose("iot-attribute:reading")
            .type("iot:boolean")
    )
    .driver_identity({
      "deviceType": "urn:Belkin:device:controllee:1", 
      "driver_iri": "iot-driver:upnp"
    })
    .property_value("iot-iotdb:model-driver-in", "function (paramd) {\n        var d = paramd.driverd['urn:Belkin:service:basicevent:1']\n        if (d) {\n            if (d.BinaryState == '0') {\n                paramd.thingd['on'] = false;\n                paramd.thingd['is-on'] = false;\n            } else if (d.BinaryState == '1') {\n                paramd.thingd['on'] = true;\n                paramd.thingd['is-on'] = true;\n            }\n        }\n    }")
    .property_value("iot-iotdb:model-driver-out", "function (paramd) {\n        if (paramd.thingd.on !== undefined) {\n            paramd.driverd['urn:Belkin:service:basicevent:1'] = {\n                'SetBinaryState' : {\n                    'BinaryState' : paramd.thingd.on ? 1 : 0\n                }\n            }\n        }\n    }")
    .property_value("iot-iotdb:model-driver-setup", "function (paramd) {\n        paramd.setupd[\"subscribe\"] = [\n            'urn:Belkin:service:basicevent:1'\n        ]\n    }")
   .make();
