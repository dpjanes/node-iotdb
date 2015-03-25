/*
 *  test_meta.js
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

var TS_1 = '2010-03-25T21:28:43.613Z';
var ts_1 = function() { return TS_1; };

var TS_2 = '2012-03-25T21:28:43.613Z';
var ts_2 = function() { return TS_3; };

var TS_3 = '2015-03-25T21:28:43.613Z';
var ts_3 = function() { return TS_3; };

var fake_thing = {
    thing_id: function() {
        "urn:iotdb:thing:fake_thing:1"
    },

    meta_changed: function() {
    },
};


/* --- tests --- */
describe('test_meta:', function(){
    it('constructor', function(){
        /* not a real test but let's get the ball rolling */
        var meta = new Meta(fake_thing);
        assert.strictEqual(meta.thing, fake_thing);
        assert.ok(_.isEmpty(meta._updated));
    });
    it('initial timestamp', function() {
        /* timestamp should initially be blank */
        var meta = new Meta(fake_thing);
        var timestamp = meta.get('@timestamp');
        assert.strictEqual(timestamp, undefined);
    });
    it('set timestamp', function() {
        /* timestamp should be later than when we started */
        var meta = new Meta(fake_thing);
        var now = meta._make_timestamp();
        sleep.usleep(1000 * 10);
        meta.set('key', 'value');
        var later = meta.get('@timestamp');
        assert.ok(later > now);
    });
    it('update timestamp - no paramd', function() {
        /* timestamp should be blank */
        var meta = new Meta(fake_thing);
        meta.update({
            'key': 'value',
        });
        var timestamp = meta.get('@timestamp');
        assert.strictEqual(timestamp, undefined);
    });
    it('update timestamp - set_timestamp: true', function() {
        /* timestamp should be later than when we started */
        var meta = new Meta(fake_thing);
        var now = meta._make_timestamp();
        sleep.usleep(1000 * 10);
        meta.update({
            'key': 'value',
        }, {
            set_timestamp: true
        });
        var later = meta.get('@timestamp');
        assert.ok(later > now);
    });
    it('update timestamp - conflict: ind:no, update:no', function() {
        /* if no timestamps at all, take the new */
        var meta = new Meta(fake_thing);
        meta.update({
            'key': 'old-value',
        }, {});
        meta.update({
            'key': 'new-value',
        }, {
            check_timestamp: true,
        });
        assert.equal(meta.get('key'), 'new-value');
    });
    it('update timestamp - conflict: ind:yes, update:no', function() {
        /* ignore update if no new timestamp but there is an old one */
        var meta = new Meta(fake_thing);
        meta.update({
            '@timestamp': TS_1,
            'key': 'old-value',
        }, {});
        meta.update({
            'key': 'new-value',
        }, {
            check_timestamp: true,
        });
        assert.equal(meta.get('key'), 'old-value');
    });
    it('update timestamp - conflict: ind:no, update:yes', function() {
        /* update if new one has timestamp and old doesn't */
        var meta = new Meta(fake_thing);
        meta.update({
            'key': 'old-value',
        }, {});
        meta.update({
            '@timestamp': TS_1,
            'key': 'new-value',
        }, {
            check_timestamp: true,
        });
        assert.equal(meta.get('key'), 'new-value');
    });
    it('update timestamp - conflict: ind:TS_1, update:TS_2', function() {
        /* update if newer */
        var meta = new Meta(fake_thing);
        meta.update({
            '@timestamp': TS_1,
            'key': 'old-value',
        }, {});
        meta.update({
            '@timestamp': TS_2,
            'key': 'new-value',
        }, {
            check_timestamp: true,
        });
        assert.equal(meta.get('key'), 'new-value');
    });
    it('update timestamp - conflict: ind:TS_2, update:TS_1', function() {
        /* no update if older */
        var meta = new Meta(fake_thing);
        meta.update({
            '@timestamp': TS_2,
            'key': 'old-value',
        }, {});
        meta.update({
            '@timestamp': TS_1,
            'key': 'new-value',
        }, {
            check_timestamp: true,
        });
        assert.equal(meta.get('key'), 'old-value');
    });
    it('update timestamp - conflict: ind:TS_2, update:TS_2', function() {
        /* no update if the same timestamp */
        var meta = new Meta(fake_thing);
        meta.update({
            '@timestamp': TS_2,
            'key': 'old-value',
        }, {});
        meta.update({
            '@timestamp': TS_2,
            'key': 'new-value',
        }, {
            check_timestamp: true,
        });
        assert.equal(meta.get('key'), 'old-value');
    });
    it('update timestamp - conflict + set_timestamp', function() {
        /* timestamp should take the value, not the current time */
        var meta = new Meta(fake_thing);
        meta.update({
            '@timestamp': TS_1,
            'key': 'old-value',
        }, {});
        meta.update({
            '@timestamp': TS_2,
            'key': 'new-value',
        }, {
            check_timestamp: true,
            set_timestamp: true,
        });
        assert.equal(meta.get('key'), 'new-value');
        assert.equal(meta.get('@timestamp'), TS_2);
    });
})
