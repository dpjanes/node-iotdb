/*
 *  datetime.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-01-05
 *
 *  Helper functions for working with DateTimes
 *
 *  A lot of code is from here:
 *  http://stackoverflow.com/a/9493060/96338
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

var _ = require("../helpers.js");

var format2 = function(d) {
    d = Math.abs(d) % 100
    if (d < 10) {
        return "0" + d
    } else {
        return "" + d
    }
}

var DateTime = function (paramd) {
    var self = this;

    var dt_now = new Date();
    if (_.isDate(paramd)) {
        dt_now = paramd;
        paramd = {};
    } else if (_.isString(paramd)) {
        dt_now = new Date(paramd);
        paramd = {};
    }

    paramd = _.defaults(paramd, {});

    // if any element is set, we reset smaller time elements
    if ((paramd.year !== undefined) && (paramd.month === undefined)) {
        paramd.month = 1
    }
    if ((paramd.month!== undefined)  && (paramd.day === undefined)) {
        paramd.day = 1
    }
    if ((paramd.day !== undefined) && (paramd.hour === undefined)) {
        paramd.hour = 0
    }
    if ((paramd.hour !== undefined) && (paramd.minute === undefined)) {
        paramd.minute = 0
    }
    if ((paramd.minute !== undefined) && (paramd.second === undefined)) {
        paramd.second = 0
    }

    // default everything else to whatever was given
    paramd = _.defaults(paramd, {
        year: dt_now.getFullYear(),
        month: dt_now.getMonth() + 1,
        day: dt_now.getDate(),
        hour: dt_now.getHours(),
        minute: dt_now.getMinutes(),
        second: dt_now.getSeconds(),
        tz: -dt_now.getTimezoneOffset()
    });

    self._dd = {}
    self.set(paramd);
};

DateTime.prototype._isDateTime = true;

DateTime.prototype.set = function(paramd) {
    var self = this;

    if (paramd === undefined) {
    } else if (_.isString(paramd)) {
        paramd = (new DateTime(paramd)).get();
    } else if (_.isDate(paramd)) {
        paramd = (new DateTime(paramd)).get();
    } else if (paramd._isDateTime) {
        paramd = paramd.get();
    } else if (_.isObject(paramd)) {
    } else {
        throw new Error("unrecognized argument", paramd)
    }

    // update with whatever is set
    paramd = _.defaults(paramd, self._dd)

    var whens = [
        "" + paramd.year,
        "-",
        format2(paramd.month),
        "-",
        format2(paramd.day),
        "T",
        format2(paramd.hour),
        ":",
        format2(paramd.minute),
        ":",
        format2(paramd.second),
        paramd.tz < 0 ? "-" : "+",
        format2(paramd.tz / 60),
        format2(paramd.tz % 60)
    ];

    var dt_when = new Date(whens.join(""));

    paramd.epoch = dt_when.getTime() / 1000.0;
    paramd.isoweekday = ( dt_when.getDay() + 6 ) % 7 + 1;
    paramd.isodatetime = dt_when.toISOString();

    self._dd = paramd;
}

DateTime.prototype.get = function() {
    var self = this;
    return _.clone(self._dd);
}

DateTime.prototype.getDate = function() {
    var self = this;
    return new Date(self._dd.epoch * 1000.0);
}

DateTime.prototype.compare = function(paramd) {
    var self = this;
    var ms_compare;

    if (paramd === undefined) {
        ms_compare = (new Date()).getTime() / 1000;
    } else if (_.isString(paramd)) {
        ms_compare = (new DateTime(paramd)).epoch;
    } else if (paramd._isDateTime) {
        ms_compare = paramd._dd.epoch;
    } else if (_.isObject(paramd)) {
        ms_compare = (new DateTime(paramd)).epoch;
    } else {
        throw new Error("unrecognized argument", paramd)
    }

    return self._dd.epoch - ms_compare;
}

exports.DateTime = DateTime;
