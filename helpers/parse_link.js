/*
 *  parse_link.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-07-17
 *
 *  Parse HTTP Link: value. Not quite finished, but
 *  good enough for show business.
 *
 *  See:
 *  http://tools.ietf.org/html/rfc5988
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

var _ = require("../helpers.js");

// forwards
var _see_link;
var _see_semicolon;
var _see_comma;
var _see_extension;

exports.parse_link = function (link) {
    var rdd = {};
    var d;

    while (link.length > 0) {
        // link
        d = _see_link(link);
        if (!d) {
            break;
        } else {
            link = d.link;
        }


        var rd = {};
        rdd[d.url] = rd;

        while (true) {
            d = _see_semicolon(link);
            if (!d) {
                break;
            } else {
                link = d.link;
            }

            d = _see_extension(link);
            if (!d) {
                break;
            } else {
                link = d.link;
            }

            rd[d.name] = d.value;
        }

        d = _see_comma(link);
        if (!d) {
            break;
        } else {
            link = d.link;
        }
    }

    return rdd;
};

_see_link = function (text) {
    var match = text.match(/^\s*<([^>]*)>/);
    if (match) {
        return {
            url: match[1],
            link: text.substring(match[0].length)
        };
    }
};

_see_semicolon = function (text) {
    var match = text.match(/^\s*;/);
    if (match) {
        return {
            link: text.substring(match[0].length)
        };
    }
};

_see_comma = function (text) {
    var match = text.match(/^\s*,/);
    if (match) {
        return {
            link: text.substring(match[0].length)
        };
    }
};

_see_extension = function (text) {
    var match = text.match(/^\s*([^=\s]*)\s*=\s*"([^";,]*)"/); // XXX - missing \" handling
    if (!match) {
        match = text.match(/^\s*([^=\s]*)\s*=\s*([^;,]*)/);
    }
    if (match) {
        return {
            name: match[1],
            value: match[2],
            link: text.substring(match[0].length)
        };
    }

};


/*
var link = '<tcp://mqtt.iotdb.org:1883>; rel="mqtt"; payload=PUT; topic="bedroom/light"'
var link = '<tcp://mqtt.iotdb.org:1883>; rel="mqtt"; payload=PUT; topic="bedroom/light",<ssl://mqtt.iotdb.org:1883>; rel="mqtt"; payload=PUT; topic="bedroom/light",'


console.log(parse_link(link))
*/
