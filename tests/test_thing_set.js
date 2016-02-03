/*
 *  test_thing_set.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-05
 *
 *  Test setting values
 */

"use strict";

var assert = require("assert")
var attribute = require("./instrument/attribute")
var model = require("../model")
var _ = require("../helpers")
var constants = require("../constants")

/* --- tests --- */
describe('test_thing_set:', function(){
    it('set', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .attribute(
                attribute.make_integer('intensity').control()
                    .maximum(10)
                    .minimum(0)
            )
            .make();
        var t = new T();
        t._clear_ostate = function() {};
        assert.ok(_.is.Equal({ on: null, intensity: null }, t.state("ostate")))
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
    /* NO MORE TRANSACTIONS
    it('transaction - no validation', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .make();
        var t = new T();

        // turn off validation
        t.start({ validate: false });
        assert.ok(_.is.Equal({ on: null}, t.state("ostate")))
        t.set('on', 1);
        assert.ok(_.is.Equal({ on: 1}, t.state("ostate")))
        t.end()
        assert.ok(_.is.Equal({ on: 1}, t.state("ostate")))
    });
    */
    /* NO MORE TRANSACTIONS
    it('transaction - force validation', function(){
        var T = model.make_model('T')
            .attribute(attribute.make_boolean('on').control())
            .make();
        var t = new T();

        // turn on validation
        t.start({ validate: true });
        assert.ok(_.is.Equal({ on: null}, t.state("ostate")))
        t.set('on', 1);
        assert.ok(_.is.Equal({ on: true}, t.state("ostate")))
        t.end()
        assert.ok(_.is.Equal({ on: true}, t.state("ostate")))
    });
    */
    it('set - semantic', function(){
        var T = model.make_model('T')
            .attribute(
                attribute.make_boolean('on')
                    .control()
                    .code('powered')
            )
            .make();
        var t = new T();
        t._clear_ostate = function() {};

        assert.strictEqual(null, t.state("ostate")['powered'])
        assert.ok(isNaN(t.state("ostate")['on']))

        t.set('powered', true)
        assert.strictEqual(true, t.state("ostate")['powered'])

        t.set('on', false)
        assert.strictEqual(true, t.state("ostate")['powered']) // no change

        t.set('iot-purpose:on', false)
        assert.strictEqual(false, t.state("ostate")['powered']) 

        t.set('iot-purpose:on', true)
        assert.strictEqual(true, t.state("ostate")['powered']) 
    });
})
