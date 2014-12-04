/*
 *  drivers/timer.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-12-02
 *
 *  Create time events
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
var DateTime = require("../libs/datetime").DateTime;
var driver = require('../driver');
var FIFOQueue = require('../queue').FIFOQueue;

var queue = new FIFOQueue("TimerDriver");

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'TimerDriver',
});


var event_sorter = function(a, b) {
    return a.compare(b);
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
var TimerDriver = function (paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: "iot-driver:timer",
        initd: {}
    });

    self.verbose = paramd.verbose;
    self.driver = _.expand(paramd.driver);

    self.events = [];
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

TimerDriver.prototype = new driver.Driver();

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
TimerDriver.prototype._init = function (initd) {
    var self = this;

    if (!initd) {
        return;
    }
};

/**
 *  Request the Driver's metadata.
 *  <p>
 *  See {@link Driver#meta Driver.meta}
 */
TimerDriver.prototype.driver_meta = function () {
    return this.metad;
};

/**
 *  See {@link Driver#identity Driver.identity}
 */
TimerDriver.prototype.identity = function (kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {};
        identityd["driver"] = self.driver;
        identityd["number"] = self.unique_id;    // THIS IS NOT CORRECT

        _.thing_id(identityd);

        self.__identityd = identityd;
    }

    return self.__identityd;
};

/**
 *  See {@link Driver#setup Driver.setup}
 */
TimerDriver.prototype.setup = function (paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd);

    /*
     *  This is where the event gets scheduled
     */
    self._schedule(paramd.initd)

    /* heartbeats */
    if (paramd.initd.day_heartbeat) {
        self._schedule({
            id: 'day_heartbeat',
            hour: 0,
            day_repeat: paramd.initd.day_heartbeat
        });
    }
    if (paramd.initd.hour_heartbeat) {
        self._schedule({
            id: 'hour_heartbeat',
            minute: 0,
            hour_repeat: paramd.initd.hour_heartbeat
        });
    }
    if (paramd.initd.minute_heartbeat) {
        self._schedule({
            id: 'minute_heartbeat',
            second: 0,
            minute_repeat: paramd.initd.minute_heartbeat
        });
    }


    return self;
};

/*
 *  See {@link Driver#discover Driver.discover}
 */
TimerDriver.prototype.discover = function (paramd, discover_callback) {
    discover_callback(new TimerDriver());
};

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
TimerDriver.prototype.push = function (paramd) {
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
 *  If called, the current time will be pulled
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
TimerDriver.prototype.pull = function () {
    var self = this;

    logger.info({
        method: "pull",
        unique_id: self.unique_id
    }, "called");

    self.pulled((new DateTime()).get());

    return self;
};


/*
 *  API
 */
exports.Driver = TimerDriver;


/**
 *  Reschedule the event to the next interval. If
 *  not rescheduable, return false
 */
TimerDriver.prototype._reschedule = function(event) {
    var self = this;

    var dd = event.get()
    var dt_old = event.getDate();
    var dt_new = null;

    if (dd.year_repeat) {
        dt_new = moment(dt_old).add(dd.year_repeat, 'hours').toDate();
    } else if (dd.month_repeat) {
        dt_new = moment(dt_old).add(dd.month_repeat, 'months').toDate();
    } else if (dd.day_repeat) {
        dt_new = moment(dt_old).add(dd.day_repeat, 'days').toDate();
    } else if (dd.hour_repeat) {
        dt_new = moment(dt_old).add(dd.hour_repeat, 'hours').toDate();
    } else if (dd.minute_repeat) {
        dt_new = moment(dt_old).add(dd.minute_repeat, 'minutes').toDate();
    } else if (dd.second_repeat) {
        dt_new = moment(dt_old).add(dd.second_repeat, 'seconds').toDate();
    } else {
        return false;
    }

    event.set(dt_new);

    return true;
};

/**
 *  Add an event to the queue
 *  <p>
 *  Lots of rules built into the code need to be documented
 */
TimerDriver.prototype._schedule = function(paramd) {
    var self = this;

    var event = new DateTime(paramd);

    if ((event.compare() < 0) && !self._reschedule(event)) {
        logger.error({
            method: "_schedule",
            cause: "likely the programmer or data, often not serious",
            event: event.get(),
            unique_id: self.unique_id,
            initd: paramd.initd,
            driverd: paramd.driverd
        }, "date is in the past any this does not repeat -- not scheduling");
        return
    }

    if (paramd.id) {
        for (var ei in self.events) {
            var e = self.events[ei];
            var id = e.get().id;
            if (e.get().id === paramd.id) {
                self.events.slice(ei, 1);
                break;
            }
        }
    }

    self.events.push(event);
    self._scheduler();
};

/**
 *  Run the event
 */
TimerDriver.prototype._execute = function(event) {
    var self = this;

    var dd = event.get()

    for (var key in dd) {
        if (key.indexOf('_') > -1) {
            delete dd[key];
        }
    }

    self.pulled(dd);

    logger.info({
        method: "_execute",
        event: dd,
        unique_id: self.unique_id,
    }, "timer change")
};

/**
 *  This will run any events that are ready AND
 *  it will set the timer to wakeup at the next event
 */
TimerDriver.prototype._scheduler = function() {
    var self = this;

    if (self.timer_id) {
        clearTimeout(self.timer_id);
    }

    if (self.events.length === 0) {
        return;
    }

    self.events.sort(event_sorter);

    while (true) {
        var event = self.events[0]
        if (event.compare() > 0) {
            break;
        }

        self._execute(event);

        if (self._reschedule(event)) {
            self.events.sort(event_sorter);
        } else {
            self.events.shift();
        }

        if (self.events.length === 0) {
            return
        }
    }

    var delta = self.events[0].compare()
    logger.info({
        method: "_scheduler",
        next_run: delta,
        unique_id: self.unique_id,
    }, "schedule updated");

    setTimeout(function() {
        self._scheduler();
    }, delta * 1000);
};

/*
var a = new TimerDriver();
a._schedule({
    name: "every minute",
    second: 0,
    minute_repeat: 1
})
a._schedule({
    name: "every 90 seconds",
    second: 0,
    minute_repeat: 1.5
})
 */
