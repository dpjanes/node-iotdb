/*
 * Copyright (c) 2014 LG Electronics.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var events = require('events');
var WebSocket = require('ws');
var util = require('util');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb/drivers/libs',
    module: 'LG-client',
});


var LGClient = function () {
    events.EventEmitter.call(this);

    this.requestId = 1;
    this.requests = {};
    this.manifest = {
        permissions: [
            "APP_TO_APP",
            "CONTROL_AUDIO",
            "CONTROL_DISPLAY",
            "CONTROL_INPUT_JOYSTICK",
            "CONTROL_INPUT_MEDIA_PLAYBACK",
            "CONTROL_INPUT_MEDIA_RECORDING",
            "CONTROL_INPUT_TEXT",
            "CONTROL_INPUT_TV",
            "CONTROL_MOUSE_AND_KEYBOARD",
            "CONTROL_POWER",
            "LAUNCH",
            "LAUNCH_WEBAPP",
            "READ_CURRENT_CHANNEL",
            "READ_INPUT_DEVICE_LIST",
            "READ_INSTALLED_APPS",
            "READ_NETWORK_STATE",
            "READ_RUNNING_APPS",
            "READ_TV_CHANNEL_LIST",
            "WRITE_NOTIFICATION_TOAST",
        ]
    };
};

events.EventEmitter.call(LGClient);
util.inherits(LGClient, events.EventEmitter);

LGClient.prototype.connect = function (ip, cb) {
    if (cb) {
        var handler = function () {
            this.removeListener('connected', handler);
            this.removeListener('error', handler);
            this.removeListener('close', handler);

            cb();
        };

        this.on('connected', handler);
        this.on('error', handler);
        this.on('close', handler);
    }

    this.ws = new WebSocket("ws://" + ip + ":3000", {
        origin: "null"
    });

    this.ws.on('open', function () {
        logger.info({
            method: "connect/on(open)",
        }, "called");

        this.send({
            type: 'register',
            payload: {
                manifest: this.manifest,
                "client-key": "be6c232c39b4afb816d7b952b0581bfc"
            }
        });
    }.bind(this));

    this.ws.on('message', function (data) {
        logger.info({
            method: "connect/on(message)",
            data: data
        }, "called");

        var message = JSON.parse(data);

        var request = message.id ? this.requests[message.id] : null;

        if (message.type === "response" || message.type === "error") {
            if (request) {
                if (request.callback) {
                    request.callback(message.error, message.payload);
                }

                if (!request.isSubscription) {
                    delete this.requests[request];
                }
            }
        } else if (message.type === "registered") {
            this.emit('connected');
        }
    }.bind(this));

    this.ws.on('error', function (err) {
        this.emit('error', err);
    }.bind(this));

    this.ws.on('close', function () {
        this.emit('close', 'connection closed');
    }.bind(this));
};

LGClient.prototype.send = function (obj) {
    logger.info({
        method: "send",
        object: obj
    }, "called");

    this.ws.send(JSON.stringify(obj));
};

LGClient.prototype.sendRequest = function (uri, payload, cb) {
    var requestId = this.requestId++;

    this.send({
        type: 'request',
        id: requestId,
        uri: uri,
        payload: payload || {}
    });

    this.requests[requestId] = {
        callback: cb
    };
};

exports.LGClient = LGClient;
