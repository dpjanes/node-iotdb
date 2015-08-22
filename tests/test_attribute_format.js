/*
 *  test_attribute_format.js
 *
 *  David Janes
 *  IOTDB
 *  2013-12-31
 *
 *  Test formatting code
 */

"use strict";

var assert = require("assert")
var attribute = require("../attribute")
var _ = require("../helpers")

/* --- constants --- */
var iot_js_boolean = _.ld.expand("iot:type.boolean");
var iot_js_integer = _.ld.expand("iot:type.integer");
var iot_js_number = _.ld.expand("iot:type.number");
var iot_js_string = _.ld.expand("iot:type.string");

var iot_js_type = _.ld.expand("iot:type");

var iot_js_minimum = _.ld.expand("iot:minimum");
var iot_js_maximum = _.ld.expand("iot:maximum");

var iot_js_format = _.ld.expand("iot:format");
var iot_js_color = _.ld.expand("iot:format.color");
var iot_js_time = _.ld.expand("iot:format.time");
var iot_js_date = _.ld.expand("iot:format.date");
var iot_js_datetime = _.ld.expand("iot:format.datetime");

var wrap_validate = function(a, value, paramd) {
    if (paramd === undefined) {
        paramd = {}
    }
    paramd['value'] = value

    a.validate(paramd)
    return paramd.value
}

/* --- tests --- */
describe('test_attribute_format:', function(){
  describe('format', function(){
    it('RGB - bad', function(){
        var a = attribute.make_string("value").reading()
            .format("color")

        assert.strictEqual(undefined, wrap_validate(a, ''));
        assert.strictEqual(undefined, wrap_validate(a, '', {}));
        assert.strictEqual('#000000', wrap_validate(a, '', {
            use_otherwise : true
        }));
        assert.strictEqual('#123456', wrap_validate(a, '', {
            use_otherwise : true,
            otherwise_rgb : '#123456'
        }));
    });
    it('RGB - good', function(){
        var a = attribute.make_string("value").reading()
            .format("color")

        assert.strictEqual("#000000", wrap_validate(a, '#000000'));
        assert.strictEqual("#FF00FF", wrap_validate(a, '#FF00FF'));
    });
    it('datetime', function(){
        var a = attribute.make_string("value").reading()
            .format("datetime")

        assert.strictEqual(undefined, wrap_validate(a, ''));
        assert.strictEqual('not a date', wrap_validate(a, '', {
            use_otherwise : true,
            otherwise_datetime : "not a date"
        }));

        /* test default otherwise being about now */
        {
            var vdate$ = wrap_validate(a, '', {
                use_otherwise : true
            })
            var vs = Date.parse(vdate$);
            var ns = new Date().getTime()
            assert.ok(Math.abs(vs - ns) < 5 * 1000)
        }

        /* test Date conversion */
        assert.strictEqual('2012-01-14T00:00:00.000Z', wrap_validate(a, new Date('2012-01-14')));
    });
  });
})
