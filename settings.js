/*
 *  settings.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-14
 *  "Valentines's Day"
 *
 *  Copyright [2013-2016] [David P. Janes]
 *
 *  Much cleaner Settings than the one in IOTDB.js
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

const _ = require('./helpers');

const events = require('events');
const util = require('util');
const fs = require('fs');
const path = require('path');
const os = require('os');
const assert = require('assert');

const logger = _.logger.make({
    name: 'iotdb',
    module: 'settings',
});

/**
 *  Return every folder from CWD to / that has a ".iotdb" folder in it
 */
const _paths = function() {
    const paths = [];
    var current = process.cwd();

    while (true) {
        var iotdb_folder = path.join(current, ".iotdb");

        try {
            var stbuf = fs.statSync(iotdb_folder);
            if (stbuf.isDirectory()) {
                paths.push(iotdb_folder);
            }
        } catch (x) {
        }

        var next = path.normalize(path.join(current, ".."));
        if (next === current) {
            break;
        }

        current = next;
    }

    return paths;
};

const Settings = function (paramd) {
    const self = this;

    self.paramd = _.defaults(paramd, {
        root: "/",
        settings: "keystore.json",
        path: _paths(), // [".iotdb", "$HOME/.iotdb", ],
        makedirs: true,
    })
    self.d = {}

    events.EventEmitter.call(this);
    this.setMaxListeners(0);

    self._load();
};

util.inherits(Settings, events.EventEmitter);

Settings.prototype._normalize_key = function (key) {
    const self = this;

    if (!key.match(/^\//)) {
        key = self.paramd.root.replace('/*$', '') + '/' + key;
    }

    return "/" + key.replace(/^\/*/, '');
};

Settings.prototype._load = function () {
    const self = this;
    self.d = {};

    const filenames = _.cfg.find(self.paramd.path, self.paramd.settings);
    filenames.reverse();

    const docds = [];
    _.cfg.load.json(filenames, docd => docds.push(docd));

    docds
        .filter(docd => docd.error)
        .forEach(docd => assert(!docd.error, docd.error));

    docds
        .forEach(docd => _.d.smart_extend(self.d, docd.doc));

    self.emit("loaded");
};

/**
 */
Settings.prototype.get = function (key, otherwise) {
    const self = this;

    key = self._normalize_key(key);

    return _.d.get(self.d, key, otherwise);
};

/**
 */
Settings.prototype.set = function (key, value) {
    const self = this;

    key = self._normalize_key(key);

    _.d.set(self.d, key, value);

    self.emit("changed", key);
};

/**
 */
Settings.prototype.save = function (key, value, paramd) {
    const self = this;

    key = self._normalize_key(key);
    paramd = _.defaults(paramd, {
        global: false,
        filename: null,
        set: true,
        mkdirs: false,
    });

    var filename;
    if (paramd.filename) {
        filename = paramd.filename
    } else if (paramd.global) {
        filename = self.paramd.path[self.paramd.path.length - 1] + "/" + self.paramd.settings;
    } else {
        filename = self.paramd.path[0] + "/" + self.paramd.settings;
    }

    // load settings
    var d = {};
    _.cfg.load.json([filename], function (paramd) {
        for (var pd in paramd.doc) {
            d[pd] = paramd.doc[pd];
        }
    });

    // if value is a function, we call it with the current value to get a new value
    // this allows "in-place" updating of a particular value
    if (_.is.Function(value)) {
        value = value(_.d.get(d, key));
    }

    // update the (just loaded) settings
    _.d.set(d, key, value);

    // save - XXX does not deal with recursion yet
    if (paramd.mkdirs) {
        var dirname = path.dirname(filename)
        try {
            fs.mkdirSync(dirname);
        } catch (x) {}
    }
    fs.writeFileSync(filename, JSON.stringify(d, null, 2));

    logger.info({
        key: key,
        value: value,
        filename: filename,
    }, "updated");

    // update ourselves
    self.set(key, value);
};

const make = (paramd) => {
    return new Settings(paramd);
};

let _settings;

const instance = () => {
    if (!_settings) {
        _settings = make();
    }

    return _settings;
};

/*
 *  API
 */
exports.make = make;
exports.instance = instance;
