/*
 *  stores/thingspeak.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-01-02
 *
 *  Connect to ThingSpeak / thingspeak.com"
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
// var thingspeakClient = require("node-thingspeak");
var ThingSpeakClient = require('thingspeakclient');

// var key_name = _.expand("iot-store:thingspeak.io/name")

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
    var channel_id = meta.get(ts_channel_id, null)
    if (channel_id === null) {
        self._warn(thing, "Thing not configured - no 'channel_id'")
        return
    }

    /*
    var thingspeak = self._thingspeak()
    thingspeak.thingspeak_for(thingspeak_name, thing.state(), function(error, thingspeak){
        if (error) {
            console.log("- ThingSpeakStore.on_change/thingspeak_for", "thingspeak failed", error)
            return
        }

        console.log("- ThingSpeakStore.on_change/thingspeak_for", "updated", thingspeak_name)
    });
     
     */
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
ThingSpeakStore.prototype.configure_thing = function(thing, callback) {
    var prompt = require('prompt')
    var promptdd = {}

    var meta = thing.meta()

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
        meta.set(ts_channel_fields, [])

        callback(null)
    })
}

/**
 *  One shared client
 *  @protected
 */
ThingSpeakStore.prototype._thingspeak = function() {
    var self = this

    if (self.__thingspeak == null) {
        self.__thingspeak = new ThingSpeakClient({
            server: self.api
        });
    }

    return self.__thingspeak
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
    console.log("#   iotdb-control configure-store-thing", ":thingspeak", thing.thing_id())
    console.log("#")
    console.log("##############################")
}

/*
 *  API
 */
exports.Store = ThingSpeakStore
