/*
 *  TestBridge.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-01-06
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var iotdb = require('../../../iotdb');
var bridge = require('../../../bridge');
var _ = iotdb._;

var logger = iotdb.logger({
    name: 'node-iotdb',
    module: 'tests/instrument/homestar-test/TestBridge',
});

/**
 *  See {iotdb.bridge.Bridge#Bridge} for documentation.
 *  <p>
 *  @param {object|undefined} native
 *  only used for instances, should be 
 */
var TestBridge = function (initd, native) {
    var self = this;

    self.initd = _.defaults(initd,
        iotdb.settings().get("bridges/TestBridge/initd"), {
            poll: 30,
            number: 10,
            reachable: true,
        }
    );
    self.native = native;   // the thing that does the work - keep this name

    if (self.native) {
        self.queue = _.queue("TestBridge");
        self.istate = {};
    }
};

TestBridge.prototype = new bridge.Bridge();

TestBridge.prototype.name = function () {
    return "TestBridge";
};

/* --- lifecycle --- */

/**
 *  See {iotdb.bridge.Bridge#discover} for documentation.
 */
TestBridge.prototype.discover = function () {
    var self = this;

    logger.info({
        method: "discover"
    }, "called");

    var native = {
        note: "this is some data unique to a thing",
    };
    self.discovered(new TestBridge(self.initd, native));
};

/**
 *  See {iotdb.bridge.Bridge#connect} for documentation.
 */
TestBridge.prototype.connect = function (connectd) {
    var self = this;
    if (!self.native) {
        return;
    }

    self._validate_connect(connectd);

    self._setup_polling();
    self.pull();
};

TestBridge.prototype._setup_polling = function () {
    var self = this;
    if (!self.initd.poll) {
        return;
    }

    var timer = setInterval(function () {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.initd.poll * 1000);
};

TestBridge.prototype._forget = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "_forget"
    }, "called");

    self.native = null;
    self.pulled();
};

/**
 *  See {iotdb.bridge.Bridge#disconnect} for documentation.
 */
TestBridge.prototype.disconnect = function () {
    var self = this;
    if (self.native) {
        self._forget();
    }

    return 0.5;
};

/* --- data --- */

/**
 *  See {iotdb.bridge.Bridge#push} for documentation.
 */
TestBridge.prototype.push = function (pushd, done) {
    var self = this;
    if (!self.native) {
        done(new Error("not connected"));
        return;
    }

    self._validate_push(pushd);

    logger.info({
        method: "push",
        pushd: pushd
    }, "push");

    var qitem = {
        // if you set "id", new pushes will unqueue old pushes with the same id
        // id: self.number, 
        run: function () {
            self._push(pushd);
            self.queue.finished(qitem);
        },
        coda: function() {
            done();
        },
    };
    self.queue.add(qitem);
};

/**
 *  Do the work of pushing. If you don't need queueing
 *  consider just moving this up into push
 */
TestBridge.prototype._push = function (pushd) {
    var self = this;
    if (pushd.on !== undefined) {
        self.istate.on = pushd.on;
        self.pull();
    }
};

/**
 *  See {iotdb.bridge.Bridge#pull} for documentation.
 */
TestBridge.prototype.pull = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    self.pulled(self.istate);
};

/* --- state --- */

/**
 *  See {iotdb.bridge.Bridge#meta} for documentation.
 */
TestBridge.prototype.meta = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    return {
        "iot:thing-id": _.id.thing_urn.unique("Test", "0FAF0A6A-C1AD-413D-8C1B-2EEE3CBA9F0D", self.initd.number),
        "schema:name": self.native.name || "Test",
        "iot:thing-number": self.initd.number,
    };
};

/**
 *  See {iotdb.bridge.Bridge#reachable} for documentation.
 */
TestBridge.prototype.reachable = function () {
    return this.initd.reachable && this.native !== null;
};

/**
 *  See {iotdb.bridge.Bridge#configure} for documentation.
 */
TestBridge.prototype.configure = function (app) {};

/* --- test suite --- */
TestBridge.prototype.test_disconnect = function (state) {
    var self = this;

    self.native = null;
    self.pulled();
};

TestBridge.prototype.test_meta = function () {
    var self = this;

    self.pulled();
};

TestBridge.prototype.test_pull = function (stated) {
    var self = this;

    self.istate = _.d.compose.shallow(stated, self.istate);
    self.pulled(self.istate);
};

/*
 *  API
 */
exports.Bridge = TestBridge;
