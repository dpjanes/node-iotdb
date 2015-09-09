/*
 *  cfg.js
 *
 *  David Janes
 *  IOT.org
 *  2014-03-15
 *
 *  Configuration helpers
 *
 *  Copyright [2013-2015] [David P. Janes]
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
var node_path = require('path');
var node_fs = require('fs');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'cfg',
});

/**
 *  Expand any $VARIABLE type substring in <code>string</code>
 *  with the corresponding value from <code>envd</code>
 *
 *  @param {dictionary} envd
 *  keys & values for substitution
 *
 *  @param {string} string
 *  the string to do replacements on
 *
 *  @return {string}
 *  the string with replacements done
 */
exports.cfg_expand = function (envd, string) {
    return string.replace(/[$]([A-Za-z_0-9]+)/g, function (match, variable) {
        var replace = envd[variable];
        return replace ? replace : "";
    });
};

/**
 *  Look for files along a series of paths
 *
 *  @param {dictionary} envd
 *  keys & values for substitution
 *
 *  @param {array|string} paths
 *  directories to look at (will use {@link cfg_expand} substitution).
 *  If a string, the string will be split using Node's <code>path.delimiter</code>
 *
 *  @param {string} name
 *  the name of the file to look for. May be a regular expression
 *
 *  @param {dictionary} paramd
 *  @param {integer} paramd.max
 *  The maximum number of results to return (0: all results, the default)
 *
 *  @param {boolean} paramd.expand
 *  Use {@link cfg_expand} on paths (default: true)
 *
 *  @param {boolean} paramd.dotfiles
 *  Return files beginning with '.' in the results (default: false).
 *  Note that '.' and '..' are never returned
 */
exports.cfg_find = function (envd, paths, name, paramd) {
    paramd = _.defaults(paramd, {
        max: 0,
        expand: true,
        dotfiles: false
    });

    if (_.is.String(paths)) {
        paths = paths.split(node_path.delimiter);
    }

    var results = [];

    var _list_files = function (path, callback) {
        var is_recursive = path.match(/[\/][\/]$/);
        var files = node_fs.readdirSync(path);
        files.sort();

        for (var fi in files) {
            var file = files[fi];
            if ((file === ".") || (file === "..")) {
                continue;
            } else if (!paramd.dotfiles && (file.substring(0, 1) === ".")) {
                continue;
            }

            var subpath = node_path.join(path, file);
            var subpath_stbuf = node_fs.statSync(subpath);
            if (subpath_stbuf.isFile()) {
                if (callback(subpath, file)) {
                    break;
                }
            } else if (is_recursive && subpath_stbuf.isDirectory()) {
                if (_list_files(subpath + "//", callback)) {
                    break;
                }
            }
        }
    };

    var _find_path_list = function (path) {
        try {
            _list_files(path, function (subpath, file) {
                if ((name === null) || (name === undefined)) {
                    results.push(subpath);
                } else if (file.match(name)) {
                    results.push(subpath);
                }

                if (results.length && paramd.max && (results.length >= paramd.max)) {
                    return true;
                }
            });
        } catch (x) {
            logger.error(x, {
                method: "cfg_find"
            }, "unexpected exception");
        }
    };

    var _find_path_name = function (path) {
        var filepath = node_path.join(path, name);
        if (node_fs.existsSync(filepath)) {
            results.push(filepath);
        }
    };

    for (var pi in paths) {
        var path = paths[pi];

        if (paramd.expand) {
            path = exports.cfg_expand(envd, path);
        }

        try {
            // ignore non-directories
            var stbuf = node_fs.statSync(path);
            if (!stbuf.isDirectory()) {
                continue;
            }
        } catch (x) {
            continue;
        }

        if ((name === null) || (name === undefined) || _.is.RegExp(name)) {
            _find_path_list(path);
        } else {
            _find_path_name(path);
        }

        if (results.length && paramd.max && (results.length >= paramd.max)) {
            break;
        }
    }

    return results;
};

/**
 *  Load JSON files and call the callback
 *
 *  @param {array} filenames
 *  An array of filenames, as returned by {@link cfg_find}.
 *
 *  @param {function} callback
 *  Callback with a single dictionary argument <code>paramd</code>.
 *  If the JSON document is read it will be passed as <code>paramd.doc</code>.
 *  If there is an error it will be in <code>paramd.error</code>
 *  If there is an exception asssociated with the error, it
 *  will be in <code>paramd.exception</code>. The filename will
 *  be in <code>paramd.filename</code>.
 *  <p>
 *  If the callback returns <code>true</code>, we're finished
 *
 *  @return
 *  The first document successfully read
 */
exports.cfg_load_json = function (filenames, callback) {
    var first_doc = null;

    if (!filenames.length) {} else {
        for (var fi in filenames) {
            try {
                var filename = filenames[fi];
                var doc = node_fs.readFileSync(filename, {
                    encoding: 'utf8'
                });
                var r = callback({
                    doc: JSON.parse(doc),
                    filename: filename
                });

                if (first_doc === null) {
                    first_doc = doc;
                }
                if (r) {
                    break;
                }
            } catch (x) {
                callback({
                    error: "exception reading file",
                    exception: x,
                    filename: filename
                });
            }
        }
    }

    return first_doc;
};

/**
 *  Load files and call the callback.
 *
 *  @param {array} filenames
 *  An array of filenames, as returned by {@link cfg_find}.
 *
 *  @param {string} encoding
 *  OPTIONAL The encoding. If not specified, we use 'utf-8'
 *
 *  @param {function} callback
 *  Callback with a single dictionary argument <code>paramd</code>.
 *  If the document is read it will be passed as <code>paramd.doc</code>.
 *  If there is an error it will be in <code>paramd.error</code>
 *  If there is an exception asssociated with the error, it
 *  will be in <code>paramd.exception</code>. The filename will
 *  be in <code>paramd.filename</code>.
 *  <p>
 *  If the callback returns <code>true</code>, we're finished
 *
 *  @return
 *  The first document successfully read
 */
exports.cfg_load_file = function (filenames, encoding, callback) {
    var first_doc = null;

    if (_.is.Function(encoding)) {
        callback = encoding;
        encoding = "utf-8";
    }

    if (!filenames.length) {} else {
        for (var fi in filenames) {
            try {
                var filename = filenames[fi];
                var doc = node_fs.readFileSync(filename, {
                    encoding: encoding
                });
                var r = callback({
                    doc: doc,
                    filename: filename
                });

                if (first_doc === null) {
                    first_doc = doc;
                }
                if (r) {
                    break;
                }
            } catch (x) {
                callback({
                    error: "exception reading file",
                    exception: x,
                    filename: filename
                });
            }
        }
    }

    return first_doc;
};

/**
 *  Load Javascript/Node modules and call the callback.
 *
 *  @param {array} filenames
 *  An array of filenames, as returned by {@link cfg_find}.
 *
 *  @param {string} encoding
 *  OPTIONAL The encoding. If not specified, we use 'utf-8'
 *
 *  @param {function} callback
 *  Callback with a single dictionary argument <code>paramd</code>.
 *  If the document/module is read it will be passed as <code>paramd.doc</code>.
 *  If there is an error it will be in <code>paramd.error</code>
 *  If there is an exception asssociated with the error, it
 *  will be in <code>paramd.exception</code>. The filename will
 *  be in <code>paramd.filename</code>.
 *  <p>
 *  If the callback returns <code>true</code>, we're finished
 *
 *  @return
 *  The first document successfully read
 */
exports.cfg_load_js = function (filenames, callback) {
    var first_doc = null;

    if (!filenames.length) {} else {
        for (var fi in filenames) {
            try {
                var filename = filenames[fi];
                if (!filename.match(/^([.]\/|[.][.]\/|\/)/)) {
                    filename = "./" + filename;
                }
                if (filename.substring(0, 1) !== "/") {
                    filename = node_path.join(process.cwd(), filename);
                }

                var doc = require(filename);
                var r = callback({
                    doc: doc,
                    filename: filename
                });

                if (first_doc === null) {
                    first_doc = doc;
                }
                if (r) {
                    break;
                }
            } catch (x) {
                callback({
                    error: "exception reading file",
                    exception: x,
                    filename: filename
                });
            }
        }
    }

    return first_doc;
};

/**
 *  Return a reasonable env for IOTDB. Values are
 *  taken from (in order of priority):
 *  <ol>
 *  <li>argument <code>envd<code></li>
 *  <li>process.env</code>
 *  <li>algorithmically</li>
 *  </ol>
 *  <p>
 *  The algorithmic values are
 *  <ul>
 *  <li>IOTDB_CFG: configuration directory (usually <code>~/.iotdb</code>)</li>
 *  <li>IOTDB_INSTALL: where IOTDB Node libraries are installed</li>
 *  <li>IOTDB_PROJECT: the CWD by default</li>
 *  </ul>
 *
 *  @paramd {dictionary|undefined} envd
 *  OPTIONAL values for envd
 *
 *  @return {dictionary}
 *  The envd
 */
exports.cfg_envd = function (envd) {
    envd = _.defaults(envd, {});

    for (var key in process.env) {
        var value = process.env[key];
        if (!envd[key] && _.is.String(value)) {
            envd[key] = value;
        }
    }

    // Windows sometimes doesn't habe $HOME? Issue #5
    if (!envd.IOTDB_CFG && process.env['HOME']) {
        envd.IOTDB_CFG = node_path.join(process.env['HOME'], ".iotdb");
    }

    if (!envd.IOTDB_INSTALL) {
        envd.IOTDB_INSTALL = __dirname;
    }

    if (!envd.IOTDB_PROJECT) {
        envd.IOTDB_PROJECT = node_path.dirname(process.argv[1]);
    }

    if (!envd.IOTDB_USER) {
        envd.IOTDB_USER = "nobody";
    }

    return envd;
};
