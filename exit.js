/*
 *  iotdb.js
 *
 *  David Janes
 *  IOTDB.org
 *  2013-12-01
 *
 *  NodeJS IOTDB control
 *
 *  This is also the 'main' for the package
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

var events = require('events');
var util = require('util');
var path = require('path');
var fs = require('fs');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'exit',
});

var _shutting_down = false;

var _exit_cleanup = function (paramd, err) {
    _shutting_down = true;

    if (!((err === 0) && (paramd.from === "exit"))) {
        logger.info({
            method: "_exit_cleanup",
            from: paramd.from,
            err: err
        }, "start");
    }

    var time_wait = 0;
    if (paramd.cleanup) {
        time_wait = paramd.iot._things.disconnect();
    }

    if (paramd.exit) {
        if (time_wait === 0) {
            console.log("### calling process.exit(0) - good-bye!");
            process.exit(0);
        } else {
            logger.info({
                method: "_exit_cleanup",
                exiting_in: time_wait / 1000.0
            }, "delaying exit");
            setTimeout(process.exit, time_wait);
        }
    }
};

var setup_exit = function (iot) {
    if (!iot) {
        throw new Error("setup_exit: iot is a required argument");
    }

    process.on('exit', function (error) {
        _exit_cleanup({
            iot: iot,
            from: 'exit'
        }, error);
    });
    process.on('SIGINT', function (error) {
        _exit_cleanup({
            iot: iot,
            from: 'SIGINT',
            exit: true,
            cleanup: true
        }, error);
    });
};


/**
 *  API
 */
exports.setup = setup_exit;
exports.shutting_down = function () {
    return _shutting_down;
};
