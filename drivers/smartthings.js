/*
 *  drivers/smartthings.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-02-26
 *
 *  Connect to SmartThings
 */

"use strict"

var _ = require("../helpers");
var driver = require('../driver')
var FIFOQueue = require('../queue').FIFOQueue
var SmartThings = require('./libs/smartthingslib').SmartThings
var mqtt = require('mqtt')

var queue = new FIFOQueue("SmartThingsDriver");
var st = null;

/**
 */
var SmartThingsDriver = function(paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver_iri: "iot-driver:smartthings",
        initd: {}
    })

    self.verbose = paramd.verbose
    self.driver_iri = _.expand(paramd.driver_iri)

    // smartthings values, setup in setup
    self.id = null;
    self.type = null;
    self._init(paramd.initd)

    return self;
}

SmartThingsDriver.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
SmartThingsDriver.prototype._init = function(initd) {
    var self = this;

    if (!initd) {
        return
    }
    if (initd.type) {
        self.type = initd.type
    }
    if (initd.id) {
        self.id = initd.id
    }

    self.mqtt_init(initd)
}

/**
 *  See {@link Driver#register Driver.register}
 */
SmartThingsDriver.prototype.register = function(iot) {
    var self = this;

    driver.Driver.prototype.register.call(self, iot);

    if (st == null) {
        st = new SmartThings()
        st.load_settings(iot.cfg_get_oauthd("https://graph.api.smartthings.com/"))
        st.request_endpoint()
    }
}

/**
 *  See {@link Driver#identity Driver.identity}
 */
SmartThingsDriver.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver_iri"] = self.driver_iri
        if (self.id) {
            identityd["id"] = self.id
        }
        if (self.type) {
            identityd["type"] = self.type
        }

        _.thing_id(identityd);
        
        self.__identityd = identityd;
    }

    return self.__identityd;
}

/**
 *  See {@link Driver#setup Driver.setup}
 */
SmartThingsDriver.prototype.setup = function(paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    if (paramd.initd) {
        self._init(paramd.initd)
    }

    if (self.type && self.id) {
        self.mqtt_topic = "u/nobody/st/" + self.type + "/" + self.id;
        self.mqtt_subscribe()
    }

    return self;
}

/**
 *  See {@link Driver#handle_mqtt_message Driver.handle_mqtt_message}
 */
SmartThingsDriver.prototype.handle_mqtt_message = function(in_topic, in_message) {
    var self = this;

    if (in_topic.substring(0, self.mqtt_topic.length) != self.mqtt_topic) {
        return;
    }

    try {
        var in_messaged = JSON.parse(in_message) 
        delete in_messaged['timestamp']

        self.pulled(in_messaged)
    } catch (x) {
        console.log("# SmartThingsDriver.handle_mqtt_message: MQTT receive: exception ignored", x)
    }

    console.log("- SmartThingsDriver.handle_mqtt_message: MQTT receive:", in_topic, in_message)
}

/**
 *  See {@link Driver#discover Driver.discover}
 */
SmartThingsDriver.prototype.discover = function(paramd, discover_callback) {
    var self = this;

    st.on("devices", function(device_type, devices) {
        for (var di in devices) {
            var device = devices[di];
            var driver = new SmartThingsDriver({
                initd: {
                    type: device.type,
                    id: device.id
                }
            })

            discover_callback(driver)
        }
    })

    if (!st.endpointd.url) {
        st.on("endpoint", function() {
            self._request_all_devices()
        })
    } else {
        self._request_all_devices()
    }
}

SmartThingsDriver.prototype._request_all_devices = function() {
    var dtypes = [
        "switch",
        "contact",
        "motion"
    ]

    for (var dti in dtypes) {
        var dtype = dtypes[dti]
        st.request_devices(dtype)
    }
}

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
SmartThingsDriver.prototype.push = function(paramd) {
    var self = this;

    console.log("- SmartThingsDriver.push", 
        "\n  driverd", paramd.driverd, 
        "\n  initd", paramd.initd,
        "\n  smarthings.id", self.id,
        "\n  smarthings.type", self.type
        )

    st.device_request({
        id: self.id,
        type: self.type
    }, paramd.driverd);

    return self;
}

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
SmartThingsDriver.prototype.pull = function() {
    var self = this;

    console.log("- SmartThingsDriver.pull")

    return self;
}


/*
 *  API
 */
exports.Driver = SmartThingsDriver
