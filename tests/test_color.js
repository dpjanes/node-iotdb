/*
 *  test_color.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-01
 *  "The Frickin Future"
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var _ = require("../helpers")

describe('test_color', function() {
    describe('constructor', function() {
        it('default', function() {
            var color = new _.color.Color();

            assert.strictEqual(color.r, 0);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 0);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 0);
            assert.strictEqual(color.l, 0);
        });
        it('#FFFFFF', function() {
            var color = new _.color.Color('#FFFFFF');

            assert.strictEqual(color.r, 1);
            assert.strictEqual(color.g, 1);
            assert.strictEqual(color.b, 1);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 0);
            assert.strictEqual(color.l, 1);
        });
        it('all named colors', function() {
            for (var name in _.color.colord) {
                var rgb = _.color.colord[name];

                var color = new _.color.Color(name);

                assert.strictEqual(color.get_hex(), rgb);
            }
        });
    });
    describe('set_rgb_1', function() {
        it('set white', function() {
            var color = new _.color.Color();
            color.set_rgb_1(1, 1, 1);

            assert.strictEqual(color.r, 1);
            assert.strictEqual(color.g, 1);
            assert.strictEqual(color.b, 1);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 0);
            assert.strictEqual(color.l, 1);
        });
        it('set red', function() {
            var color = new _.color.Color();
            color.set_rgb_1(1, 0, 0);

            assert.strictEqual(color.r, 1);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 0);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });
        it('set nothing', function() {
            var color = new _.color.Color();
            color.set_rgb_1(1, 0, 0);
            color.set_rgb_1();

            assert.strictEqual(color.r, 1);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 0);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });
    });
    describe('set_rgb_255', function() {
        it('set almost-black', function() {
            var color = new _.color.Color();
            color.set_rgb_255(1, 1, 1);

            assert.strictEqual(color.r, 1 / 255);
            assert.strictEqual(color.g, 1 / 255);
            assert.strictEqual(color.b, 1 / 255);
        });
        it('set white', function() {
            var color = new _.color.Color();
            color.set_rgb_255(255, 255, 255);

            assert.strictEqual(color.r, 1);
            assert.strictEqual(color.g, 1);
            assert.strictEqual(color.b, 1);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 0);
            assert.strictEqual(color.l, 1);
        });
        it('set red', function() {
            var color = new _.color.Color();
            color.set_rgb_255(255, 0, 0);

            assert.strictEqual(color.r, 1);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 0);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });
        it('set nothing', function() {
            var color = new _.color.Color();
            color.set_rgb_255(255, 0, 0);
            color.set_rgb_255();

        
            assert.strictEqual(color.r, 1);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 0);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });
    });
    describe('set_hsl', function() {
        it('set red/(0,1,0.5)', function() {
            var color = new _.color.Color();
            color.set_hsl(0, 1, 0.5);

            assert.strictEqual(color.r, 1);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 0);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });

        it('set green/(0.33,1,0.5)', function() {
            var color = new _.color.Color();
            color.set_hsl(1 / 3.0, 1 , 0.5);

            assert.strictEqual(color.r, 0);
            assert.strictEqual(color.g, 1);
            assert.strictEqual(color.b, 0);
            assert.strictEqual(color.h, 1 / 3.0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });
        it('set blue/(0.66,1,0.5)', function() {
            var color = new _.color.Color();
            color.set_hsl(2 / 3.0, 1 , 0.5);

            assert.strictEqual(color.r, 0);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 1);
            assert.strictEqual(color.h, 2 / 3.0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });
        it('set nothing', function() {
            var color = new _.color.Color();
            color.set_hsl(2 / 3.0, 1 , 0.5);
            color.set_hsl();

            assert.strictEqual(color.r, 0);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 1);
            assert.strictEqual(color.h, 2 / 3.0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });
    });
    describe('set_hsb', function() {
        it('set red/(0,100,100)', function() {
            var color = new _.color.Color();
            color.set_hsb(0, 100, 100);

            assert.strictEqual(color.r, 1);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 0);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });

        it('set green/(120,100,100)', function() {
            var color = new _.color.Color();
            color.set_hsb(120, 100, 100);

            assert.strictEqual(color.r, 0);
            assert.strictEqual(color.g, 1);
            assert.strictEqual(color.b, 0);
            assert.strictEqual(color.h, 1 / 3.0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });
        it('set blue/(240,100,100)', function() {
            var color = new _.color.Color();
            color.set_hsb(240, 100, 100);

            assert.strictEqual(color.r, 0);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 1);
            assert.strictEqual(color.h, 2 / 3.0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });
        it('set nothing', function() {
            var color = new _.color.Color();
            color.set_hsb(240, 100, 100);
            color.set_hsb();

            assert.strictEqual(color.r, 0);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 1);
            assert.strictEqual(color.h, 2 / 3.0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });
    });
    describe('parseColor', function() {
        it('#0000FF', function() {
            var color = new _.color.Color();
            color.parseColor("#0000FF");

            assert.strictEqual(color.r, 0);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 1);
            assert.strictEqual(color.h, 2 / 3.0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });
        it('rgb(0,0,255)', function() {
            var color = new _.color.Color();
            color.parseColor("rgb(0,0,255)");

            assert.strictEqual(color.r, 0);
            assert.strictEqual(color.g, 0);
            assert.strictEqual(color.b, 1);
            assert.strictEqual(color.h, 2 / 3.0);
            assert.strictEqual(color.s, 1);
            assert.strictEqual(color.l, 0.5);
        });
        it('hsl(0,0,1)', function() {
            var color = new _.color.Color();
            color.parseColor("hsl(0,0,1)");

            assert.strictEqual(color.r, 1);
            assert.strictEqual(color.g, 1);
            assert.strictEqual(color.b, 1);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 0);
            assert.strictEqual(color.l, 1);
        });
        it('burlywood', function() {
            var color = new _.color.Color();
            color.parseColor("burlywood");

            assert.strictEqual(color.get_hex(), _.color.colord["burlywood"]);
        });
        it('undefined', function() {
            var color = new _.color.Color();
            color.parseColor("hsl(0,0,1)");
            color.parseColor();

            assert.strictEqual(color.r, 1);
            assert.strictEqual(color.g, 1);
            assert.strictEqual(color.b, 1);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 0);
            assert.strictEqual(color.l, 1);
        });
        it('garbage', function() {
            var color = new _.color.Color();
            color.parseColor("hsl(0,0,1)");
            color.parseColor("jdldjdljdldjldjlkdjdl");

            assert.strictEqual(color.r, 1);
            assert.strictEqual(color.g, 1);
            assert.strictEqual(color.b, 1);
            assert.strictEqual(color.h, 0);
            assert.strictEqual(color.s, 0);
            assert.strictEqual(color.l, 1);
        });
    });
    describe('get_*', function() {
        it('rgb', function() {
            var color = new _.color.Color();
            color.parseColor("hsl(0,0.5,0.5)");

            assert.strictEqual(color.get_rgb(), "rgb(0.75,0.25,0.25)");
        });
        it('hsl', function() {
            var color = new _.color.Color();
            color.parseColor("hsl(0,0.5,0.5)");

            assert.strictEqual(color.get_hsl(), "hsl(0,0.5,0.5)");
        });
        it('hex', function() {
            var color = new _.color.Color();
            color.parseColor("hsl(0,0.5,0.5)");

            assert.strictEqual(color.get_hex(), "#bf3f3f");
        });
        it('hex low', function() {
            var color = new _.color.Color();
            color.parseColor("#04050A");

            assert.strictEqual(color.get_hex(), "#04050a");
        });
    });
    describe('color_to_hex', function() {
        it('all', function() {
            for (var name in _.color.colord) {
                var rgb = _.color.colord[name];

                assert.strictEqual(_.color.color_to_hex(name), rgb.toUpperCase());
            }
        });
        it('unknown name', function() {
            assert.strictEqual(_.color.color_to_hex("David's Red", null), null);
        });
    });
});
