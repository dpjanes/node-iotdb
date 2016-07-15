/*
 *  test_meta.js
 *
 *  David Janes
 *  IOTDB
 *  2015-03-25
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var ind_1 = {
    boolean: true,
    integer: 1,
    number: 4.4,
    string: "Hello, World",
    array: [ 1, 2, 3, 4 ],
    dictionary: {
        a: "b",
    }
};

/* --- tests --- */
describe('test_d_transform:', function(){
    it('no transform', function(){
        var outd = _.d.transform(ind_1);
        assert.ok(_.is.Equal(outd, ind_1));
    });
    it('uppercase keys', function(){
        var outd = _.d.transform(ind_1, {
            key: function(key) {
                return key.toUpperCase();
            },
        });
        var expectd = { BOOLEAN: true,
          INTEGER: 1,
          NUMBER: 4.4,
          STRING: 'Hello, World',
          ARRAY: [ 1, 2, 3, 4 ],
          DICTIONARY: { A: 'b' } };
        assert.ok(_.is.Equal(outd, expectd));
    });
    it('keys beginning with a or d', function(){
        var outd = _.d.transform(ind_1, {
            key: function(key) {
                if (key.match(/^[ad]/)) {
                    return key;
                } else {
                    return undefined;
                }
            },
        });
        var expectd = { array: [ 1, 2, 3, 4 ], dictionary: { a: 'b' } };
        assert.ok(_.is.Equal(outd, expectd));
    });
    it('uppercase values', function(){
        var outd = _.d.transform(ind_1, {
            value: function(value) {
                if (_.isString(value)) {
                    return value.toUpperCase();
                } else {
                    return value;
                }
            },
        });
        var expectd = { boolean: true,
            integer: 1,
            number: 4.4,
            string: 'HELLO, WORLD',
            array: [ 1, 2, 3, 4 ],
            dictionary: { a: 'B' } }
        assert.ok(_.is.Equal(outd, expectd));
    });
})
