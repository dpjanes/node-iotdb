/*
 *  test_thing_array.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-06
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var _ = require("../helpers")

var iotdb = require("../iotdb");
var things = require("../things");

require('./instrument/iotdb');

var _make_thing = function(callback) {
    var t = new things.Things();
    t._reset();
    
    var ts = t.connect("Test", {}, {
        "schema:name": "The Thing Name",
        "schema:description": "My Thing",
        "iot:tag": [ "a", "b", "c" ],
        "iot:thing-number": 32,
    });
    ts.on("thing", function() {
        callback(ts);
    });
};

describe('test_thing_array', function() {
    describe('first', function() {
        it('with one thing', function() {
            _make_thing(function(ts) {
                var thing = ts.first()
                assert.ok(thing);
                assert.ok(_.is.Thing(thing));
            });
        });
        it('with no things', function() {
            var t = new things.Things();
            t._reset();

            var ts = t.connect("NotAThing");
    
            var thing = ts.first()
            console.log("thing", thing);
            assert.ok(!thing);
            assert.ok(_.is.Null(thing));
        });
    });
});
