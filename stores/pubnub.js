/*
 *  stores/pubnub.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-10-23
 *
 *  Connect to PubNub.io
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

var iotdb = require('iotdb');
var _ = require("../helpers");
var store = require('../store');
var Interaction = require('../interaction').Interaction;
var node_pubnub = require("pubnub");

var key_name = _.expand("iot-store:pubnub/name");

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'store/pubnub',
});

/**
 */
var PubNubStore = function (paramd) {
};

PubNubStore.prototype = new store.Store();
PubNubStore.prototype.store_id = "iot-store:pubnub";

/*
 *  See {@link Store#on_change Store.on_change}
 */
PubNubStore.prototype.on_change = function (thing) {
    var self = this;

    var pubnub = self.pubnub();
    if (!pubnub) {
        logger.error({
            method: "on_change",
            cause: "configuration required (TBA)",
        }, "PubNub not setup");
        return;
    }

    var meta = thing.meta();
    var pubnub_channel = meta.get(key_name, null);
    if (pubnub_channel === null) {
        pubnub_channel = thing.thing_id();
        meta.set(key_name, pubnub_channel);

        logger.info({
            method: "on_change",
            channel: pubnub_channel,
        }, "PubNub channel assigned to Thing");
    }

    /**
     *  per Thing publishing
     */
    var stated = thing.state();

    pubnub.publish({ 
        channel: pubnub_channel,
        message: stated,
        callback: function() {
            logger.info({
                method: "on_change",
                channel: pubnub_channel,
                stated: stated,
            }, "update success");
        },
        error: function(error) {
            logger.error({
                method: "on_change",
                channel: pubnub_channel,
                error: error,
                cause: "probably a network or PubNub server error",
            }, "update failed");
        },
    });

    /**
     *  all Things publishing
     */
    var model_iri = meta.get('iot:model');
    if (model_iri) {
        stated['@context'] = model_iri;
        stated['@type'] = model_iri.replace(/^.*\//, '');

        var thing_iri = meta.get('iot:thing');
        if (thing_iri) {
            stated['iot:thing'] = thing_iri;
        }
    }

    var common_channel = "iotdb";
    pubnub.publish({ 
        channel: common_channel,
        message: stated,
        callback: function() {
            logger.info({
                method: "on_change",
                channel: common_channel,
                stated: stated,
            }, "update success");
        },
        error: function(error) {
            logger.error({
                method: "on_change",
                channel: common_channel,
                error: error,
                cause: "probably a network or PubNub server error",
            }, "update failed");
        },
    });
};

var pubnub;

/**
 */
PubNubStore.prototype.pubnub = function () {
    var self = this;

    if (!pubnub) {
        var publish_key = self.cfg_get('pubnub/publish_key');
        var subscribe_key = self.cfg_get('pubnub/subscribe_key');
        if (!publish_key || !subscribe_key) {
            var interaction = new Interaction();

            interaction.header("PubNubStore: This store is not set up yet");
            interaction.log("Please set up your PubNub account and then enter the following command");
            interaction.log();
            interaction.code("iotdb-control --global set pubnub/publish_key 'pub-c-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'");
            interaction.code("iotdb-control --global set pubnub/subscribe_key 'pub-c-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'");
            interaction.end();

            logger.error({
                method: "pubnub",
                cause: "publish_key not in keystore",
            }, "no PubNub publish key");
            
            return null;
        }

        pubnub = node_pubnub.init({
            publish_key: publish_key,
            subscribe_key: subscribe_key,
        });
    }

    return pubnub;
};

/*
 *  API
 */
exports.Store = PubNubStore;
