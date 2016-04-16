/*
 *  test_d.js
 *
 *  David Janes
 *  IOTDB
 *  2015-12-26
 *  "Boxing Day"
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var _ = require("../helpers")

var d1d = {
    "string0": "",
    "string1": "hello",
    "string2": "world",

    "boolean0": false,
    "boolean1": true,

    "integer0": 0,
    "integer1": 1,
    "integer2": -1,

    "number0": 0.1,
    "number1": 3.14,
    "number2": -3.14,

    "array0": [
        "a",
        "b",
        "c",
    ],

    "dict0": {
        "string0": "the number 99",
        "integer0": 99,
        "number0": -99.9,
    }
};

describe('test_d:', function() {
    describe('get', function() {
        it('simple - no slash', function() {
            var keys = _.keys(d1d);
            keys.map(function(key) {
                var expect = d1d[key];
                var got = _.d.get(d1d, key, null);

                assert.ok(_.is.Equal(expect, got));
            });
        });
        it('simple - slash', function() {
            var keys = _.keys(d1d);
            keys.map(function(key) {
                var expect = d1d[key];
                var got = _.d.get(d1d, "/" + key, null);

                assert.ok(_.is.Equal(expect, got));
            });
        });
        it('path - no leading /', function() {
            {
                var expect = d1d["dict0"]["string0"];
                var got = _.d.get(d1d, "/dict0/string0", null);

                assert.ok(_.is.Equal(expect, got));
            }
            {
                var expect = d1d["dict0"]["number0"];
                var got = _.d.get(d1d, "/dict0/number0", null);

                assert.ok(_.is.Equal(expect, got));
            }
        });
        it('path - leading /', function() {
            {
                var expect = d1d["dict0"]["string0"];
                var got = _.d.get(d1d, "/dict0/string0", null);

                assert.ok(_.is.Equal(expect, got));
            }
            {
                var expect = d1d["dict0"]["number0"];
                var got = _.d.get(d1d, "/dict0/number0", null);

                assert.ok(_.is.Equal(expect, got));
            }
        });
        it('path - undefined head', function() {
            {
                var expect = "ABC";
                var got = _.d.get(d1d, "/undefined/undefined", expect);

                assert.ok(_.is.Equal(expect, got));
            }
        });
        it('path - undefined tail', function() {
            {
                var expect = "ABC";
                var got = _.d.get(d1d, "/dict0/undefined", expect);

                assert.ok(_.is.Equal(expect, got));
            }
        });
        it('path - not object', function() {
            {
                var expect = "ABC";
                var got = _.d.get(d1d, "/string0/undefined", expect);

                assert.ok(_.is.Equal(expect, got));
            }
        });
    });
    describe('get', function() {
        it('set - simple, blank', function() {
            var d = {};
            var x1d = {
                "hi": "there",
            };
            var x2d = {
                "hi": "there",
                "yellow": 10,
            };

            _.d.set(d, "hi", "there");
            assert.ok(_.is.Equal(d, x1d));
            
            _.d.set(d, "yellow", 10);
            assert.ok(_.is.Equal(d, x2d));
            
        });
        it('set - slash, blank', function() {
            var d = {};
            var x1d = {
                "hi": {
                    "hello": "there",
                },
            };

            _.d.set(d, "/hi/hello", "there");
            assert.ok(_.is.Equal(d, x1d));
        });
        it('set - slash, existing', function() {
            var d = {
                "hi": {
                    "a": "b",
                },
            };
            var x1d = {
                "hi": {
                    "a": "b",
                    "hello": "there",
                },
            };

            _.d.set(d, "/hi/hello", "there");
            assert.ok(_.is.Equal(d, x1d));
        });
        it('set - slash, existing overwrite', function() {
            var d = {
                "hi": 99,
            };
            var x1d = {
                "hi": {
                    "hello": "there",
                }
            };

            _.d.set(d, "/hi/hello", "there");
            assert.ok(_.is.Equal(d, x1d));
        });
    });
    describe('d_contains_d', function() {
        describe('superset', function() {
            it('superset - empty', function() {
                assert.ok(_.d.is.superset({}, {}));
            });
            it('superset - same', function() {
                var ad = _.d.clone.deep(d1d);
                var bd = _.d.clone.deep(d1d);

                assert.ok(_.d.is.superset(ad, bd));
                assert.ok(_.d.is.superset(bd, ad));
            });
            it('superset - different', function() {
                var ad = _.d.clone.deep(d1d);
                ad["something"] = "else";

                var bd = _.d.clone.deep(d1d);

                assert.ok(_.d.is.superset(ad, bd));
                assert.ok(!_.d.is.superset(bd, ad));
            });
            it('superset - bad', function() {
                assert.ok(!_.d.is.superset({}, 21));
                assert.ok(!_.d.is.superset("hi", {}));
            });
        });
        describe('subset', function() {
            it('superset - empty', function() {
                assert.ok(_.d.is.subset({}, {}));
            });
            it('subset - same', function() {
                var ad = _.d.clone.deep(d1d);
                var bd = _.d.clone.deep(d1d);

                assert.ok(_.d.is.subset(ad, bd));
                assert.ok(_.d.is.subset(bd, ad));
            });
            it('subset - different', function() {
                var ad = _.d.clone.deep(d1d);
                ad["something"] = "else";

                var bd = _.d.clone.deep(d1d);

                assert.ok(!_.d.is.subset(ad, bd));
                assert.ok(_.d.is.subset(bd, ad));
            });
            it('subset - bad', function() {
                assert.ok(!_.d.is.subset({}, 21));
                assert.ok(!_.d.is.subset("hi", {}));
            });
        });
    });
    describe('smart_extend', function() {
        it('call - empty', function() {
            var od = _.d.smart_extend({});
            var xd = {};
            assert.ok(_.is.Equal(od, xd));
        });
        it('call - empty', function() {
            var od = _.d.smart_extend({}, {});
            var xd = {};
            assert.ok(_.is.Equal(od, xd));
        });
        it('call - bad argument 1', function() {
            var od = _.d.smart_extend(1, { "a": "b" });
            var xd = { "a": "b"};
            assert.ok(_.is.Equal(od, xd));
        });
        it('call - bad argument 2', function() {
            var od = _.d.smart_extend({ "a": "b" }, 222);
            var xd = { "a": "b"};
            assert.ok(_.is.Equal(od, xd));
        });
        it('call - merge', function() {
            var srcd = {};
            var upd = {
                "hi": "there",
            };
            var xd = {
                "hi": "there",
            };
            _.d.smart_extend(srcd, upd);

            assert.ok(_.is.Equal(srcd, xd));
        });
        it('call - merge', function() {
            var srcd = {
                "a": "b",
            };
            var upd = {
                "hi": "there",
            };
            var xd = {
                "a": "b",
                "hi": "there",
            };
            _.d.smart_extend(srcd, upd);

            assert.ok(_.is.Equal(srcd, xd));
        });
        it('call - merge: dict in src', function() {
            var srcd = {
                "a": "b",
                "hi": {},
            };
            var upd = {
                "hi": "there",
            };
            var xd = {
                "a": "b",
                "hi": "there",
            };
            _.d.smart_extend(srcd, upd);

            assert.ok(_.is.Equal(srcd, xd));
        });
        it('call - merge: dict in update', function() {
            var srcd = {
                "a": "b",
                "hi": "there",
            };
            var upd = {
                "hi": {},
            };
            var xd = {
                "a": "b",
                "hi": {},
            };
            _.d.smart_extend(srcd, upd);

            assert.ok(_.is.Equal(srcd, xd));
        });
        it('call - merge subdictionary', function() {
            var srcd = {
                "a": "b",
                "sub": {
                    "c": "d",
                    "e": "f",
                },
            };
            var upd = {
                "hi": "there",
                "sub": {
                    "e": "updated",
                    "g": "h",
                },
            };
            var xd = {
                "a": "b",
                "hi": "there",
                "sub": {
                    "c": "d",
                    "e": "updated",
                    "g": "h",
                },
            };
            _.d.smart_extend(srcd, upd);

            assert.ok(_.is.Equal(srcd, xd));
        });
        describe('arrays', function() {
            it('add array', function() {
                var srcd = {
                    "A": "b",
                };
                var upd = {
                    "B": [ "a", "c", "c" ],
                };
                var xd = {
                    "A": "b",
                    "B": [ "a", "c", "c" ],
                };
                _.d.smart_extend(srcd, upd);

                assert.ok(_.is.Equal(srcd, xd));
            });
            it('replace value with array', function() {
                var srcd = {
                    "A": "b",
                    "B": 1,
                };
                var upd = {
                    "B": [ "a", "c", "c" ],
                };
                var xd = {
                    "A": "b",
                    "B": [ "a", "c", "c" ],
                };
                _.d.smart_extend(srcd, upd);

                assert.ok(_.is.Equal(srcd, xd));
            });
            it('replace array with array', function() {
                var srcd = {
                    "A": "b",
                    "B": [ "1", "2" ],
                };
                var upd = {
                    "B": [ "a", "c", "c" ],
                };
                var xd = {
                    "A": "b",
                    "B": [ "a", "c", "c" ],
                };
                _.d.smart_extend(srcd, upd);

                assert.ok(_.is.Equal(srcd, xd));
            });
        });
    });
    describe('json', function() {
        it('call - empty', function() {
            var od = _.d.json({});
            var xd = {};
            assert.ok(_.is.Equal(od, xd));
        });
        it('call - clean', function() {
            var od = _.d.json(d1d);
            assert.ok(_.is.Equal(od, d1d));
        });
        it('call - dirty', function() {
            var sd = _.d.clone.deep(d1d);
            sd["function"] = function() {};
            sd["nan"] = NaN;
            sd["undefined"] = undefined;
            var od = _.d.json(sd);
            assert.ok(_.is.Equal(od, d1d));
        });
        it('call - dirty subdictionary', function() {
            var sd = _.d.clone.deep(d1d);
            var ssd = {};
            ssd["function"] = function() {};
            ssd["nan"] = NaN;
            ssd["undefined"] = undefined;
            ssd["good"] = "times";
            sd["sub"] = ssd;
            var od = _.d.json(sd);

            var xd = _.d.clone.deep(d1d);
            xd["sub"] = { "good": "times" };

            // console.log("OD", od);
            // console.log("XD", xd);

            assert.ok(_.is.Equal(od, xd));
        });
        it('call - dirty array', function() {
            var sd = _.d.clone.deep(d1d);
            var ssd = {};
            ssd["function"] = function() {};
            ssd["nan"] = NaN;
            ssd["undefined"] = undefined;
            ssd["good"] = "times";
            sd["sub"] = [ "hi", ssd, "there" ];
            var od = _.d.json(sd);

            var xd = _.d.clone.deep(d1d);
            xd["sub"] = [ "hi", { "good": "times" }, "there" ];

            assert.ok(_.is.Equal(od, xd));
        });
    });
    describe('transform', function() {
        it('call - empty', function() {
            var od = _.d.transform({});
            var xd = {};
            assert.ok(_.is.Equal(od, xd));
        });
        it('call - empty', function() {
            var od = _.d.transform({}, {});
            var xd = {};
            assert.ok(_.is.Equal(od, xd));
        });
        it('call - empty transform', function() {
            var od = _.d.transform(d1d, {});
            var xd = d1d;
            assert.ok(_.is.Equal(od, xd));
        });
        it('call - upper case keys', function() {
            var od = _.d.transform(d1d, {
                key: function(value) {
                    return value.toUpperCase();
                },
            });
            var xd = {
              STRING0: '',
              STRING1: 'hello',
              STRING2: 'world',
              BOOLEAN0: false,
              BOOLEAN1: true,
              INTEGER0: 0,
              INTEGER1: 1,
              INTEGER2: -1,
              NUMBER0: 0.1,
              NUMBER1: 3.14,
              NUMBER2: -3.14,
              ARRAY0: [ 'a', 'b', 'c' ],
              DICT0: { STRING0: 'the number 99', INTEGER0: 99, NUMBER0: -99.9 } };
            assert.ok(_.is.Equal(od, xd));
        });
        it('call - remove keys', function() {
            var od = _.d.transform(d1d, {
                key: function(value) {
                    if (value.match(/^(string|dict)/)) {
                        return value;
                    }
                },
            });
            var xd = {
                string0: '',
                string1: 'hello',
                string2: 'world',
                dict0: { string0: 'the number 99' } };

            assert.ok(_.is.Equal(od, xd));
        });
        it('call - change value to null', function() {
            var od = _.d.transform(d1d, {
                value: function(value) {
                    return null;
                },
            });
            var xd = {
                string0: null,
                string1: null,
                string2: null,
                boolean0: null,
                boolean1: null,
                integer0: null,
                integer1: null,
                integer2: null,
                number0: null,
                number1: null,
                number2: null,
                array0: [ null, null, null ],
                dict0: { string0: null, integer0: null, number0: null } };


            assert.ok(_.is.Equal(od, xd));
        });
        it('call - filter', function() {
            var sd = _.d.clone.deep(d1d);
            sd["array0"] = [ "a", 0, "b", 1, "c", 2 ];
            var od = _.d.transform(sd, {
                filter: function(value) {
                    if (_.is.String(value) || _.is.Array(value)) {
                        return true;
                    }
                },
            });
            var xd = { string0: '', string1: 'hello', string2: 'world', "array0": [ "a", "b", "c", ],}

            assert.ok(_.is.Equal(od, xd));
        });
        it('call - pre', function() {
            var od = _.d.transform(d1d, {
                pre: function() {
                    return { "a": "b" };
                },
                key: function(value) {
                    return value.toUpperCase();
                },
            });
            var xd = {
                "A": "b",
            };
            assert.ok(_.is.Equal(od, xd));
        });
        it('call - post', function() {
            var od = _.d.transform(d1d, {
                post: function() {
                    return { "a": "b" };
                },
                key: function(value) {
                    return value.toUpperCase();
                },
            });
            var xd = {
                "a": "b",
            };
            assert.ok(_.is.Equal(od, xd));
        });
    });
})
