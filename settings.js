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
    let current = process.cwd();

    while (true) {
        const iotdb_folder = path.join(current, ".iotdb");

        try {
            const stbuf = fs.statSync(iotdb_folder);
            if (stbuf.isDirectory()) {
                paths.push(iotdb_folder);
            }
        } catch (x) {
        }

        const next = path.normalize(path.join(current, ".."));
        if (next === current) {
            break;
        }

        current = next;
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
        self.d = {};

        const filenames = _.cfg.find(_initd.path, _initd.settings);
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

    self.get = (key, otherwise) => _.d.get(self.d, _normalize_key(key), otherwise);

    self.set = (key, value) => {
        key = _normalize_key(key);

        _.d.set(self.d, key, value);

        self.emit("changed", key);
    };

    self.save = (key, value, paramd) => {
        key = _normalize_key(key);
        paramd = _.d.compose.shallow(paramd, {
            global: false,
            filename: null,
            set: true,
            mkdirs: false,
        });

        let filename;
        if (paramd.filename) {
            filename = paramd.filename
        } else if (paramd.global) {
            filename = _initd.path[_initd.path.length - 1] + "/" + _initd.settings;
        } else {
            filename = _initd.path[0] + "/" + _initd.settings;
        }

        // load settings
        const d = {};
        _.cfg.load.json([filename], function (paramd) {
            for (const pd in paramd.doc) {
                d[pd] = paramd.doc[pd];
            }
        });

        // if value is a function, we call it with the current value to get a new value
        // self allows "in-place" updating of a particular value
        if (_.is.Function(value)) {
            value = value(_.d.get(d, key));
        }

        // update the (just loaded) settings
        _.d.set(d, key, value);

        // save 
        if (paramd.mkdirs) {
            const dirname = path.dirname(filename)
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

        self.set(key, value);
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

/*
 *  API
 */
exports.make = make;
exports.instance = instance;
