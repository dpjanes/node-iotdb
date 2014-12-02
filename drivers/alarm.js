/*
 *  drivers/alarm.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-XX-XX
 *
 *  Connect to
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

var moment = require('moment');
var util = require('util');

var _ = require("../helpers");
var driver = require('../driver');
var FIFOQueue = require('../queue').FIFOQueue;

var queue = new FIFOQueue("AlarmDriver");

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'AlarmtypeDriver',
});


var event_sorter = function(a, b) {
    return a.ms_when - b.ms_when
}

var format2 = function(d) {
    d = Math.abs(d) % 100
    if (d < 10) {
        return "0" + d
    } else {
        return "" + d
    }
}

/**
 */
var AlarmDriver = function (paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: "iot-driver:alarm",
        initd: {}
    });

    self.verbose = paramd.verbose;
    self.driver = _.expand(paramd.driver);

    self.eventds = [];
    self.timer_id = null;

    self._init(paramd.initd);

    self.metad = {};
    if (paramd && paramd.metad) {
        self.metad = _.extend(paramd.metad);
    }
    self.metad[_.expand("schema:manufacturer")] = "";
    self.metad[_.expand("schema:model")] = "";

    return self;
};

AlarmDriver.prototype = new driver.Driver();

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
AlarmDriver.prototype._init = function (initd) {
    var self = this;

    if (!initd) {
        return;
    }
    if (initd.iri) {
        self.iri = initd.iri;
    }
};

/**
 *  Request the Driver's metadata.
 *  <p>
 *  See {@link Driver#meta Driver.meta}
 */
AlarmDriver.prototype.driver_meta = function () {
    return this.metad;
};

/**
 *  See {@link Driver#identity Driver.identity}
 */
AlarmDriver.prototype.identity = function (kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {};
        identityd["driver"] = self.driver;

        _.thing_id(identityd);

        self.__identityd = identityd;
    }

    return self.__identityd;
};

/**
 *  See {@link Driver#setup Driver.setup}
 */
AlarmDriver.prototype.setup = function (paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd);

    return self;
};

/*
 *  See {@link Driver#discover Driver.discover}
 */
AlarmDriver.prototype.discover = function (paramd, discover_callback) {
    discover_callback(new AlarmDriver());
};

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
AlarmDriver.prototype.push = function (paramd) {
    var self = this;

    logger.info({
        method: "push",
        unique_id: self.unique_id,
        initd: paramd.initd,
        driverd: paramd.driverd
    }, "called");

    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
AlarmDriver.prototype.pull = function () {
    var self = this;

    logger.info({
        method: "pull",
        unique_id: self.unique_id
    }, "called");

    return self;
};


/*
 *  API
 */
exports.Driver = AlarmDriver;


/**
 *  Reschedule the event to the next interval. If
 *  not rescheduable, return false
 */
AlarmDriver.prototype._reschedule = function(paramd) {
    var self = this;

    if (paramd.repeat_years) {
        paramd.dt_when = moment(paramd.dt_when).add(paramd.repeat_years, 'hours').toDate();
    } else if (paramd.repeat_months) {
        paramd.dt_when = moment(paramd.dt_when).add(paramd.repeat_months, 'months').toDate();
    } else if (paramd.repeat_days) {
        paramd.dt_when = moment(paramd.dt_when).add(paramd.repeat_days, 'days').toDate();
    } else if (paramd.repeat_hours) {
        paramd.dt_when = moment(paramd.dt_when).add(paramd.repeat_hours, 'hours').toDate();
    } else if (paramd.repeat_minutes) {
        paramd.dt_when = moment(paramd.dt_when).add(paramd.repeat_minutes, 'minutes').toDate();
    } else if (paramd.repeat_seconds) {
        paramd.dt_when = moment(paramd.dt_when).add(paramd.repeat_seconds, 'seconds').toDate();
    } else {
        return false;
    }

    paramd.ms_when = paramd.dt_when.getTime();
    return true;
};

/**
 *  Add an event to the queue
 *  <p>
 *  Lots of rules built into the code need to be documented
 */
AlarmDriver.prototype._schedule = function(paramd) {
    var self = this;

    var dt_now = new Date();
    dt_now.setMilliseconds(0);
    var ms_now = dt_now.getTime();

    paramd = _.defaults(paramd, {});
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

    paramd = _.defaults(paramd, {
        year: dt_now.getFullYear(),
        month: dt_now.getMonth() + 1,
        day: dt_now.getDate(),
        hour: dt_now.getHours(),
        minute: dt_now.getMinutes(),
        second: dt_now.getSeconds(),
        tz: -dt_now.getTimezoneOffset(),
        delta: 0,
    });

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

    paramd.dt_when = new Date(whens.join(""));
    paramd.ms_when = paramd.dt_when.getTime();
    if (paramd.ms_when < ms_now) {
        if (!self._reschedule(paramd)) {
            console.log("date is in the past any this does not repeat -- not scheduling", paramd.dt_when);
            return
        }
    }

    // remove any event with the same ID
    if (paramd.id) {
        for (var ei in self.eventds) {
            if (self.eventds[ei].id === paramd.id) {
                self.eventds.slice(ei, 1);
                break;
            }
        }
    }

    self.eventds.push(paramd);
    self._scheduler();
};

/**
 *  Run the event
 */
AlarmDriver.prototype._execute = function(eventd) {
    var self = this;

    eventd = _.clone(eventd);
    eventd.isoweekday = ( eventd.dt_when.getDay() + 6 ) % 7 + 1;
    eventd.isodatetime = eventd.dt_when.toISOString();

    for (var key in eventd) {
        if (key.indexOf('_') > -1) {
            delete eventd[key];
        }
    }

    self.pulled(eventd);

    console.log("executing event", eventd);
};

/**
 *  This will run any events that are ready AND
 *  it will set the timer to wakeup at the next event
 */
AlarmDriver.prototype._scheduler = function() {
    var self = this;

    var dt_now = new Date();
    var ms_now = dt_now.getTime();

    if (self.timer_id) {
        clearTimeout(self.timer_id);
    }

    if (self.eventds.length === 0) {
        return;
    }

    self.eventds.sort(event_sorter);

    while (true) {
        var eventd = self.eventds[0]
        if (eventd.ms_when > ms_now) {
            break;
        }

        self._execute(eventd);

        if (self._reschedule(eventd)) {
            self.eventds.sort(event_sorter);
        } else {
            self.eventds.shift();
        }

        if (self.eventds.length === 0) {
            return
        }
    }

    var delta = self.eventds[0].ms_when - ms_now
    console.log("execte in", delta, "remaining", self.eventds.length);

    setTimeout(function() {
        self._scheduler();
    }, delta);
};

var a = new AlarmDriver();

a._schedule({
    name: "on the minute event",
    second: 0,
    repeat_minutes: 1
})
console.log(a.eventds)


