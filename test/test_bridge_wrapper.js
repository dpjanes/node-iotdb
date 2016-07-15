/*
 *  test_bridge_wrapper.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-16
 */

"use strict";

var assert = require("assert")

var iotdb = require("../iotdb");
var _ = require("../helpers")
require('./instrument/iotdb');

/* --- tests --- */
describe('test_bridge_wrapper', function(){

    describe('make_wrap', function(){
        it('works as expected', function() {
            var homestar_test = require("./instrument/homestar-test");
            var wrapper = _.bridge.wrap("Test", homestar_test.bindings);
            assert.ok(wrapper);
        });
        it('fails as expected', function() {
            var homestar_test = require("./instrument/homestar-test");
            var wrapper = _.bridge.wrap("DoesNotExist", homestar_test.bindings);
            assert.ok(!wrapper);
        });
        /*
        */
    });
    describe('core', function(){
        it('constructs without issue', function() {
            var test = require("./instrument/homestar-test/models/Test");
            var wrapper = _.bridge.make(test.binding);
        });
        it('emits thing', function(done) {
            var test = require("./instrument/homestar-test/models/Test");
            var wrapper = _.bridge.make(test.binding);
            wrapper.on("thing", function(thing) {
                assert.ok(_.is.Thing(thing));
                done();
            });
        });
        it('emits bridge', function(done) {
            var test = require("./instrument/homestar-test/models/Test");
            var wrapper = _.bridge.make(test.binding);
            wrapper.on("bridge", function(bridge) {
                assert.ok(_.is.Bridge(bridge));
                done();
            });
        });
        it('emits state', function(done) {
            var test = require("./instrument/homestar-test/models/Test");
            var wrapper = _.bridge.make(test.binding);
            wrapper.on("bridge", function(bridge) {
                assert.ok(_.is.Bridge(bridge));
                setInterval(function() {
                    bridge.test_pull({
                        "value": 234,
                    });
                }, 10);
            });
            wrapper.on("istate", function(bridge, state) {
                // at beginning ... initial pull
                if (_.is.Empty(state)) {
                    return;
                }

                assert.ok(_.is.Bridge(bridge));
                assert.ok(state.value === 234);
                done();
                done = function() {};
            });
        });
        it('emits meta', function(done) {
            var test = require("./instrument/homestar-test/models/Test");
            var wrapper = _.bridge.make(test.binding);
            wrapper.on("bridge", function(bridge) {
                assert.ok(_.is.Bridge(bridge));
                setInterval(function() {
                    bridge.test_meta();
                }, 10);
            });
            wrapper.on("meta", function(bridge, state) {
                assert.ok(_.is.Bridge(bridge));
                done();
                done = function() {};
            });
        });
        it('emits disconnected', function(done) {
            var test = require("./instrument/homestar-test/models/Test");
            var wrapper = _.bridge.make(test.binding);
            wrapper.on("bridge", function(bridge) {
                assert.ok(_.is.Bridge(bridge));
                setInterval(function() {
                    bridge.test_disconnect();
                }, 10);
            });
            wrapper.on("disconnected", function(bridge) {
                assert.ok(_.is.Bridge(bridge));
                done();
                done = function() {};
            });
        });
    });
});
