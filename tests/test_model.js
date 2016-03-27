/*
 *  test_model.js
 *
 *  David Janes
 *  IOTDB
 *  2016-02-08
 */

"use strict";

var assert = require("assert")
var attribute = require("./instrument/attribute")
var model = require("../model")
var _ = require("../helpers")
var constants = require("../constants")

var NAME = "T Name";
var DESCRIPTION = "T Description";
var HELP = "T Help";

var T = model.make_model('T')
    .name(NAME)
    .description(DESCRIPTION)
    .help(HELP)
    .facet("iot-facet:switch")
    .facet("iot-facet:lighting")
    .attribute(
        attribute.make_boolean('on')
            .control()
            .reading()
    )
    .attribute(
        attribute.make_integer('brightness')
            .control()
            .maximum(10)
            .minimum(0)
    )
    .make();

/* --- tests --- */
describe('test_model', function(){
    describe('make', function(){
        it('make', function(){
            var t1 = new T();
            var t2 = t1.make();

            assert.ok(_.is.Thing(t1));
            assert.ok(_.is.Thing(t2));
            assert.strictEqual(t1.code(), t2.code());
        });
    });
    describe('getters', function(){
        it('make', function(){
            var t1 = new T();
            assert.strictEqual(t1.name(), NAME);
        });
        it('description', function(){
            var t1 = new T();
            assert.strictEqual(t1.description(), DESCRIPTION);
        });
        it('help', function(){
            var t1 = new T();
            assert.strictEqual(t1.help(), HELP);
        });
        it('facet', function(){
            var t1 = new T();
            var expect = [
                'https://iotdb.org/pub/iot-facet#switch',
                'https://iotdb.org/pub/iot-facet#lighting'
            ];

            assert.deepEqual(t1.facet(), expect);
        });
    });
    describe('band getters', function(){
        it('ostate', function(){
            var t1 = new T();
            var got = t1.state("ostate");
            var expect = { on: null, brightness: null, "@timestamp": _.timestamp.epoch(), };

            assert.deepEqual(got, expect);
        });
        it('istate', function(){
            var t1 = new T();
            var got = t1.state("istate");
            var expect = { on: null, "@timestamp": _.timestamp.epoch(), };  // because brightness is not a reading

            assert.deepEqual(got, expect);
        });
        it('meta', function(){
            var t1 = new T();
            var got = t1.state("meta");
            var subset = {
                'iot:thing-id': null,
                'iot:model-id': 't',
                'iot:facet': [ 'iot-facet:switch', 'iot-facet:lighting' ],
                'iot:reachable': false,
            };

            assert.ok(_.d.is.superset(got, subset));
        });
        it('model', function(){
            var t1 = new T();
            var got = t1.state("model");
            var subset = {
                '@id': '',
                '@type': 'iot:Model',
                'schema:name': 'T Name',
                'schema:description': 'T Description',
                'iot:help': 'T Help',
                'iot:facet': [ 'iot-facet:switch', 'iot-facet:lighting' ],
            };

            assert.ok(_.d.is.superset(got, subset));
            assert.ok(_.is.ArrayOfDictionary(got["iot:attribute"]));
        });
        it('unknown band', function(){
            var t1 = new T();
            var got = t1.state("bad");

            assert.strictEqual(got, null);
        });
        it('illegal band', function(){
            var t1 = new T();

            assert.throws(function() {
                var got = t1.state(0);
            }, Error);
        });
    });
    describe('iotql', function() {
        it('iotql', function(){
            var t1 = new T();
            var got = t1.iotql();

            assert.ok(_.is.String(got));
        });
    });
    describe('explain', function() {
        describe('all', function() {
            it('default', function() {
                var t1 = new T();
                var got = t1.explain();

                assert.ok(_.is.Dictionary(got));
                assert.ok(_.is.Dictionary(got[":on"]));
                assert.ok(!got[":brightness"]);
            });
            it('read + !write', function() {
                var t1 = new T();
                var got = t1.explain(null, { read: true, write: false });

                assert.ok(_.is.Dictionary(got));
                assert.ok(_.is.Dictionary(got[":on"]));
                assert.ok(!got[":brightness"]);
            });
            it('!read + write', function() {
                var t1 = new T();
                var got = t1.explain(null, { read: false, write: true });

                assert.ok(_.is.Dictionary(got));
                assert.ok(_.is.Dictionary(got[":on"]));
                assert.ok(_.is.Dictionary(got[":brightness"]));
            });
            it('read + write', function() {
                var t1 = new T();
                var got = t1.explain(null, { read: true, write: true });

                assert.ok(_.is.Dictionary(got));
                assert.ok(_.is.Dictionary(got[":on"]));
                assert.ok(!got[":brightness"]);
            });
            it('!read + write + code', function() {
                var t1 = new T();
                var got = t1.explain(null, { read: false, write: true, code: true });

                assert.ok(_.is.Dictionary(got));
                assert.ok(_.is.Dictionary(got["on"]));
                assert.ok(_.is.Dictionary(got["brightness"]));
                assert.ok(!got[":on"]);
                assert.ok(!got[":brightness"]);
            });
        });
        describe('one', function() {
            it('default', function() {
                var t1 = new T();
                var got = t1.explain(":on");

                assert.ok(_.is.Dictionary(got));
                assert.strictEqual(got["@type"], "iot:Attribute");
                assert.strictEqual(got["@id"], "#on");
            });
            it('read !write', function() {
                var t1 = new T();
                var got = t1.explain(":brightness", { read: true, write: true });

                assert.ok(_.is.Dictionary(got));
                assert.strictEqual(got["@type"], "iot:Attribute");
                assert.strictEqual(got["@id"], "#brightness");
            });
            it('!read write', function() {
                var t1 = new T();
                var got = t1.explain(":brightness", { read: false, write: true });

                assert.ok(_.is.Dictionary(got));
                assert.strictEqual(got["@type"], "iot:Attribute");
                assert.strictEqual(got["@id"], "#brightness");
            });
            it('!read !write', function() {
                var t1 = new T();
                var got = t1.explain(":brightness", { read: true, write: true });

                assert.ok(_.is.Dictionary(got));
                assert.strictEqual(got["@type"], "iot:Attribute");
                assert.strictEqual(got["@id"], "#brightness");
            });
            it('code', function() {
                // does nothing
                var t1 = new T();
                var got = t1.explain(":brightness", { code: true });

                assert.ok(_.is.Dictionary(got));
                assert.strictEqual(got["@type"], "iot:Attribute");
                assert.strictEqual(got["@id"], "#brightness");
            });
        });
    });
    describe('tag', function() {
        describe('set', function() {
            it('one', function(){
                var t1 = new T();
                t1.tag("a");

                assert.ok(t1.has_tag("a"));
                assert.ok(!t1.has_tag("b"));
                assert.ok(!t1.has_tag("c"));
            });
            it('multi', function(){
                var t1 = new T();
                t1.tag("a");
                t1.tag("b");
                t1.tag("c");

                assert.ok(t1.has_tag("a"));
                assert.ok(t1.has_tag("b"));
                assert.ok(t1.has_tag("c"));
            });
            it('multi list', function(){
                var t1 = new T();
                t1.tag([ "a", "b" ]);
                t1.tag([ "c", ]);

                assert.ok(t1.has_tag("a"));
                assert.ok(t1.has_tag("b"));
                assert.ok(t1.has_tag("c"));
            });
            it('bad single', function(){
                var t1 = new T();
                assert.throws(function() {
                    t1.tag(12);
                }, Error);
            });
            it('bad list', function(){
                var t1 = new T();
                assert.throws(function() {
                    t1.tag([ "a", 12, 13 ]);
                }, Error);
            });
        });
        describe('has_tag', function() {
            it('single', function(){
                var t1 = new T();
                t1.tag("a");
                t1.tag("b");
                t1.tag("c");

                assert.ok(t1.has_tag("a"));
                assert.ok(t1.has_tag("b"));
                assert.ok(t1.has_tag("c"));
            });
            it('list', function(){
                var t1 = new T();
                t1.tag("a");
                t1.tag("b");
                t1.tag("c");

                assert.ok(t1.has_tag([ "a" ]));
            });
            it('partially overlapping list', function(){
                var t1 = new T();
                t1.tag("a");
                t1.tag("b");
                t1.tag("c");

                assert.ok(t1.has_tag([ "c", "d" ]));
            });
            it('partially overlapping list', function(){
                var t1 = new T();
                t1.tag([ "a", "b", "c" ]);

                assert.ok(t1.has_tag([ "c", "d" ]));
            });
            it('bad single', function(){
                var t1 = new T();
                t1.tag([ "a", "b", "c" ]);
                assert.throws(function() {
                    t1.has_tag(12);
                }, Error);
            });
            it('bad list', function(){
                var t1 = new T();
                t1.tag([ "a", "b", "c" ]);
                assert.throws(function() {
                    t1.has_tag([ "a", 12, 13 ]);
                }, Error);
            });
        });
        it('tag', function() {
            var t1 = new T();
            t1.tag("a");
            t1.tag("b");
            t1.tag("c");

            assert.deepEqual(t1.tag(), [ "a", "b", "c" ]);
        });
    });
})
