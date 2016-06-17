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
var iotdb = require("../iotdb")
var attribute = require("./instrument/attribute")
var _ = require("../helpers")
var constants = require("../constants")

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
