/*
 *  test_d_timestamp.js
 *
 *  David Janes
 *  IOTDB
 *  2015-03-25
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var Meta = require("../meta").Meta;
var _ = require("../helpers")

var TS_OLD = '2010-03-25T21:28:43.613Z';
var TS_NEW = '2012-03-25T21:28:43.613Z';

/* --- tests --- */
describe('test_d_timestamp:', function(){
    it('timestamps: old:no, new:no -> true', function() {
        var od = {
            key: 'old',
        };
        var nd = {
            key: 'newd',
        };

        assert.strictEqual(_.timestamp.check.dictionary(od, nd), true);
    });
    it('timestamps: old:TS_OLD, new:no -> false', function() {
        var od = {
            '@timestamp': TS_OLD,
            key: 'old',
        };
        var nd = {
            key: 'newd',
        };

        assert.strictEqual(_.timestamp.check.dictionary(od, nd), false);
    });
    it('timestamps: old:no, new:TS_NEW -> true', function() {
        var od = {
            key: 'old',
        };
        var nd = {
            '@timestamp': TS_NEW,
            key: 'newd',
        };

        assert.strictEqual(_.timestamp.check.dictionary(od, nd), true);
    });
    it('timestamps: old:TS_OLD, new:TS_NEW -> true', function() {
        var od = {
            '@timestamp': TS_OLD,
            key: 'old',
        };
        var nd = {
            '@timestamp': TS_NEW,
            key: 'newd',
        };

        assert.strictEqual(_.timestamp.check.dictionary(od, nd), true);
    });
    it('timestamps: old:TS_NEW, new:TS_OLD -> false', function() {
        var od = {
            '@timestamp': TS_NEW,
            key: 'old',
        };
        var nd = {
            '@timestamp': TS_OLD,
            key: 'newd',
        };

        assert.strictEqual(_.timestamp.check.dictionary(od, nd), false);
    });
    it('timestamps: old:TS_NEW, new:TS_OLD -> true WITH renamed key', function() {
        var od = {
            '@timestamp': TS_NEW,
            key: 'old',
        };
        var nd = {
            '@timestamp': TS_OLD,
            key: 'newd',
        };

        assert.strictEqual(_.timestamp.check.dictionary(od, nd, { key: '__timestamp' }), true);
    });
    it('timestamps: old:TS_NEW, new:TS_OLD -> true USING renamed key', function() {
        var od = {
            '__timestamp': TS_NEW,
            key: 'old',
        };
        var nd = {
            '__timestamp': TS_OLD,
            key: 'newd',
        };

        assert.strictEqual(_.timestamp.check.dictionary(od, nd, { key: '__timestamp' }), false);
    });
    it('timestamps: old:WRONG, new:TS_OLD -> null', function() {
        var od = "wrong";
        var nd = {
            '@timestamp': TS_OLD,
            key: 'newd',
        };

        assert.strictEqual(_.timestamp.check.dictionary(od, nd), null);
    });
    it('timestamps: old:TS_OLD, new:wrong -> null', function() {
        var od = {
            '@timestamp': TS_OLD,
            key: 'newd',
        };
        var nd = "wrong";

        assert.strictEqual(_.timestamp.check.dictionary(od, nd), null);
    });
    it('timestamps: old:wrong, new:wrong -> null', function() {
        var od = 123;
        var nd = "wrong";

        assert.strictEqual(_.timestamp.check.dictionary(od, nd), null);
    });
})
