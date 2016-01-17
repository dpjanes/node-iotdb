/*
 *  test_queue.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-17
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

var iotdb = require("../iotdb");

describe('test_queue', function() {
    describe('constructor', function() {
        it('no arguments', function() {
            var queue = new iotdb.Queue();

            assert.strictEqual(queue.name, "unnamed-queue");
            assert.strictEqual(queue.qn, 1);
        });
        it('with name', function() {
            var queue = new iotdb.Queue("my-queue");

            assert.strictEqual(queue.name, "my-queue");
            assert.strictEqual(queue.qn, 1);
        });
        it('with name and paramd', function() {
            var queue = new iotdb.Queue("my-queue", {
                qn: 4,
            });

            assert.strictEqual(queue.name, "my-queue");
            assert.strictEqual(queue.qn, 4);
        });
    });
    describe('add', function() {
        it('simple', function(done) {
            var queue = new iotdb.Queue();
            queue.add({
                run: function(_queue, _qitem) {
                    _queue.finished(_qitem);
                    done();
                },
            });
        });
        it('simple with coda', function(done) {
            var queue = new iotdb.Queue();
            queue.add({
                run: function(_queue, _qitem) {
                    _queue.finished(_qitem);
                },
                coda: function() {
                    done();
                },
            });
        });
        it('multiples', function(done) {
            var queue = new iotdb.Queue();
            var ran_first = false;
            var ran_second = false;
            queue.add({
                run: function(_queue, _qitem) {
                    assert.ok(!ran_first);
                    assert.ok(!ran_second);

                    ran_first = true;
                    _queue.finished(_qitem);
                },
            });
            queue.add({
                run: function(_queue, _qitem) {
                    assert.ok(ran_first);
                    assert.ok(!ran_second);

                    ran_second = true;
                    _queue.finished(_qitem);
                },
                coda: function() {
                    assert.ok(ran_first);
                    assert.ok(ran_second);

                    done();
                },
            });
        });
        it('multiples with same id', function(done) {
            var queue = new iotdb.Queue();
            queue.pause();

            var ran_first = false;
            var ran_second = false;
            queue.add({
                id: "shared",
                run: function(_queue, _qitem) {
                    // this will actually never run
                    assert.ok(false);

                    ran_first = true;
                    _queue.finished(_qitem);
                },
            });
            queue.add({
                id: "shared",
                run: function(_queue, _qitem) {
                    assert.ok(!ran_first);
                    assert.ok(!ran_second);

                    ran_second = true;
                    _queue.finished(_qitem);
                },
                coda: function() {
                    assert.ok(!ran_first);
                    assert.ok(ran_second);

                    done();
                },
            });

            queue.resume();
        });
        
    });
})
