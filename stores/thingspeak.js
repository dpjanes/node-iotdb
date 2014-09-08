/*
 *  stores/thingspeak.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-09-02
 *
 *  Connect to ThingSpeak / thingspeak.com
 *
 *  Copyright [2013-2014] [David P. Janes]
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict"

var iotdb = require('iotdb');
var _ = require("../helpers");
var store = require('../store')
var unirest = require('unirest')

/**
 */
var ThingSpeakStore = function(paramd) {
    var self = this;

    self.__thingspeak = null;
    self.iri = "https://api.thingspeak.com"

    return self;
}

ThingSpeakStore.prototype = new store.Store;
ThingSpeakStore.prototype.store_id = "iot-store:thingspeak"

var ts_channel_id = "iot-store:thingspeak/channel/id"
var ts_channel_write_key = "iot-store:thingspeak/channel/write_key"
var ts_channel_read_key = "iot-store:thingspeak/channel/read_key"
var ts_channel_fields = "iot-store:thingspeak/channel/fields"

/*
 *  See {@link Store#on_change Store.on_change}
 */
ThingSpeakStore.prototype.on_change = function(thing) {
    var self = this

    var meta = thing.meta()

    // not actually needed
    var channel_id = meta.get(ts_channel_id, null)
    if (channel_id === null) {
        self._warn(thing, "Thing not configured - no 'channel_id'")
        return
    }

    // thingspeak just uses WriteKey WTF?
    var write_key = meta.get(ts_channel_write_key, null)
    if (write_key === null) {
        self._warn(thing, "Thing not configured - no 'write_key'")
        return
    }

    var url = 'http://api.thingspeak.com/update'
    var payloadd = {
        key: write_key
    }

    // changed values
    var any = false
    for (var field = 1; field <= 8; field++) {
        var code = meta.get(ts_channel_fields + "/" + field, "")
        if (_.isEmpty(code)) {
            continue
        }

        var value = thing.get(code, null)
        if (value === undefined) {
        } else if (value === null) {
        } else if (_.isBoolean(value)) {
            payloadd["field" + field] = value ? 1 : 0
            any = true
        } else if (_.isNumber(value)) {
            payloadd["field" + field] = "" + value
            any = true
        } else {
            console.log("# ThingSpeakStore.on_change", "ThingSpeak can only store number-like values",
                "Ignoring:", code)
        }
    }

    if (!any) {
        return
    }

    /*
     *  XXX - Major issue here: ThingSpeak can only take value
     *  changes every 15 seconds. We should handle this somehow
     */
    unirest
        .post(url)
        .send(payloadd)
        .end(function(result) {
            if (!result.ok) {
                console.log("# ThingSpeakStore.on_change", "not ok", "url", url, "result", result.text);
            } else if (result.body && result.body.length && result.body[0].error) {
                console.log("# ThingSpeakStore.on_change", "not ok", "url", url, "result", result.body);
            } else {
                console.log("- ThingSpeakStore.on_change", result.body);
            }
        })
    ;
}

/**
 *  This prompts for information needed to connect this device to ThingSpeak
 *
 *  <p>
 *  Info needed is:
 *  <ul>
 *  <li>Channel ID
 *  <li>Channel Write Key
 *  <li>Channel Read Key
 *  <li>Fields you want to save to ThingSpeak
 *  </ul>
 */
ThingSpeakStore.prototype.configure_thing = function(thing, ad, callback) {
    var prompt = require('prompt')
    var promptdd = {}

    var meta = thing.meta()

    // figure out all available codes
    var codes = []
    var ads = thing.attributes()
    for (var adi in ads) {
        var attribute = ads[adi]
        var code = attribute.get_code()
        codes.push(code)
    }

    {
        var promptd = {
            message: "Channel ID",
            pattern: /^[1-9][0-9]*$/,
            required: true
        }
        var v = meta.get(ts_channel_id, null)
        if (v !== null) {
            promptd['default'] = v
        }
        promptdd['channel_id'] = promptd
    }
    {
        var promptd = {
            description: "Write Key",
            pattern: /^[A-Z0-9]*$/,
            required: true
        }
        var v = meta.get(ts_channel_write_key, null)
        if (v !== null) {
            promptd['default'] = v

        }
        promptdd['write_key'] = promptd
    }
    {
        var promptd = {
            description: "Read Key",
            pattern: /^[A-Z0-9]*$/,
            required: true
        }
        var v = meta.get(ts_channel_read_key, null)
        if (v !== null) {
            promptd['default'] = v

        }
        promptdd['read_key'] = promptd
    }

    {
        var cd = {}
        for (var field = 1; field <= 8; field++) {
            var code = meta.get(ts_channel_fields + "/" + field, null)
            if (code) {
                cd[code] = field
            }
        }

        for (var ci in codes) {
            var code = codes[ci]
            {
                var promptd = {
                    description: "Field for Thing." + code + " [1-8]",
                    pattern: /^[1-8]$/,
                    required: false
                }
                var v = cd[code]
                if (v !== null) {
                    promptd['default'] = v
                }
                promptdd['code_' + code] = promptd
            }
        }
    }

    prompt.message = "ThingSpeak"
    prompt.start();
    prompt.get({
        properties: promptdd
    }, function (error, resultd) {
        if (error) {
            callback(error)
            return
        }

        meta.set(ts_channel_id, resultd.channel_id)
        meta.set(ts_channel_write_key, resultd.write_key)
        meta.set(ts_channel_read_key, resultd.read_key)

        var fd = {}
        for (var ci in codes) {
            var code = codes[ci]
            var field = resultd['code_' + code]
            if (field) {
                meta.set(ts_channel_fields + "/" + field, code)
                fd[field] = code
            }
        }

        for (var field = 1; field <= 8; field++) {
            if (!fd[field]) {
                meta.set(ts_channel_fields + "/" + field, "")
            }
        }

        callback(null)

        console.log("##############################")
        console.log("# ThingSpeakStore.configure_thing")
        console.log("# Please go to the following URL:")
        console.log("  https://thingspeak.com/channels/" + resultd.channel_id)
        console.log("")
        console.log("# Then enter (clearing all other fields):")
        for (var field = 1; field <= 8; field++) {
            if (fd[field]) {
                console.log("  Field " + field + ": " + fd[field])
            }
        }
        console.log("##############################")
    })
}

var warned = {}

ThingSpeakStore.prototype._warn = function(thing, message) {
    var thing_id = thing.thing_id()
    if (warned[thing_id]) {
        return
    } else {
        warned[thing_id] = true
    }

    console.log("##############################")
    console.log("# ThingSpeakStore.on_change", message ? message : "")
    console.log("# configure using:")
    console.log("#")
    console.log("#   iotdb-control configure-store-thing", 
        "--store", ":thingspeak", 
        "--thing", thing.thing_id(),
        "--model", thing.get_code()
    )
    console.log("#")
    console.log("##############################")
}

/*
 *  API
 */
exports.Store = ThingSpeakStore
