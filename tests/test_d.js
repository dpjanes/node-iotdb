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
                var ad = _.deepCopy(d1d);
                var bd = _.deepCopy(d1d);

                assert.ok(_.d.is.superset(ad, bd));
                assert.ok(_.d.is.superset(bd, ad));
            });
            it('superset - different', function() {
                var ad = _.deepCopy(d1d);
                ad["something"] = "else";

                var bd = _.deepCopy(d1d);

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
                var ad = _.deepCopy(d1d);
                var bd = _.deepCopy(d1d);

                assert.ok(_.d.is.subset(ad, bd));
                assert.ok(_.d.is.subset(bd, ad));
            });
            it('subset - different', function() {
                var ad = _.deepCopy(d1d);
                ad["something"] = "else";

                var bd = _.deepCopy(d1d);

                assert.ok(!_.d.is.subset(ad, bd));
                assert.ok(_.d.is.subset(bd, ad));
            });
            it('subset - bad', function() {
                assert.ok(!_.d.is.subset({}, 21));
                assert.ok(!_.d.is.subset("hi", {}));
            });
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
            var sd = _.deepCopy(d1d);
            sd["function"] = function() {};
            sd["nan"] = NaN;
            sd["undefined"] = undefined;
            var od = _.d.json(sd);
            assert.ok(_.is.Equal(od, d1d));
        });
        it('call - dirty subdictionary', function() {
            var sd = _.deepCopy(d1d);
            var ssd = {};
            ssd["function"] = function() {};
            ssd["nan"] = NaN;
            ssd["undefined"] = undefined;
            ssd["good"] = "times";
            sd["sub"] = ssd;
            var od = _.d.json(sd);

            var xd = _.deepCopy(d1d);
            xd["sub"] = { "good": "times" };

            assert.ok(_.is.Equal(od, xd));
        });
        it('call - dirty array', function() {
            var sd = _.deepCopy(d1d);
            var ssd = {};
            ssd["function"] = function() {};
            ssd["nan"] = NaN;
            ssd["undefined"] = undefined;
            ssd["good"] = "times";
            sd["sub"] = [ "hi", ssd, "there" ];
            var od = _.d.json(sd);

            var xd = _.deepCopy(d1d);
            xd["sub"] = [ "hi", { "good": "times" }, "there" ];

            assert.ok(_.is.Equal(od, xd));
        });
    });
})
