/*
 *  bridge.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-04-25
 *
 *  Copyright [2013-2016] [David P. Janes]
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

const iotdb = require('./iotdb');
const _ = require("./helpers");

const logger = _.logger.make({
    name: 'iotdb',
    module: 'Bridge',
});

/**
 *  EXEMPLAR and INSTANCE
 *  <p>
 *  No subclassing needed! The following functions are
 *  injected _after_ this is created, and before .discover and .connect
 *  <ul>
 *  <li><code>discovered</code> - tell IOTDB that we're talking to a new Thing
 *  <li><code>pulled</code> - got new data
 *  </ul>
 */
const Bridge = function () {
    const self = this;

    self.initd = {};
    self.native = null;
    self.connectd = {
        data_in: function (paramd) {
            _.extend(paramd.cookd, paramd.rawd);
        },

        data_out: function (paramd) {
            _.extend(paramd.rawd, paramd.cookd);
        },
    };
};

Bridge.prototype._isBridge = true;

/**
 *  EXEMPLAR and INSTANCE
 *  <p>
 *  Return the name of the Bridge. Should
 *  be the same as the class name, without the
 *  Bridge on the end
 */
Bridge.prototype.name = function () {
    return this.constructor.name;
};

/* --- lifecycle --- */

/**
 *  EXEMPLAR.
 *  <p>
 *  <ul>
 *  <li>look for Things (using <code>self.bridge</code> data to initialize)
 *  <li>find / create a <code>native</code> that does the talking
 *  <li>create an Bridge(native)
 *  <li>call <code>self.discovered(bridge)</code> with it
 */
Bridge.prototype.discover = function () {
    logger.error({
        method: "discover",
        cause: "likely subclass is not finished",
        bridge: this.name(),
    }, "not implemented");
};

/**
 *  INSTANCE
 *  <p>
 *  This is called when the Bridge bridge is going
 *  to be used for real.
 */
Bridge.prototype.connect = function (connectd) {
    this._validate_connect(connectd);
    logger.error({
        method: "connect",
        cause: "likely subclass is not finished",
        bridge: this.name(),
    }, "not implemented");
};

Bridge.prototype._validate_connect = function (connectd) {
    if (!_.is.Dictionary(connectd)) {
        throw new Error("Bridge.connect: 'connectd' should be an Dictionary, not: " + connectd);
    }
};

/**
 *  INSTANCE and EXEMPLAR (during shutdown).
 *  <p>
 *  This is called when the Bridge is no longer needed.
 */
Bridge.prototype.disconnect = function () {
    logger.error({
        method: "disconnect",
        cause: "likely subclass is not finished",
        bridge: this.name(),
    }, "not implemented");
};

/* --- data --- */

/**
 *  INSTANCE.
 *  <p>
 *  Send data to whatever you're taking to.
 */
Bridge.prototype.push = function (pushd, done) {
    this._validate_push(pushd, done);
    logger.error({
        method: "push",
        cause: "likely subclass is not finished",
        bridge: this.name(),
    }, "not implemented");

    done();
};

Bridge.prototype._validate_push = function (pushd, done) {
    if (!_.is.Dictionary(pushd)) {
        throw new Error("Bridge.push: 'pushd' should be a Dictionary, not: " + pushd);
    }

    /* UNCOMMENT WHEN MODULES ARE FIXED
    if (!_.is.Function(done)) {
        throw new Error("Bridge.push: 'done' should be a Function, not: " + done);
    }
    */
};

/**
 *  INSTANCE.
 *  <p>
 *  Pull data from whatever we're talking to. You don't
 *  have to implement this if it doesn't make sense
 */
Bridge.prototype.pull = function () {
    logger.error({
        method: "pull",
        cause: "likely subclass is not finished",
        bridge: this.name(),
    }, "not implemented");
};

/* --- state --- */

/**
 *  INSTANCE.
 *  <p>
 *  Return the metadata - compact form can be used.
 *  Does not have to work when not reachable
 *  <p>
 *  Really really useful things are:
 *  <ul>
 *  <li><code>iot:thing</code> required - a unique ID
 *  <li><code>iot:device</code> suggested if linking multiple things together
 *  <li><code>schema:name</code>
 *  <li><code>iot:type.number</code>
 *  <li><code>schema:manufacturer</code>
 *  <li><code>schema:model</code>
 */
Bridge.prototype.meta = function () {
    logger.error({
        method: "meta",
        cause: "likely subclass is not finished",
        bridge: this.name(),
    }, "not implemented");
    return {};
};

/**
 *  INSTANCE.
 *  Return True if this is reachable. You
 *  do not need to worry about connect / disconnect /
 *  shutdown states, they will be always checked first.
 */
Bridge.prototype.reachable = function () {
    return true;
};

/**
 *  INSTANCE.
 *  Configure an express web page to configure this Bridge.
 *  Return the name of the Bridge, which may be
 *  listed and displayed to the user.
 */
Bridge.prototype.configure = function (app) {
    this._validate_configure(app);
};

Bridge.prototype._validate_configure = function (app) {
    if (!_.is.Object(app) || !app.put || !app.get) {
        throw new Error("Bridge.configure: 'app' should be an express app instance, not: " + app);
    }
};

/**
 *  EXEMPLAR.
 *  Reset the Bridge to ground state
 */
Bridge.prototype.reset = function () {};

/**
 *  EXEMPLAR
 *  <p>
 *  Do not implement - new code will be injected at runtime
 */
Bridge.prototype.discovered = function (bridge) {
    throw new Error("Bridge.discovered not implemented");
};

/**
 *  INSTANCE
 *  <p>
 *  Do not implement - new code will be injected at runtime
 */
Bridge.prototype.pulled = function (pulld) {
    throw new Error("Bridge.pulled not implemented");
};

/*
 *  API
 */
exports.Bridge = Bridge;
