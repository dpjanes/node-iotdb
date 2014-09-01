/*
 *  stores/phant.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-01-02
 *
 *  Connect to Phant / https://data.sparkfun.com/
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
// var phantClient = require("node-phant");

// var key_name = _.expand("iot-store:phant.io/name")

/**
 */
var PhantStore = function(paramd) {
    var self = this;

    self.__phant = null;
    self.iri = "https://data.sparkfun.com/"

    return self;
}

PhantStore.prototype = new store.Store;
PhantStore.prototype.store_id = "iot-store:phant"

/*
 *  See {@link Store#on_change Store.on_change}
 */
PhantStore.prototype.on_change = function(thing) {
    var self = this

    console.log("HERE:XXX")

    /*
    var meta = thing.meta()
    var phant_name = meta.get(key_name, null)
    if (phant_name === null) {
        phant_name = thing.thing_id()
        meta.set(key_name, phant_name)
        console.log("- PhantStore.on_change", "assigned Thing a Phant name", phant_name)
    }

    var phant = self.phant()
    phant.phant_for(phant_name, thing.state(), function(error, phant){
        if (error) {
            console.log("- PhantStore.on_change/phant_for", "phant failed", error)
            return
        }

        console.log("- PhantStore.on_change/phant_for", "updated", phant_name)
    });
     
     */
}

/**
 */
PhantStore.prototype.phant = function() {
    var self = this

    /*
    if (self.__phant == null) {
        self.__phant = new phantClient();
    }

    return self.__phant
    */
}

/*
 *  API
 */
exports.Store = PhantStore
