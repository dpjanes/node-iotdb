/*
 *  test_exit.js
 *
 *  David Janes
 *  IOTDB
 *  2016-07-13
 */

"use strict";

const assert = require("assert")
const events = require("events")

const exit = require("../exit")

const my_process = () => {
    const self = Object.assign({}, events.EventEmitter.prototype);

    self.exit = () => {
        self.emit("_EXIT");
    };

    self._after = () => {
        self.removeAllListeners();
    };

    return self;
};

describe('test_exit', function() {
    beforeEach('before', function() {
        exit.shims.setProcess(my_process())
    });
    afterEach('after', function() {
        exit.shims.getProcess()._after();
        exit.shims.setProcess(process);
    });

    describe('setup', function() {
        it('with manager', function() {
            exit.setup({
                disconnect: () => 0,
            });
        });
    });
    describe('SIGINT', function() {
        it('no delay', function(done) {
            let _disconnected = false;

            assert(!exit.shutting_down());
            exit.setup({
                disconnect: () => {
                    _disconnected = true;
                    return 0;
                }
            });
            const _process = exit.shims.getProcess();

            _process.on("_EXIT", () => {
                assert(_disconnected);
                assert(exit.shutting_down());
                done();
            });
            _process.emit("SIGINT");
        });
        it('100ms delay', function(done) {
            let _disconnected = false;

            assert(!exit.shutting_down());
            exit.setup({
                disconnect: () => {
                    _disconnected = true;
                    return 100;
                }
            });
            const _process = exit.shims.getProcess();

            let _now = new Date().getTime();
            _process.on("_EXIT", () => {
                assert(_disconnected);
                assert(exit.shutting_down());
                assert((new Date().getTime() - _now) >= 100);
                done();
            });
            _process.emit("SIGINT");
        });
    });
});
