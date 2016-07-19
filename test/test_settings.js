/*
 *  test_settings.js
 *
 *  David Janes
 *  IOTDB
 *  2016-06-19
 */

"use strict";

const assert = require("assert")
const fs = require('fs');

const iotdb = require("../iotdb");
const _ = require("../helpers");
const settings = require("../settings");

describe('test_settings', function() {
    it('paths', function() {
        const paths = settings.shims.paths();
        assert.ok(_.is.Array(paths));

        paths
            .map(path => fs.statSync(path))
            .forEach(stbuf => assert.ok(stbuf.isDirectory()));
    });
});
