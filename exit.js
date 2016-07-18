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

const _ = require("iotdb-helpers");

const events = require('events');
const util = require('util');
const path = require('path');
const fs = require('fs');

const logger = _.logger.make({
    name: 'iotdb',
    module: 'exit',
});

let _shutting_down = false;
let _process = process;

const setup = manager => {
    const _shutdown = () => {
        _shutting_down = true;

        const time_wait = manager.disconnect();

        if (time_wait === 0) {
            console.log("### calling _process.exit(0) - good-bye!");
            _process.exit(0);
        } else {
            logger.info({
                method: "_exit_cleanup",
                exiting_in: time_wait / 1000.0
            }, "delaying exit");

            setTimeout(() => _process.exit(0), time_wait);
        }
    };

    _process.on('SIGINT', _shutdown);
};

/**
 *  API
 */
exports.setup = setup;
exports.shutting_down = function () {
    return _shutting_down;
};

exports.shims = {
    setProcess: f => {
        _process = f;
        _shutting_down = false;
    },
    getProcess: () => _process,
    setShuttingDown: v => _shutting_down = v,
}
