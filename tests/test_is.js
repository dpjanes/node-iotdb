/*
 *  test_is.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-15
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var model = require("../model");
var thing_array = require("../thing_array");
// var transporter = require("../transporter");

/* --- tests --- */
/*
describe('test_is:', function() {
    var testModel = model.make_model().code('a').make();
    var testThing = new testModel();
    var testThingArray0 = new thing_array.ThingArray();
    var testThingArray1 = new thing_array.ThingArray();
    testThingArray1.push(testThing);

    var testTransport = new transporter.Transport();

    it('Model', function() {
        assert.ok(_.is.Model(testModel));
        assert.ok(!_.is.Model(testThing));
        assert.ok(!_.is.Model(testThingArray0));
        assert.ok(!_.is.Model(testThingArray1));
        assert.ok(!_.is.Model(testTransport));

        assert.ok(!_.is.Model(null));
        assert.ok(!_.is.Model(undefined));
        assert.ok(!_.is.Model(0));
        assert.ok(!_.is.Model(1));
        assert.ok(!_.is.Model(""));
        assert.ok(!_.is.Model("string"));
        assert.ok(!_.is.Model([ "a", ]));
        assert.ok(!_.is.Model({ "a": "n" }));
    });
    it('Thing', function() {
        assert.ok(!_.is.Thing(testModel));
        assert.ok(_.is.Thing(testThing));
        assert.ok(!_.is.Thing(testThingArray0));
        assert.ok(!_.is.Thing(testThingArray1));
        assert.ok(!_.is.Thing(testTransport));

        assert.ok(!_.is.Thing(null));
        assert.ok(!_.is.Thing(undefined));
        assert.ok(!_.is.Thing(0));
        assert.ok(!_.is.Thing(1));
        assert.ok(!_.is.Thing(""));
        assert.ok(!_.is.Thing("string"));
        assert.ok(!_.is.Thing([ "a", ]));
        assert.ok(!_.is.Thing({ "a": "n" }));
    });
    it('ThingArray', function() {
        assert.ok(!_.is.ThingArray(testModel));
        assert.ok(!_.is.ThingArray(testThing));
        assert.ok(_.is.ThingArray(testThingArray0));
        assert.ok(_.is.ThingArray(testThingArray1));
        assert.ok(!_.is.ThingArray(testTransport));

        assert.ok(!_.is.ThingArray(null));
        assert.ok(!_.is.ThingArray(undefined));
        assert.ok(!_.is.ThingArray(0));
        assert.ok(!_.is.ThingArray(1));
        assert.ok(!_.is.ThingArray(""));
        assert.ok(!_.is.ThingArray("string"));
        assert.ok(!_.is.ThingArray([ "a", ]));
        assert.ok(!_.is.ThingArray({ "a": "n" }));
    });
    it('Transport', function() {
        assert.ok(!_.is.Transport(testModel));
        assert.ok(!_.is.Transport(testThing));
        assert.ok(!_.is.Transport(testThingArray0));
        assert.ok(!_.is.Transport(testThingArray1));
        assert.ok(_.is.Transport(testTransport));

        assert.ok(!_.is.Transport(null));
        assert.ok(!_.is.Transport(undefined));
        assert.ok(!_.is.Transport(0));
        assert.ok(!_.is.Transport(1));
        assert.ok(!_.is.Transport(""));
        assert.ok(!_.is.Transport("string"));
        assert.ok(!_.is.Transport([ "a", ]));
        assert.ok(!_.is.Transport({ "a": "n" }));
    });
    it('Dictionary', function() {
        assert.ok(!_.is.Dictionary(testModel));
        assert.ok(!_.is.Dictionary(testThing));
        assert.ok(!_.is.Dictionary(testThingArray0));
        assert.ok(!_.is.Dictionary(testThingArray1));
        assert.ok(!_.is.Dictionary(testTransport));

        assert.ok(!_.is.Dictionary(null));
        assert.ok(!_.is.Dictionary(undefined));
        assert.ok(!_.is.Dictionary(0));
        assert.ok(!_.is.Dictionary(1));
        assert.ok(!_.is.Dictionary(""));
        assert.ok(!_.is.Dictionary("string"));
        assert.ok(!_.is.Dictionary([ "a", ]));
        assert.ok(_.is.Dictionary({ "a": "n" }));
    });
    it('Object', function() {
        assert.ok(_.is.Object(testModel));
        assert.ok(_.is.Object(testThing));
        assert.ok(_.is.Object(testThingArray0));
        assert.ok(_.is.Object(testThingArray1));
        assert.ok(_.is.Object(testTransport));

        assert.ok(!_.is.Object(null));
        assert.ok(!_.is.Object(undefined));
        assert.ok(!_.is.Object(0));
        assert.ok(!_.is.Object(1));
        assert.ok(!_.is.Object(""));
        assert.ok(!_.is.Object("string"));
        assert.ok(_.is.Object([ "a", ]));
        assert.ok(_.is.Object({ "a": "n" }));
        assert.ok(_.is.Object(function() {}));
    });
})
*/
