/*
 *  test_attribute_io.js
 *
 *  David Janes
 *  IOTDB
 *  2013-12-28
 *
 *  Test attribute conversions preferences
 */

"use strict";

var assert = require("assert")
var attribute = require("../attribute")
var _ = require("../helpers")
var model = require("../model");
var definitions = require("../definitions");

var BooleanModel = model.make_model('BooleanModel')
    .io("value", definitions.attribute.boolean)
    .make();

var IntegerModel = model.make_model('IntegerModel')
    .io("value", definitions.attribute.integer)
    .make();

/* --- tests --- */
describe('test_attribute_io:', function(){
  describe('boolean', function(){
    it('initial underlying', function(){
        var m = new BooleanModel();
        var as = m.attributes();
        assert.strictEqual(as.length, 1);

        var a = as[0];
        assert.strictEqual(a._ivalue, null);
        assert.strictEqual(a._ovalue, null);

        /* get - returns ivalue or ovalue */
        assert.strictEqual(m.get("value"), null);

        /* state */
        assert.ok(_.equals({ value: null }, m.state("ostate")));
        assert.ok(_.equals({ value: null }, m.state("istate")));
    });
    it('set vs. underlying', function(){
        var m = new BooleanModel();
        var as = m.attributes();
        var a = as[0];

        /* changes ovalue */
        m.set("value", true);
        assert.strictEqual(a._ivalue, null);
        assert.strictEqual(a._ovalue, true);

        /* get - returns ivalue or ovalue */
        assert.strictEqual(m.get("value"), true);

        /* state */
        assert.ok(_.d.is.subset({ value: true }, m.state("ostate")));
        assert.ok(_.d.is.subset({ value: null }, m.state("istate")));
    });
    /* NO MORE TRANSACTIONS
    it('set/push=true vs. underlying', function(){
        var m = new BooleanModel();
        var as = m.attributes();
        var a = as[0];

        // changes ovalue 
        m.start({ push: true }).set("value", true).end();

        assert.strictEqual(a._ivalue, null);
        assert.strictEqual(a._ovalue, true);

        // get - returns ivalue or ovalue 
        assert.strictEqual(m.get("value"), true);

        // state 
        assert.ok(_.equals({ value: true }, m.state("ostate")));
        assert.ok(_.equals({ value: null }, m.state("istate")));
    });
    */
    /* NO MORE TRANSACTIONS
    it('set/push=false vs. underlying', function(){
        var m = new BooleanModel();
        var as = m.attributes();
        var a = as[0];

        // changes ivalue
        m.start({ push: false }).set("value", true).end();

        assert.strictEqual(a._ivalue, true);
        assert.strictEqual(a._ovalue, null);

        // get - returns ivalue or ovalue
        assert.strictEqual(m.get("value"), true);

        // state 
        assert.ok(_.equals({ value: true }, m.state("istate")))
        assert.ok(_.equals({ value: null }, m.state("ostate")))
    });
    */
  });
  describe('integer', function(){
    it('multivalue - initial underlying', function(){
        var m = new IntegerModel();
        var as = m.attributes();
        assert.strictEqual(as.length, 1);

        var a = as[0];
        assert.strictEqual(a._ivalue, null);
        assert.strictEqual(a._ovalue, null);

        /* get - returns ivalue or ovalue */
        assert.strictEqual(m.get("value"), null);

        /* state */
        assert.ok(_.equals({ value: null }, m.state("ostate")));
        assert.ok(_.equals({ value: null }, m.state("istate")));
    });
    /* NO MORE TRANSACTIONS
    it('multivalue - ivalue and ovalue priority', function(){
        var m = new IntegerModel();
        var as = m.attributes();
        assert.strictEqual(as.length, 1);

        // ovalue, then ivalue
        m.start({ push: true }).set("value", 1).end();
        m.start({ push: false }).set("value", 2).end();

        // get - returns ivalue before ovalue 
        assert.strictEqual(m.get("value"), 2);

        // state
        assert.ok(_.equals({ value: 2 }, m.state("istate")));
        assert.ok(_.equals({ value: 1 }, m.state("ostate")));
    });
    */
  });
})
