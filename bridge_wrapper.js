/*
 *  bridge_wrapper.js
 *
 *  David Janes
 *  IOT.org
 *  2015-01-31
 *
 *  Configuration helpers
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

var _ = require('./helpers');

var events = require('events');
var util = require('util');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'bridge_wrapper',
});

var BridgeWrapper = function(exemplar) {
    var self = this;
    events.EventEmitter.call(self);

    exemplar.discovered = function(instance) {
        instance.pulled = function(stated) {
            if (stated) {
                self.emit("state", instance, stated);
            } else if (instance.reachable()) {
                self.emit("meta", instance);
            } else {
                self.emit("meta", instance);
                self.emit("disconnected", instance);
            }
        };

        instance.connect();

        self.emit("discovered", instance);
    };

    
    process.nextTick(function() {
        exemplar.discover();
    });
};

util.inherits(BridgeWrapper, events.EventEmitter);

var bridge_wrapper = function(exemplar) {
    return new BridgeWrapper(exemplar);
};

exports.bridge_wrapper = bridge_wrapper;
