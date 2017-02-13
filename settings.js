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
const fs = require('fs');
const path = require('path');

const logger = _.logger.make({
    name: 'iotdb',
    module: 'settings',
});

let _writeFileSync = fs.writeFileSync;

/**
 *  Return every folder from CWD to / that has a ".iotdb" folder in it
 */
const _paths = function () {
    const paths = [];
    let current_folder = process.cwd();

    while (true) {
        const iotdb_folder = path.join(current_folder, ".iotdb");

        try {
            const stbuf = fs.statSync(iotdb_folder);
            if (stbuf.isDirectory()) {
                paths.push(iotdb_folder);
            }
        } catch (x) {}

        const next_folder = path.normalize(path.join(current_folder, ".."));
        if (next_folder === current_folder) {
            break;
        }

        current_folder = next_folder;
    }

    return paths;
};

const make = (initd) => {
    const self = Object.assign({}, events.EventEmitter.prototype);

    const _initd = _.d.compose.shallow(initd, {
        root: "/",
        settings: "keystore.json",
        path: _paths(),
    })
    self.d = {}

    const _normalize_key = function (key) {
        if (!key.match(/^\//)) {
            key = _initd.root.replace('/*$', '') + '/' + key;
        }

        return "/" + key.replace(/^\/*/, '');
    };

    const _load = function () {
        const filenames = _.cfg.find(_initd.path, _initd.settings);

        // IDK why the following does not work
        // _.cfg.load.json(filenames, docd => self.d = _.d.compose.deep(self.d, docd.doc))
        _.cfg.load.json(filenames, docd => {
            self.d = _.d.compose.deep(self.d, docd.doc)
        });

        self.emit("loaded");
    };

    self.get = (key, otherwise) => _.d.get(self.d, _normalize_key(key), otherwise);

    self.set = (key, value) => {
        key = _normalize_key(key);

        _.d.set(self.d, key, value);

        self.emit("changed", key);
    };

    /*
     */
    let _saved = null;

    self.save = (key, value) => {
        self.set(key, value);

        const _save_path = ".iotdb/keystore.json";

        if (!_saved) {
            _saved = {};
            _.cfg.load.json([_save_path], docd => _saved = _.d.compose.deep(_saved, docd.doc));
        }

        _.d.set(_saved, _normalize_key(key), value);

        process.nextTick(() => {
            if (!_saved) {
                return;
            }

            _writeFileSync(_save_path, JSON.stringify(_saved, null, 2));
            _saved = null;
        });
    };

    self.setMaxListeners(0);
    _load()

    return self;
};

let _settings;

const instance = () => {
    if (!_settings) {
        _settings = make();
    }

    return _settings;
};

const reset = () => {
    _settings = null;
};

/*
 *  API
 */
exports.make = make;
exports.instance = instance;
exports.reset = reset;
exports.shims = {
    paths: _paths,
    writeFileSync: f => _writeFileSync = f || fs.writeFileSync,
};
