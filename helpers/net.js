/*
 *  net.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-12-14
 *
 *  Network functions
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

var unirest = require('unirest');
var url_join = require('url-join');
var os = require('os');
var _ = require('../helpers');

function _scan(filter) { 
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        var ads = ifaces[dev];
        for (var di in ads) {
            var ad = ads[di];
            var result = filter(ad);
            if (result) {
                return result;
            }
        }
    }

    return null;
}

var _ipv4 = function() {
    return _scan(function(ad) {
        if (ad.internal) {
            return null;
        } else if (ad.family !== 'IPv4') {
            return null;
        } else {
            return ad.address;
        }
    });
};

var _ipv6 = function() {
    return _scan(function(ad) {
        if (ad.internal) {
            return null;
        } else if (ad.family !== 'IPv6') {
            return null;
        } else {
            return ad.address;
        }
    });
};

var _mac = function() {
    return _scan(function(ad) {
        if (ad.internal) {
            return null;
        } else if (ad.mac) {
            return ad.mac;
        }
    });
};

var externalv4 = function(callback) {
    unirest
        .get('https://diagnostic.opendns.com/myip')
        .end(function (response) {
            if (response.error) {
                return callback(response.error);
            }

            callback(null, response.body.trim());
        });
};

/**
 *  This is to replace globally using url-join
 *  because it does strange things when you
 *  request a leading "/"
 */
var join = function(first) {
    if (first === "/") {
        return "/" + url_join.apply(url_join, [].splice.call(arguments, 1));
    } else {
        return url_join.apply(url_join, [].splice.call(arguments, 0));
    }
}

exports.net = {
    ipv4: _ipv4,
    ipv6: _ipv6,
    mac: _mac,

    external: {
        ipv4: externalv4,
    },

    url: {
        join: join,
    },
};
