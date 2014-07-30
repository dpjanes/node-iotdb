/*
 *  project.js
 *
 *  Sample IOTDB project. Feel free
 *  to delete stuff you don't use
 *
 *  See 
 *  https://iotdb.org/docs/node/getting-started
 *
 *  The Node IOT is asynchronous and certain
 *  things have to happen in certain orders.
 *  This code has all the basic stuff you'll need
 *  in here.
 *
 *  The most likely places you'll want to make changes are:
 *  - iot.on_thing - when a new Thing is discovered
 *  - iot.on_ready - IOT is ready for action (but Things may
 *    not be discovered yet!)
 */

"use strict";

var iotdb = require("iotdb")

/**
 *  Global IOT object. This will return
 *  a singleton
 */
var iot = iotdb.iot()

/**
 *  Connect to everything. Things will
 *  be updated whenever there are new things.
 */
var things = iot.connect()
// var things = iot.connect('HueLight')
// var things = iot.connect('WeMoSwitch')

/** ---- everything below here is an example ----- **/

/**
 *  Example - makes list of Things that are
 *  only WeMos named 'WeMo Switch 1'. Will
 *  also turn them all on _whenever they are
 *  discovered_
 */
var wemos = things
    .with_model('WeMoSwitch')
    .with_name('WeMo Switch 1')
    .set(':on', true)

/**
 *  Example - callback invoked whenever 
 *  a new Thing is discovered. We 
 *  then setup some callbacks on that thing
 */
things.on_thing(function(thing) {
    console.log("+ new thing", thing.thing_id())

    /**
     *  Example - callback is invoked whenever
     *  the metadata for this thing changes
     */
    thing.on_meta(function(thing) {
        console.log("+ meta changed", thing.meta().state())
    })
})

/**
 *  Example - callback is invoked whenever
 *  _any_ thing is changed
 */
things.on_change(function(thing, attribute, value) {
    console.log("+ thing.changed", thing.thing_id(), attribute.get_code(), value)
})

/**
 *  Example - change Hue Light color whenever
 *  a door opens
 */
var contacts = iot.connect("SmartThingsContact")
// var contacts = things.with_model("SmartThingsContact")
var lights = iot.connect("HueLight")
// var lights = things.with_model("HueLight")
    
contacts.on_change(function(thing) {
    lights.set(':color', thing.get(':open') ? 'red' : 'green')
})
