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
    module: 'LG',
});

var LGFinder = require('./lg-finder').LGFinder;
var LGClient = require('./lg-client').LGClient;

_lg_doit = function (client, request_id, paramd, callback) {
    client.sendRequest(request_id, paramd, function (error, response) {
        logger.info({
            method: "_lg_doit",
            request_id: request_id,
            error: error,
            response: response,
        }, "response");

        callback(error, response);
    });
}

/**
 *  More or less corresponding to Bands
 */
exports.listLaunchPoints = function (client, callback) {
    _lg_doit(client, 'ssap://com.webos.applicationManager/listLaunchPoints', {}, callback);
}

/**
 *  Get the TV volume status
 */
exports.getVolume = function (client, callback) {
    _lg_doit(client, 'ssap://audio/getVolume', {}, callback);
}

/**
 *  Set the TV volume
 */
exports.setVolume = function (client, volume, callback) {
    _lg_doit(client, 'ssap://audio/setVolume', {
        volume: volume
    }, callback);
}

/**
 *  Get the TV mute status
 */
exports.getMute = function (client, callback) {
    _lg_doit(client, 'ssap://audio/getMute', {}, callback);
}

/**
 *  Set the TV mute
 */
exports.setMute = function (client, mute, callback) {
    _lg_doit(client, 'ssap://audio/setMute', {
        mute: mute
    }, callback);
}

/**
 *  Get the TV channel
 */
exports.getChannel = function (client, callback) {
    _lg_doit(client, 'ssap://tv/getCurrentChannel', {}, callback);
};

/**
 *  Set the TV channel
 */
exports.setChannel = function (client, channel, callback) {
    _lg_doit(client, 'ssap://tv/openChannel', { channelNumber: channel }, callback);
};

/**
 */
exports.switchInput = function (client, input, callback) {
    _lg_doit(client, 'ssap://tv/switchInput', {
        inputId: input
    }, callback);
}

/**
 *  More or less the band of the TV. This is the best
 *  way to change inputs.
 *
 *  Examples:
 *	- anyplace.tv
 *	- cinemanow
 *	- com.webos.app.browser
 *	- com.webos.app.camera
 *	- com.webos.app.capturetv
 *	- com.webos.app.connectionwizard
 *	- com.webos.app.discovery
 *	- com.webos.app.hdmi1
 *	- com.webos.app.hdmi2
 *	- com.webos.app.livetv
 *	- com.webos.app.miracast
 *	- com.webos.app.notificationcenter
 *	- com.webos.app.smartshare
 *	- com.webos.app.tvuserguide
 *	- crackle
 *	- netflix
 *	- tkc
 *	- youtube.leanback.v4
 */
exports.launch = function (client, id, callback) {
    _lg_doit(client, 'ssap://system.launcher/launch', {
        id: id
    }, callback);
}
