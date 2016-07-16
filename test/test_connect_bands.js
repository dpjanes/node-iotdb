/*
 *  test_connect_bands.js
 *
 *  David Janes
 *  IOTDB
 *  2016-07-15
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var iotdb = require("../iotdb");
var thing_manager = require("../thing_manager");

require('./instrument/iotdb');

var _make_thing = function(callback) {
    var t = thing_manager.make();
    t._reset();
    
    var ts = t.connect("Test", {}, {
        "schema:name": "The Thing Name",
        "schema:description": "My Thing",
        "iot:zone": [ "Glasgow Place", "Second Floor", "Bedroom" ],
        "iot:facet": [ "iot-facet:switch", "iot-facet:lighting", "iot-facet:something" ],
        "iot:thing-number": 32,
    });
    ts.on("thing", function() {
        callback(ts);
    });
};

describe('test_connect_bands', function() {
    it('creates thing', function(done) {
        _make_thing(function(ts) {
            assert.strictEqual(ts.count(), 1);
            done();
        });
    });
    it('has correct thing-id', function(done) {
        _make_thing(function(ts) {
            const thing = ts.any();
            const id = thing.thing_id();
            assert.strictEqual(id, "urn:iotdb:thing:Test:0FAF0A6A-C1AD-413D-8C1B-2EEE3CBA9F0D:10:test");

            done();
        });
    });
    it('has correct model-id', function(done) {
        _make_thing(function(ts) {
            const thing = ts.any();
            const id = thing.model_id();
            assert.strictEqual(id, "test");

            done();
        });
    });
    it('has correct model', function(done) {
        _make_thing(function(ts) {
            const thing = ts.any();
            const model = thing.band("model");
            const state = model.state();

            assert.ok(_.d.is.superset(state, {
                'schema:name': 'Test',
                'schema:description': 'Test',
                'iot:model-id': 'test',
            }));

            done();
        });
    });
    it('has correct meta', function(done) {
        _make_thing(function(ts) {
            const thing = ts.any();
            const meta = thing.band("meta");
            const state = meta.state();

            assert.ok(_.d.is.superset(state, {
                'schema:name': 'The Thing Name',
                'schema:description': 'My Thing',
                'iot:model-id': 'test',
                'iot:zone': [ 'Glasgow Place', 'Second Floor', 'Bedroom' ],
                'iot:facet': [
                    'iot-facet:switch',
                    'iot-facet:lighting',
                    'iot-facet:something' ],
                'iot:thing-number': 32
            }));

            done();
        });
    });
});
