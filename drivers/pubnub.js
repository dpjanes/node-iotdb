/*
 *  drivers/pubnub.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-10-14
 *
 *  Connect to
 *
 *  Copyright [2013-2014] [David P. Janes]
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

var _ = require("../helpers");
var driver = require('../driver');
var iotdb = require('../iotdb');
var FIFOQueue = require('../queue').FIFOQueue;
var node_pubnub = require("pubnub");
var Interaction = require('../interaction').Interaction;

var queue = new FIFOQueue("PubNubDriver");

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'PubNubDriver',
});

/**
 */
var PubNubDriver = function (paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: "iot-driver:pubnub",
        initd: {}
    });

    self.verbose = paramd.verbose;
    self.driver = _.expand(paramd.driver);

    self.channel = null;
    self.selector = null;

    self._init(paramd.initd);

    return self;
};

PubNubDriver.prototype = new driver.Driver();

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
PubNubDriver.prototype._init = function (initd) {
    var self = this;

    if (!initd) {
        return;
    }
    if (initd.channel) {
        self.channel = initd.channel;
    }
    if (initd.selector) {
        self.selector = initd.selector;
    }
};

/**
 *  Handle disconnects
 */
PubNubDriver.prototype.disconnect = function () {
    var self = this;

    logger.info({
        method: "disconnect",
        channel: self.channel,
        selector: self.selector
    }, "called");
    driver.Driver.prototype.disconnect.call(self);

    /*
     *  If there's a 'selector', this channel is being
     *  shared amongst many different PubNubDrivers
     *  and thus we can't just unsubscribe
     */
    if (_.isEmpty(self.selector) || iotdb.shutting_down()) {
        self._pubnub().unsubscribe({
            channel: self.channel
        });
    }
};


/**
 *  See {@link Driver#identity Driver.identity}
 */
PubNubDriver.prototype.identity = function (kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {};
        identityd["driver"] = self.driver;

        if (self.channel) {
            identityd["channel"] = self.channel;
        }
        if (self.selector) {
            identityd["selector"] = "" + self.selector;
        }

        _.thing_id(identityd);

        self.__identityd = identityd;
    }

    return self.__identityd;
};

/**
 *  See {@link Driver#setup Driver.setup}
 */
PubNubDriver.prototype.setup = function (paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd);

    return self;
};

/*
 *  See {@link Driver#discover Driver.discover}
 */
PubNubDriver.prototype.discover = function (paramd, discover_callback) {
    var self = this;
    var driver;

    if (_.isEmpty(paramd.initd.channel)) {
        logger.error({
            method: "discover",
            cause: "likely Model is being discovered or setup incorrectly",
            paramd: paramd,
        }, "expected initd.channel");
        return;
    }

    logger.info({
        method: "discover",
        paramd: paramd,
    }, "called");

    var pubnub = self._pubnub();
    if (!pubnub) {
        logger.error({
            method: "discover",
            cause: "configuration required",
        }, "PubNub not setup");
        return;
    }


    /*
     *  'selector' lets you differentiate amongst
     *  different devices within the same stream
     */
    if (_.isEmpty(paramd.initd.selector)) {
        driver = new PubNubDriver({
            channel: paramd.channel,
        });

        discover_callback(driver);

        pubnub.subscribe({
            channel: paramd.initd.channel,
            callback: function (msgd) {
                if (driver.disconnected || iotdb.shutting_down()) {
                    pubnub.unsubscribe({
                        channel: paramd.initd.channel,
                    });
                    return;
                }

                driver._pubnub_message(msgd);
            }
        });
    } else {
        /*
         *  Create a new Driver for each message
         *  with a new value for paramd.initd.selector
         */
        var selectord = {};
        pubnub.subscribe({
            channel: paramd.initd.channel,
            callback: function (msgd) {
                if (iotdb.shutting_down()) {
                    pubnub.unsubscribe({
                        initd: {
                            channel: paramd.initd.channel,
                        },
                    });
                    return;
                }

                var selector_value = msgd[paramd.initd.selector];
                if (selector_value === undefined) {
                    return;
                }

                driver = selectord[selector_value];
                if (driver === undefined) {
                    driver = new PubNubDriver({
                        initd: {
                            channel: paramd.channel,
                            selector: selector_value,
                        }
                    });
                    logger.info({
                        method: "discover/subscribe/callback",
                        selector: paramd.initd.selector,
                        selector_value: selector_value,
                        identity: driver.identity().thing_id,
                    }, "found new selector value");
                    selectord[selector_value] = driver;
                    discover_callback(driver);
                }

                driver._pubnub_message(msgd);
            }
        });
    }
};

/**
 */
PubNubDriver.prototype._pubnub_message = function (msgd) {
    var self = this;

    logger.info({
        method: "_pubnub_message",
        msgd: msgd,
        identity: self.identity().thing_id,
        channel: self.channel,
        selector: self.selector,
    }, "received");

    self.pulled(msgd);
};

var __pubnub;

/**
 */
PubNubDriver.prototype._pubnub = function () {
    var self = this;

    if (!__pubnub) {
        var publish_key = self.cfg_get('stores/pubnub/publish_key');
        var subscribe_key = self.cfg_get('stores/pubnub/subscribe_key');
        if (!publish_key || !subscribe_key) {
            var interaction = new Interaction();

            interaction.header("PubNubDriver: This store is not set up yet");
            interaction.log("Please set up your PubNub account and then enter the following command");
            interaction.log();
            interaction.code("iotdb --global set stores/pubnub/publish_key 'pub-c-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'");
            interaction.code("iotdb --global set stores/pubnub/subscribe_key 'pub-c-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'");
            interaction.end();

            logger.error({
                method: "pubnub",
                cause: "publish_key not in keystore",
            }, "no PubNub publish key");

            return null;
        }

        __pubnub = node_pubnub.init({
            publish_key: publish_key,
            subscribe_key: subscribe_key,
        });
    }

    return __pubnub;
};

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
PubNubDriver.prototype.push = function (paramd) {
    var self = this;

    logger.info({
        method: "push",
        unique_id: self.unique_id,
        initd: paramd.initd,
        driverd: paramd.driverd
    }, "called");

    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
PubNubDriver.prototype.pull = function () {
    var self = this;

    logger.info({
        method: "pull",
        unique_id: self.unique_id
    }, "called - inherently does nothing");

    return self;
};


/*
 *  API
 */
exports.Driver = PubNubDriver;
