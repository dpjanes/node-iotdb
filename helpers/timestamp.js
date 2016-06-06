/*
 *  timestamp.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-05-16
 *  "First working laser"
 *
 *  Timestamp functions
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

var _ = require("../helpers");

/**
 *  Return a timestamp in the standard format.
 *  Which just happens to be the JavaScript 
 *  ISOString format.
 */
var timestamp = function () {
    return (new Date()).toISOString();
};

/**
 *  Return a timestamp in the standard format.
 *  If the new timestamp <= the argument,
 *  _advance_ the argument by a millisecond
 *  and use that
 */
var advance = function (reference) {
    var now = exports.timestamp.make();
    if (!reference || !_.is.String(reference) || (reference < now)) {
        return now;
    }

    var rdate = new Date(reference);
    rdate.setMilliseconds(rdate.getMilliseconds() + 1);

    return rdate.toISOString();
};

/**
 *  As below, but directly with the timestamp strings
 */
var check_values = function(otimestamp, ntimestamp) {
    if (!ntimestamp && !otimestamp) {
        return true;
    } else if (ntimestamp && !otimestamp) {
        return true;
    } else if (!ntimestamp && otimestamp) {
        return false;
    } else if (ntimestamp < otimestamp) {
        return false;
    } else {
        return true;
    }
};

/**
 *  Return true if 'nd' should used
 *  Return false if it shouldn't
 *  Return null if it shouldn't because of a type problem
 *
 *  Timestamp-conflict:
 *  1) if neither has a timestamp, the 'nd' wins
 *  2) if one has a timestamp, that one wins
 *  3) if both have a timestamp, only update if 'nd'
 *     is later than OR equal to the current value
 */
var check_dictionary = function(od, nd, paramd)  {
    if ((od === null) || !_.is.Object(od)) {
        return null;
    }
    if ((nd === null) || !_.is.Object(nd)) {
        return null;
    }

    paramd = _.defaults(paramd, {
        key: '@timestamp'
    });

    var ntimestamp = nd[paramd.key];
    var otimestamp = od[paramd.key];

    return check_values(otimestamp, ntimestamp);
};

/**
 *  This will add a timestamp to the dictionary
 *  _if it doesn't have one_, 
 *  possibly returning a new dictionary
 */
var add_timestamp = function(d, paramd)  {
    paramd = _.defaults(paramd, {
        key: '@timestamp',
        timestamp: _.timestamp.make(),
    });

    if ((d === null) || !_.is.Object(d)) {
        return d;
    } else if (d[paramd.key]) {
        return d;
    } else {
        d = _.d.clone.shallow(d);
        d[paramd.key] = paramd.timestamp;

        return d;
    }
};

/**
 *  This will update the timestamp in the dictionary.
 *  Timestamp can only go into the future!
 *
 *  This will only return true if the timestamp
 *  was updated.
 */
var update_timestamp = function(d, paramd)  {
    paramd = _.defaults(paramd, {
        key: '@timestamp',
        timestamp: exports.timestamp.make(),
    });

    if ((d === null) || !_.is.Object(d)) {
        return false;
    } else if (check_values(d[paramd.key], paramd.timestamp)) {
        d[paramd.key] = paramd.timestamp;
        return true;
    } else {
        return false;
    }
};

var epoch = function() {
    return "1970-01-01T00:00:00.000Z"
};

exports.timestamp = {
    make: timestamp,
    advance: advance,
    add: add_timestamp,
    update: update_timestamp,
    epoch: epoch,
    check: {
        dictionary: check_dictionary,
        values: check_values,
    },
};
