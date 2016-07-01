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
var _ = require("../helpers")

var TS_OLD = '2010-03-25T21:28:43.613Z';
var TS_NEW = '2012-03-25T21:28:43.613Z';
var TS_FUTURE = '2299-03-25T21:28:43.613Z';
var TS_NOW = (new Date()).toISOString();

var as_now = function(callback) {
    var _old = _.timestamp.make;
    _.timestamp.make = function() {
        return TS_NOW;
    };
    callback();
    _.timestamp.make = _old;
};

/* --- tests --- */
describe('test_d_timestamp', function(){
    describe('check', function(){
        it('old:no, new:no -> true', function() {
            var od = {
                key: 'old',
            };
            var nd = {
                key: 'newd',
            };

            assert.strictEqual(_.timestamp.check.dictionary(od, nd), true);
        });
        it('old:TS_OLD, new:no -> false', function() {
            var od = {
                '@timestamp': TS_OLD,
                key: 'old',
            };
            var nd = {
                key: 'newd',
            };

            assert.strictEqual(_.timestamp.check.dictionary(od, nd), false);
        });
        it('old:no, new:TS_NEW -> true', function() {
            var od = {
                key: 'old',
            };
            var nd = {
                '@timestamp': TS_NEW,
                key: 'newd',
            };

            assert.strictEqual(_.timestamp.check.dictionary(od, nd), true);
        });
        it('old:TS_OLD, new:TS_NEW -> true', function() {
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
        it('old:TS_NEW, new:TS_OLD -> false', function() {
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
        it('old:TS_NEW, new:TS_OLD -> true WITH renamed key', function() {
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
        it('old:TS_NEW, new:TS_OLD -> true USING renamed key', function() {
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
        it('old:WRONG, new:TS_OLD -> null', function() {
            var od = "wrong";
            var nd = {
                '@timestamp': TS_OLD,
                key: 'newd',
            };

            assert.strictEqual(_.timestamp.check.dictionary(od, nd), null);
        });
        it('old:TS_OLD, new:wrong -> null', function() {
            var od = {
                '@timestamp': TS_OLD,
                key: 'newd',
            };
            var nd = "wrong";

            assert.strictEqual(_.timestamp.check.dictionary(od, nd), null);
        });
        it('old:wrong, new:wrong -> null', function() {
            var od = 123;
            var nd = "wrong";

            assert.strictEqual(_.timestamp.check.dictionary(od, nd), null);
        });
    })
    describe('update', function(){
        describe('bad', function(){
            it('null', function() {
                var d = null;
                var r = _.timestamp.update(d);

                assert.ok(r === false);
            });
            it('string', function() {
                var d = "hello world";
                var r = _.timestamp.update(d);

                assert.ok(r === false);
            });
        });
        describe('no timestamp', function(){
            it('should be added', function() {
                var d = {
                };
                var r = _.timestamp.update(d);

                assert.ok(r === true);
                assert.ok(d["@timestamp"]);
            });
            it('@something', function() {
                var d = {
                };
                var r = _.timestamp.update(d, {
                    key: "@something",
                });

                assert.ok(r === true);
                assert.ok(!d["@timestamp"]);
                assert.ok(d["@something"]);
            });
            it('forced', function() {
                var d = {
                };
                var r = _.timestamp.update(d, {
                    timestamp: TS_NEW,
                });

                assert.ok(r === true);
                assert.strictEqual(d["@timestamp"], TS_NEW);
            });
            it('should be added', function() {
                var d = {
                };
                var r = _.timestamp.update(d);

                assert.ok(r === true);
                assert.ok(d["@timestamp"]);
            });
        });
        describe('out of date timestamp', function(){
            it('should be updated', function() {
                var d = {
                    "@timestamp": TS_OLD,
                };
                var r = _.timestamp.update(d);

                assert.ok(r === true);
                assert.ok(d["@timestamp"]);
                assert.ok(d["@timestamp"] > TS_OLD);
            });
            it('should be updated - forced value', function() {
                var d = {
                    "@timestamp": TS_OLD,
                };
                var r = _.timestamp.update(d, {
                    timestamp: TS_NEW,
                });

                assert.ok(r === true);
                assert.ok(d["@timestamp"]);
                assert.strictEqual(d["@timestamp"], TS_NEW);
            });
        });
        describe('future timestamp', function(){
            it('should NOT be updated - future value', function() {
                var d = {
                    "@timestamp": TS_FUTURE,
                };
                var r = _.timestamp.update(d, {
                });

                assert.ok(r === false);
                assert.ok(d["@timestamp"]);
                assert.strictEqual(d["@timestamp"], TS_FUTURE);
            });
            it('should NOT be updated - forced value', function() {
                var d = {
                    "@timestamp": TS_NEW,
                };
                var r = _.timestamp.update(d, {
                    timestamp: TS_OLD,
                });

                assert.ok(r === false);
                assert.ok(d["@timestamp"]);
                assert.strictEqual(d["@timestamp"], TS_NEW);
            });
        });
    });
    describe('add', function(){
        describe('bad', function(){
            it('null', function() {
                var d = null;
                var r = _.timestamp.add(d);

                assert.strictEqual(d, r);
            });
            it('string', function() {
                var d = "hello world";
                var r = _.timestamp.add(d);

                assert.strictEqual(d, r);
            });
        });
        describe('no timestamp', function(){
            it('should be added', function() {
                var d = {
                };
                var r = _.timestamp.add(d);

                // note d isn't modified
                assert.ok(!d["@timestamp"]);
                assert.ok(r["@timestamp"]);
            });
            it('@something', function() {
                var d = {
                };
                var r = _.timestamp.add(d, {
                    key: "@something",
                });

                assert.ok(!d["@something"]);
                assert.ok(r["@something"]);
            });
        });
        describe('existing timestamp', function(){
            it('should NOT be updated', function() {
                var d = {
                    "@timestamp": TS_OLD,
                };
                var r = _.timestamp.add(d);

                assert.strictEqual(d["@timestamp"], TS_OLD);
                assert.ok(r["@timestamp"]);
                assert.ok(r["@timestamp"] === TS_OLD);
            });
        });
    });
    describe('advance', function(){
        describe('bad', function(){
            it('null', function() {
                as_now(function() {
                    var d = null;
                    var r = _.timestamp.advance(d);
            
                    assert.strictEqual(r, TS_NOW);
                });
            });
            it('number', function() {
                as_now(function() {
                    var d = 123;
                    var r = _.timestamp.advance(d);

                    assert.strictEqual(r, TS_NOW);
                });
            });
            
        });
        describe('dates', function(){
            it('past', function(){
                as_now(function() {
                    var r = _.timestamp.advance(TS_OLD);

                    assert.strictEqual(r, TS_NOW);
                });
            });
            it('present', function(){
                as_now(function() {
                    var r = _.timestamp.advance(TS_NOW);

                    assert.ok(r > TS_NOW);
                });
            });
            it('future', function(){
                as_now(function() {
                    var r = _.timestamp.advance(TS_FUTURE);

                    assert.ok(r > TS_NOW);
                    assert.ok(r > TS_FUTURE);
                });
            });
        });
    });
})
