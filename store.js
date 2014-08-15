/*
 *  store.js
 *
 *  David Janes
 *  IOTDB
 *  2013-12-22
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

var assert = require('assert')
var _ = require("./helpers")
var ThingArray = require("./thing_array").ThingArray

/* --- constants --- */
var VERBOSE = true;

/**
 *  Store is a "datastore", a place where you can get or put data
 *  For example:
 *
 *  - Xively
 *  - Zatar
 *  - Phant.io
 *  - Dweet.io
 */
var Store = function() {
}

/**
 *  Track all changes to the thing(s) using the store
 */
Store.prototype.track = function(paramd) {
    var self = this

    /*
     *  Bash arguments - phase 1
     */
    if (_.isModel(paramd)) {
        paramd = {
            things: [ paramd ]
        }
    } else if (_.isThingArray(paramd)) {
        paramd = {
            things: paramd
        }
    } else if (_.isArray(paramd)) {
        paramd = {
            things: paramd
        }
    } else if (paramd.thing) {
        paramd.things = [ paramd.thing ]
        delete paramd["thing"]
    } else if (paramd.things) {
    } else {
        console.log("# Store.track", "expected 'paramd.things'")
        return
    }

    /*
     *  Bash arguments - phase 2
     */
    assert.ok(paramd.things !== undefined)

    var src = null
    
    if (_.isThingArray(paramd.things)) {
        src = paramd
    } else if (_.isArray(paramd)) {
        src = new ThingArray()
        for (var ti in paramd) {
            src.push(paramd[ti])
        }
        paramd = {}
    } else {
        console.log("# Store.track", "impossible state")
        assert(0)
    }
    
    console.log("# Store.track: NOT IMPLEMENETED", paramd)
}


/*
 *  API
 */
exports.Store = Store
