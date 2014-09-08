/*
 *  stores/phant.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-09-07
 *
 *  Connect to Phant / data.sparkfun.com
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
var Phant = require('phant-client').Phant

/**
 */
var PhantStore = function(paramd) {
    var self = this;

    self.iri = "http://localhost:8080"

    return self;
}

PhantStore.prototype = new store.Store;
PhantStore.prototype.store_id = "iot-store:phant"

var phant_server = "iot-store:phant/server"
var phant_stream_public_key = "iot-store:phant/stream/public_key"
var phant_stream_private_key = "iot-store:phant/stream/private_key"

/*
 *  See {@link Store#on_change Store.on_change}
 */
PhantStore.prototype.on_change = function(thing) {
    var self = this

    var meta = thing.meta()

    var server = meta.get(phant_server, null)
    if (server === null) {
        self._warn(thing, "Thing not configured - no 'server'")
        return
    }

    var public_key = meta.get(phant_stream_public_key, null)
    if (public_key === null) {
        self._warn(thing, "Thing not configured - no 'public_key'")
        return
    }

    var private_key = meta.get(phant_stream_private_key, null)
    if (private_key === null) {
        self._warn(thing, "Thing not configured - no 'private_key'")
        return
    }

    var any = false
    var sendd = {}
    var stated = thing.state()
    for (var key in stated) {
        var value = stated[key]
        if (value === undefined) {
        } else if (value === null) {
        } else if (_.isBoolean(value)) {
            sendd[key] = value ? 1: 0
            any = true
        } else if (_.isNumber(value)) {
            sendd[key] = value
            any = true
        } else if (_.isString(value)) {
            sendd[key] = value
            any = true
        } else {
            console.log("# PhantStore.on_change", "Don't understand code/value", code, value)
        }
    }

    if (!any) {
        return
    }

    var streamd = {
        inputUrl: server + "/input/" + public_key,
        outputUrl: server + "/output/" + public_key,
        manageUrl: server + "/streams/" + public_key,
        publicKey: public_key,
        privateKey: private_key
    }
    var phant = new Phant()
    phant.connect(streamd, function(error, streamd) {
        if (error) {
            console.error("# PhantStore.on_change/connect", error)
            return
        }

        phant.add(streamd, sendd, function(error) {
            if (error) {
                console.error("# PhantStore.on_change/add", error)
            } else {
                console.warn("- PhantStore.on_change/add", "record sent")
            }
        })
    })
}

/**
 *  This prompts for information needed to connect this device to Phant
 *
 *  <p>
 *  Info needed is:
 *  <ul>
 *  <li>Channel Input Key
 *  <li>Channel Output Key
 *  <li>Fields you want to save to Phant
 *  </ul>
 */
PhantStore.prototype.configure_thing = function(thing, ad, callback) {
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
            description: "Phant Server",
            required: true
        }
        var v = meta.get(phant_server, null)
        if (v !== null) {
            promptd['default'] = v
        } else {
            promptd['default'] = 'https://data.sparkfun.com'
        }
        promptdd['server'] = promptd
    }
    {
        var promptd = {
            description: "Public Key",
            pattern: /^[a-zA-Z0-9]*$/,
            required: true
        }
        var v = meta.get(phant_stream_public_key, null)
        if (v !== null) {
            promptd['default'] = v

        }
        promptdd['public_key'] = promptd
    }
    {
        var promptd = {
            description: "Private Key",
            pattern: /^[a-zA-Z0-9]*$/,
            required: true
        }
        var v = meta.get(phant_stream_private_key, null)
        if (v !== null) {
            promptd['default'] = v

        }
        promptdd['private_key'] = promptd
    }

    prompt.message = "Phant"
    prompt.start();
    prompt.get({
        properties: promptdd
    }, function (error, resultd) {
        if (error) {
            callback(error)
            return
        }

        meta.set(phant_server, resultd.server.replace(/\/*$/, ''))
        meta.set(phant_stream_private_key, resultd.private_key)
        meta.set(phant_stream_public_key, resultd.public_key)

        var streamd = {
            inputUrl: resultd.server + "/input/" + resultd.public_key,
            outputUrl: resultd.server + "/output/" + resultd.public_key,
            manageUrl: resultd.server + "/streams/" + resultd.public_key,
            publicKey: resultd.public_key,
            privateKey: resultd.private_key
        }
        var phant = new Phant()
        phant.connect(streamd, function(error, streamd) {
            if (error) {
                console.error("# PhantStore.configure_thing", error)
                return
            }

            var metad = {}
            metad.fields = codes.join(",")
            metad.title = "IOTDB " + thing.meta().get("iot:name")
            metad.alias = thing.thing_id().replace(/:/g, '_')

            phant.update(streamd, metad, function(error) {
                if (error) {
                    console.error("# PhantStore.configure_thing/update", error)
                    return
                }

                console.warn("- PhantStore.configure_thing/update", "finished")
                callback(null)
            })
        })
    })
}

var warned = {}

PhantStore.prototype._warn = function(thing, message) {
    var thing_id = thing.thing_id()
    if (warned[thing_id]) {
        return
    } else {
        warned[thing_id] = true
    }

    console.log("##############################")
    console.log("# PhantStore.on_change", message ? message : "")
    console.log("# configure using:")
    console.log("#")
    console.log("#   iotdb-control configure-store-thing", 
        "--store", ":phant", 
        "--thing", thing.thing_id(),
        "--model", thing.get_code()
    )
    console.log("#")
    console.log("##############################")
}

/*
 *  API
 */
exports.Store = PhantStore
