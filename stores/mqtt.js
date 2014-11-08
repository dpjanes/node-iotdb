/*
 *  stores/mqtt.js
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
var mqtt = require('mqtt');
var store = require('../store');
var Interaction = require('../interaction').Interaction;

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'store/mqtt',
});

/**
 */
var MQTTStore = function (paramd) {};

MQTTStore.prototype = new store.Store();
MQTTStore.prototype.store_id = "iot-store:mqtt";

var key_topic = _.expand("iot-store:mqtt/topic");

/*
 *  See {@link Store#on_change Store.on_change}
 */
MQTTStore.prototype.on_change = function (thing) {
    var self = this;

    var stored = self.stored();
    if (!stored) {
        logger.error({
            method: "on_change",
            cause: "configuration required",
        }, "MQTTStore not setup");
        return;
    }

    /**
     *  We can publish in lots of different ways,
     *  all specified by stored.topicds
     */
    var stated = thing.state();
    var iot = iotdb.iot();
    for (var ti in stored.topicds) {
        var topicd = stored.topicds[ti];
        var datad = {
            username: iot.username,
            model_code: thing.get_code(),
            thing_id: thing.thing_id(),
        }

        self._publish(topicd, datad, stored, stated);
    }
}

MQTTStore.prototype._publish = function (topicd, datad, stored, stated) {
    if (topicd.facet) {
        topicd.facet = false;
        topicd.facet = true;
    } else if (topicd.attribute_code) {
        for (var code in stated) {
            var value = stated[code];
            if ((value === null) || (value === undefined)) {
                continue
            }

            datad.attribute_code = code;

            var mqtt_topic = _.format(topicd.topic, datad);
            var mqtt_payload = JSON.stringify(value, null, 2);

            stored.client.publish(mqtt_topic, mqtt_payload);

            logger.info({
                method: "_publish/attribute_code",
                topic: mqtt_topic,
                payload: mqtt_payload,
            }, "broadcast this message");
        }
    } else {
        var mqtt_topic = _.format(topicd.topic, datad);
        var mqtt_payload = JSON.stringify(stated, null, 2);

        stored.client.publish(mqtt_topic, mqtt_payload);

        logger.info({
            method: "_publish/full",
            topic: mqtt_topic,
            payload: mqtt_payload,
        }, "broadcast this message");
    }
}

var __stored;

/**
 *  The store configuration.
 *  <p>
 *  Currently we have 1 Node-IOTDB installation ->
 *  1 store, but there's no reason it has to
 *  stay that way.
 */
MQTTStore.prototype.stored = function () {
    var self = this;

    if (!__stored) {
        var d = {
            client: null,
            host: null,
            port: 1883,
            topic: '',
        };
        d.host = self.cfg_get('stores/mqtt/host');
        d.port = parseInt(self.cfg_get('stores/mqtt/port', 1883));

        if (!d.host || !d.port) {
            var interaction = new Interaction();

            interaction.header("MQTTStore: This store is not set up yet");
            interaction.log("You must have an MQTT server. Then run the following command");
            interaction.log();
            interaction.code("iotdb-control --global set stores/mqtt/host '<hostname>'");
            interaction.code("iotdb-control --global set stores/mqtt/port '<port>' ## defaults to 1883");
            interaction.end();

            logger.error({
                method: "mqtt_client",
                cause: "keystore not set up by programmer",
            }, "no mqtt_host");

            return null;
        }

        // topics can be quite complicated
        var topics = self.cfg_get('stores/mqtt/topics');
        if (!topics) {
            topics = [
                "/u/{{ username }}/things/{{ model_code }}/{{ thing_id }}",
                "/u/{{ username }}/things/{{ facet }}/{{ thing_id }}",
                "/u/{{ username }}/things/{{ model_code }}/{{ thing_id }}/{{ attribute_code }}",
            ]
        } else if (_.isArray(topics)) {
        } else {
            topics = [ topics, ]
        }

        d.topicds = []
        for (var ti in topics) {
            var topic = topics[ti];
            var topicd = {
                topic: topic,
            }
            topic.replace(/{{(.*?)}}/g, function (match, variable) {
                variable = variable.replace(/ /g, '');
                topicd[variable] = true
            });
            d.topicds.push(topicd);
        }

        // connect
        __stored = d;
        __stored.client = mqtt.createClient(d.port, d.host);
        __stored.client.on('error', function(error) {
            logger.error({
                method: "_mqtt_client/on(error)",
                error: error,
            }, "unexpected");
        })
        __stored.client.on('disconnect', function() {
            logger.info({
                method: "_mqtt_client/on(disconnect)",
            }, "unexpected");
        })
    }


    return __stored;
};

/*
 *  API
 */
exports.Store = MQTTStore;
