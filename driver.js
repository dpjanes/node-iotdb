/*
 *  driver.js
 *
 *  David Janes
 *  IOTDB
 *  2013-12-24
 *
 *  The driver protocol
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

var mqtt = require('mqtt');
var timers = require('timers');
var events = require('events');
var util = require('util');
var _ = require('./helpers');
var libs = require("./libs/libs");

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'driver',
});

var id_counter = 1;
var EVENT_DISCONNECT = 'disconnect';

/**
 *  Base class for all Drivers. It does nothing
 *  except exist.
 *
 *  @classdesc
 *  Drivers deal with the nasty business of actually
 *  talking to the real devices.
 *
 *  <p>
 *  {@link Driver Drivers} are bound to things {@link Thing Things}
 *  based on their {@link Driver#identity identity}.
 *
 *  <hr />
 *
 *  @constructor
 */
var Driver = function () {
    // WE REALLY NEED TO FIX UP MQTT
    events.EventEmitter.call(this);
    this.setMaxListeners(128);
};

util.inherits(Driver, events.EventEmitter);

/**
 *  Every subclass must call this in their constructor
 *  function. Sorry, because Javascript!
 */
Driver.prototype.driver_construct = function () {
    var self = this;

    self.unique_id = id_counter++;
    self.thing = null;
    self.verbose = false;
    self.driver = null; // should be redefined in subclasses

    self.disconnected = false;

    // poll built it
    self.poll_delta = 0;
    self.poll_timer_id = null;

    // MQTT built in
    self.mqtt_host = self.cfg_get('mqtt_host', null);
    self.mqtt_port = self.cfg_get('mqtt_port', 1883);
    self.mqtt_topic = null;
    self.mqtt_json = false;
    self.mqtt_device = "";

    /*
    self.mqtt_client = null
     */
    self.mqtt_last_millis = 0;
    self.mqtt_timer_id = 0;
};

/**
 *  Return an identity dictionary that uniquely
 *  identifies what this {@link Driver} is talking to.
 *
 *  <p>
 *  This object:
 *
 *  <ul>
 *  <li>should consist of string values only (arrays of string values
 *  are sometimes useful
 *  <li>must contain "driver", a URL
 *  <li>must contain "thing_id" (from helpers.thing_id)
 *  </ul>
 *
 *  @param {boolean} kitchen_sink
 *  If true, the {@link Driver} may add additional parameters to
 *  help find and appropriate driver. However, thing_id
 *  must be computed beforehand.
 *
 *  @return {dictionary}
 *  An idenitity object
 */
Driver.prototype.identity = function (kitchen_sink) {
    return {};
};

Driver.prototype.thing_id = function () {
    var self = this;
    var d = self.identity();
    if (d) {
        return d.thing_id;
    } else {
        return null;
    }
};

/**
 *  This is called by IOTDB when {@link IOTDB.register_driver}
 *  is called. You can do anything you want here, such
 *  as load some settings
 *  <p>
 *  Subclasses <b>MUST</b> chain to this function using
 *  <code>driver.Driver.prototype.register.call(self, iot)</code>.
 */
Driver.prototype.register = function (iot) {
    var self = this;

    // self.mqtt_host = self.cfg_get('mqtt_host', "XXXXXXX")
    // self.mqtt_port = self.cfg_get('mqtt_port', 1883)
};

/**
 *  This is a very special function that's called usually outside
 *  of the context of this
 *
 *  @param {dictionary|undefined} ad
 *  Random arguments
 */
Driver.prototype.configure = function (ad, callback) {
    logger.debug({
        method: "configure",
        id: this.unique_id
    }, "this driver does not need configuration");
};

/**
 *  Ask this Driver exemplar to discover devices on the LAN. For each
 *  device discovered, the callback is invoked.
 *
 *  @param {dictionary|null} paramd
 *  @param {dictionary} paramd.initd
 *  Init data that will be used creating the thing after discover.
 *  Not always present. This is handy if you have to do
 *  some pre-filtering on what's created, like with MQTT
 *
 *  @param {Driver~discover_callback} discover_callback
 *  Called with the bound driver
 */
Driver.prototype.discover = function (paramd, discover_callback) {
    logger.error({
        method: "discover",
        id: this.unique_id,
        cause: "Node-IOTDB programming error"
    }, "we expected this to be redefined in a subclass");
};

/**
 *  @callback Driver~discover_callback
 *  See
 *  {@link Driver#discover_nearby Driver.discover_nearby} and
 *  {@link Driver#discover_nearby Driver.discover_thing}.
 *  These functions are typically invoked by
 *  {@link IOT#discover_nearby IOT.discover_nearby} and
 *  {@link IOT#discover_nearby IOT.discover_thing}.
 *
 *  @param driver
 *  The driver specifically discovered to work with a Model.
 */

/**
 *  Setup the Driver.
 *  Usually called from
 *  {@link IOT#discover_nearby IOT.discover_nearby} or
 *  {@link IOT#discover_thing IOT.discover_thing}
 *  after a driver has been found.
 *
 *  <p>
 *  Subclasses <b>MUST</b> chain to this function using
 *  <code>driver.Driver.prototype.setup.call(paramd)</code>.
 *  Usually you want to do this first too.
 *
 *  @param {dictionary} paramd
 *  @param {Thing} paramd.thing
 *  the thing that this being setup
 *
 *  @param {dictionary} paramd.initd
 *  Invariant data that can be passed from the Model.
 *  Take it or leave it (see {@link JSONDriver})
 *  In can also b ffilled in by
 *  {@link Thing#setup_driver Model.setup_driver}.
 *  Typically it will have instructions for setting up the driver,
 *  saying what you want monitored, what aspects of the driver
 *  you are working with and so forth
 *
 *  @return {this}
 */
Driver.prototype.setup = function (paramd) {
    var self = this;

    if (paramd.thing !== undefined) {
        self.thing = paramd.thing;
    } else {
        logger.error({
            method: "setup",
            id: self.unique_id,
            paramd: paramd,
            cause: "Node-IOTDB programming error"
        }, "expected paramd.thing");
    }

    return self;
};

/**
 *  Disconnect this driver. Clear up every connection,
 *  it's not going to be used again.
 *  <p>
 *  Always chain to
 *  driver.Driver.prototype.disconnect.call(self);
 *
 *  @return {this}
 */
Driver.prototype.disconnect = function () {
    var self = this;

    self.disconnected = true;
    self.emit(EVENT_DISCONNECT);

    if (self.thing) {
        var the_thing = self.thing;
        process.nextTick(function () {
            the_thing.meta_changed();
        });
    }
    self.thing = null;
};

/**
 *  Like disconnect, except the application is going down.
 *  Return how long you'd like to wait until exiting.
 *  May be called multiple times.
 *
 *  No need to chain if you know what you are doing
 */
Driver.prototype.shutdown = function () {
    this.disconnect();

    return 0;
};

/**
 *  Push a new Driver state. This is typically called
 *  from {@link Thing#_do_pushes}.
 *
 *  @param {dictionary} paramd
 *  @param {dictionary} paramd.driverd
 *  The state to set in the thing. Typically this is
 *  created by {@link thing#driver_out}.
 *
 *  @param {Thing} paramd.thing
 *  The {@link Thing}. Typically not used.
 *
 *  @param {dictionary} paramd.thingd
 *  Some of the thing's state. Typically not used in drivers,
 *  use 'driverd' instead
 *
 *  @param {dictionary} paramd.attributed
 *  The attributes that we modified. Typically not used in
 *  drivers, 'driverd' will have all the correct
 *  values.
 *
 *  @return {this}
 *  this
 */
Driver.prototype.push = function (paramd) {
    var self = this;

    logger.error({
        method: "push",
        id: self.unique_id,
        cause: "Node-IOTDB programming error"
    }, "we expected this to be redefined in a subclass");
    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *
 *  <p>
 *  Also see {@link Thing#pull Model.pull}
 *
 *  @return {this}
 */
Driver.prototype.pull = function () {
    var self = this;

    logger.error({
        method: "pull",
        id: self.unique_id,
        cause: "Node-IOTDB programming error"
    }, "we expected this to be redefined in a subclass");
    return self;
};

/**
 *  Can this driver be reached (as far as we know)
 */
Driver.prototype.reachable = function () {
    return true;
};

/**
 *  Request the Driver's metadata.
 *
 *  @return {this}
 */
Driver.prototype.meta = function () {
    var self = this;

    var metad = self.driver_meta();
    metad = metad ? _.deepCopy(metad) : {};

    if (self.driver) {
        metad["iot:driver"] = self.driver;
    }
    metad["iot:reachable"] = self.reachable() ? true : false;

    if (self.thing) {
        var paramd = {
            thingd: {},
            driverd: {},
            initd: self.thing.initd,
            metad: metad
        };

        self.thing.driver_in(paramd);
    }

    var nd = {};
    for (var key in metad) {
        if (key.indexOf(':') > -1) {
            nd[_.expand(key)] = metad[key];
        }
    }

    return nd;
};

/**
 *  Return the raw driver metadata. This
 *  should be used mainly be 'meta' above,
 *  which does all needed translation work
 */
Driver.prototype.driver_meta = function () {
    return {};
};


/**
 *  This should only be called by subclases
 */
Driver.prototype.pulled = function (driverd) {
    var self = this;

    /* metadata update */
    if ((driverd === undefined) || (driverd === null)) {
        if (self.thing) {
            self.thing.meta_changed();
        }
        return;
    }

    /* the driver didn't chain Driver.setup OR setup was never called */
    if (!self.thing) {
        logger.error({
            method: "pull",
            id: self.unique_id,
            cause: "likely a Node-IOTDB error"
        }, "called - but no self.thing");
        return;
    }

    var paramd = {
        thingd: {},
        driverd: driverd,
        initd: self.thing.initd,
        libs: libs.libs
    };

    self.thing.driver_in(paramd);

    logger.trace({
        method: "pull",
        driverd: driverd,
        thingd: paramd.thingd,
        id: self.unique_id
    }, "pulled");

    self.thing.update(paramd.thingd, {
        notify: true,
        push: false
    });
};

/**
 *  MQTT built in
 */
Driver.prototype.mqtt_subscribe = function () {
    var self = this;

    if (!(self.mqtt_host && self.mqtt_port && self.mqtt_topic)) {
        logger.error({
            method: "mqtt_subscribe",
            id: self.unique_id,
            cause: "configuration error",
            hint: "HINT - you may need to define add 'mqtt_host' to $HOME/.iotdb/keystore.json",
            unique_id: self.unique_id,
            mqtt_host: self.mqtt_host,
            mqtt_port: self.mqtt_port,
            mqtt_topic: self.mqtt_topic
        }, "missing info");
    }

    self.mqtt_last_millis = (new Date()).getTime();

    var mqtt_client = mqtt.createClient(self.mqtt_port, self.mqtt_host);
    mqtt_client.setMaxListeners(25);

    logger.info({
        method: "mqtt_subscribe",
        id: self.unique_id,
        unique_id: self.unique_id,
        mqtt_host: self.mqtt_host,
        mqtt_port: self.mqtt_port,
        mqtt_topic: self.mqtt_topic,
        thing_id: self.thing_id()
    }, "subscribed");

    var on_message = function (in_topic, in_message) {
        // console.log("- Driver.mqtt_subscribe/on(message): MQTT receive:", in_topic, in_message)
        logger.info({
            method: "mqtt_subscribe",
            id: self.unique_id,
            in_topic: in_topic,
            in_message: in_message
        }, "subscribed");

        try {
            self.on_mqtt_message(in_topic, in_message);
        } catch (x) {
            // console.log("# Driver.mqtt_subscribe/on(message): MQTT receive: exception ignored", x)
            logger.info(x, {
                method: "mqtt_subscribe",
                id: self.unique_id
            }, "exception during 'on_mqtt_message' ignored");
        }
    };
    mqtt_client.on('message', on_message);

    self.on(EVENT_DISCONNECT, function () {
        //  console.log("# Driver.mqtt_subscribe/DISCONNECT", "thing_id", self.thing_id(), self.thing ? self.thing.get_code() : null)
        mqtt_client.removeListener('message', on_message);
    });

    mqtt_client.subscribe(self.mqtt_topic);
};

/**
 *  Pull information from initd
 *
 *  @protected
 */
Driver.prototype.mqtt_init = function (initd) {
    var self = this;

    if (!initd) {
        return;
    }
    if (initd.mqtt_host) {
        self.mqtt_host = initd.mqtt_host;
    }
    if (initd.mqtt_port) {
        self.mqtt_port = initd.mqtt_port;
    }
    if (initd.mqtt_json) {
        self.mqtt_json = initd.mqtt_json;
    }
    if (initd.mqtt_device) {
        self.mqtt_device = initd.mqtt_device;
    }

    /*
     *  Had to do this to make the wildcarding / driver
     *  thing work, otherwise it will be over written
     *  by the original Thing's mqtt_topic in initd
     */
    if (initd.mqtt_topic && (self.mqtt_topic == null)) {
        self.mqtt_topic = initd.mqtt_topic;
    }
};

/**
 *  Handle received MQTT messages. May be redefined by subclasses
 */
Driver.prototype.on_mqtt_message = function (in_topic, in_message) {
    var self = this;

    self.handle_mqtt_message(in_topic, in_message);
};

/**
 *  This is the standard way of handling messages, isolated so
 *  this code can be reused
 */
Driver.prototype.handle_mqtt_message = function (in_topic, in_message) {
    var self = this;

    if (self.mqtt_json) {
        self.pulled({
            mqtt_topic: in_topic,
            mqtt_message: JSON.parse(in_message)
        });
    } else {
        self.pulled({
            mqtt_topic: in_topic,
            mqtt_message: in_message
        });
    }
};

/**
 *  Initialize polling
 */
Driver.prototype.poll_init = function (initd) {
    var self = this;

    if (!initd) {
        return;
    }
    if (initd.poll) {
        self.poll_delta = initd.poll;
    }
};

/**
 *  Reschedule polling
 */
Driver.prototype.poll_reschedule = function () {
    var self = this;

    if (!self.poll_delta) {
        return;
    }

    if (self.poll_timer_id) {
        clearTimeout(self.poll_timer_id);
    }

    self.poll_timer_id = setInterval(function () {
        if (self.thing) {
            self.thing.pull();
        }
    }, self.poll_delta * 1000);
};

/**
 *  Helper function to report an issue
 */
Driver.prototype.report_issue = function () {
    var self = this;

    var iot = require('./iotdb').iot();
    if (!iot) {
        return;
    }

    return iot.report_issue.apply(iot, arguments);
};

/**
 *  Helper function to get a value from the IOT.Keystore
 */
Driver.prototype.cfg_get = function (key, otherwise) {
    return require('./iotdb').iot().cfg_get(key, otherwise);
};

/*
 *  API
 */
exports.Driver = Driver;
