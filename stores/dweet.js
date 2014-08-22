/*
 *  stores/dweet.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-01-02
 *
 *  Connect to Dweet.io
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
var dweetClient = require("node-dweetio");

var key_name = _.expand("iot-store:dweet.io/name")

/**
 */
var DweetStore = function(paramd) {
    var self = this;

    self.__dweetio = null;

    return self;
}

DweetStore.prototype = new store.Store;
DweetStore.prototype.store_id = "iot-store:dweet.io"

/*
 *  See {@link Store#on_change Store.on_change}
 */
DweetStore.prototype.on_change = function(thing) {
    var self = this

    var meta = thing.meta()
    var dweet_name = meta.get(key_name, null)
    if (dweet_name === null) {
        dweet_name = thing.thing_id()
        meta.set(key_name, dweet_name)
        console.log("- DweetStore.on_change", "assigned Thing a Dweet name", dweet_name)
        // console.log("- XXX", thing.meta().state())
    }

    var dweetio = self.dweetio()

    var stated = thing.state()
    var meta = thing.meta()
    var model_iri = meta.get('iot:model')
    if (model_iri) {
        stated['@context'] = model_iri
        stated['@type'] = model_iri.replace(/^.*\//, '')

        var thing_iri = meta.get('iot:thing')
        if (thing_iri) {
            stated['iot:thing'] = thing_iri
        }
    }

    dweetio.dweet_for(dweet_name, stated, function(error, dweet){
        if (error) {
            console.log("- DweetStore.on_change/dweet_for", "dweet failed", error)
            return
        }

        console.log("- DweetStore.on_change/dweet_for", "updated", dweet_name)
    });
}

/**
 */
DweetStore.prototype.dweetio = function() {
    var self = this

    if (self.__dweetio == null) {
        self.__dweetio = new dweetClient();
    }

    return self.__dweetio
}

/*
 *  API
 */
exports.Store = DweetStore
