/*
 *  test_convert.js
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

describe('test_convert', function() {
    describe('add', function() {
        it('default', function() {
        });
    });
    describe('convert', function() {
        describe('simple', function() {
            describe('c->f', function() {
                it('default', function() {
                    var value = {
                        from: 'iot-unit:temperature.si.celsius',
                        to: 'iot-unit:temperature.imperial.fahrenheit',
                        value: 0,
                    };
                    var result = _.convert.convert(value);
                    var expect = 32;

                    assert.strictEqual(result, expect);
                });
            });
            describe('f->c', function() {
                it('default', function() {
                    var value = {
                        from: 'iot-unit:temperature.imperial.fahrenheit',
                        to: 'iot-unit:temperature.si.celsius',
                        value: 32,
                    };
                    var result = _.convert.convert(value);
                    var expect = 0;

                    assert.strictEqual(result, expect);
                });
            });
            describe('c->k', function() {
                it('default', function() {
                    var value = {
                        from: 'iot-unit:temperature.si.celsius',
                        to: 'iot-unit:temperature.si.kelvin',
                        value: 0,
                    };
                    var result = _.convert.convert(value);
                    var expect = 273.15;

                    assert.strictEqual(result, expect);
                });
            });
            describe('percent->unit', function() {
                it('default', function() {
                    var value = {
                        from: 'iot-unit:math.fraction.percent',
                        to: 'iot-unit:math.fraction.unit',
                        value: 60,
                    };
                    var result = _.convert.convert(value);
                    var expect = 0.6;

                    assert.strictEqual(result, expect);
                });
            });
            describe('unit->percent', function() {
                it('default', function() {
                    var value = {
                        from: 'iot-unit:math.fraction.unit',
                        to: 'iot-unit:math.fraction.percent',
                        value: 0.45,
                    };
                    var result = _.convert.convert(value);
                    var expect = 45;

                    assert.strictEqual(result, expect);
                });
            });
        });
        describe('deep', function() {
            describe('f->k', function() {
                it('default', function() {
                    var value = {
                        from: 'iot-unit:temperature.imperial.fahrenheit',
                        to: 'iot-unit:temperature.si.kelvin',
                        value: 72,
                    };
                    var result = _.convert.convert(value);
                    var expect = 295.372;

                    assert.strictEqual(result, expect);
                });
            });
            describe('k->f', function() {
                it('default', function() {
                    var value = {
                        from: 'iot-unit:temperature.si.kelvin',
                        to: 'iot-unit:temperature.imperial.fahrenheit',
                        value: 295.372,
                    };
                    var result = _.convert.convert(value);
                    var expect = 72;

                    assert.strictEqual(result, expect);
                });
            });
        });
    });
});
