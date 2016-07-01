/*
 *  test_thing_setup.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-05
 *
 *  Test setting up things
 */

"use strict";

var assert = require("assert")
var attribute = require("./instrument/attribute")
var model = require("../model")
var _ = require("../helpers")
var constants = require("../constants")

/* --- tests --- */
describe('test_thing_setup:', function(){
    it('constructor', function(){
        var T = model.make_model('T')
            .make();
        assert.ok(typeof T === "function");
    });
    it('empty setup', function(){
        var T = model.make_model('T')
            .make();
        var t = new T();
        assert.ok(_.is.Equal({ "@timestamp": _.timestamp.epoch(),}, t.state("ostate")))
    });
    it('single attribute setup', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .make();
        var t = new T();
        t._clear_ostate = function() {};
        assert.ok(_.d.is.subset({ on: null }, t.state("ostate")))
        t.set('on', true);
        assert.ok(_.d.is.subset({ on: true }, t.state("ostate")))
        t.set('on', false);
        assert.ok(_.d.is.subset({ on: false }, t.state("ostate")))
        t.set('on', 10);
        assert.ok(_.d.is.subset({ on: true }, t.state("ostate")))
        t.set('on', 0);
        assert.ok(_.d.is.subset({ on: false }, t.state("ostate")))
    });
    it('multiple attribute setup', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .attribute(attribute.make_number('intensity').control())
            .make();
        var t = new T();
        t._clear_ostate = function() {};
        assert.ok(_.d.is.subset({ on: null, intensity: null }, t.state("ostate")))
        t.set('on', true);
        assert.ok(_.d.is.subset({ on: true, intensity: null }, t.state("ostate")))
        t.set('on', false);
        assert.ok(_.d.is.subset({ on: false, intensity: null }, t.state("ostate")))
        t.set('on', 10);
        assert.ok(_.d.is.subset({ on: true, intensity: null }, t.state("ostate")))
        t.set('on', 0);
        assert.ok(_.d.is.subset({ on: false, intensity: null }, t.state("ostate")))
        t.set('intensity', 10);
        assert.ok(_.d.is.subset({ on: false, intensity: 10 }, t.state("ostate")))
        t.set('intensity', 1);
        assert.ok(_.d.is.subset({ on: false, intensity: 1 }, t.state("ostate")))
    });
})
