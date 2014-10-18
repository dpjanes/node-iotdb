/*
 *  drivers/rest.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-01-02
 *
 *  Connect to JSON / REST-like webservices
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

var _ = require("../helpers");
var driver = require('../driver');
var FIFOQueue = require('../queue').FIFOQueue;
var unirest = require('unirest');

var xml2js = require('xml2js');
var iotdb = require('iotdb');
var node_url = require('url');

var queue = new FIFOQueue("RESTDriver");

/**
 */
var RESTDriver = function(paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: "iot-driver:rest",
        initd: {}
    })

    self.verbose = paramd.verbose;
    self.driver = _.expand(paramd.driver)
    self.iri = null
    self.content_type = "application/json"

    self._init(paramd.initd)

    return self;
};

RESTDriver.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
RESTDriver.prototype._init = function(initd) {
    var self = this;

    if (!initd) {
        return
    }
    if (initd.iri) {
        self.iri = initd.iri
    }
    if (initd.content_type) {
        self.content_type = initd.content_type
    }

    self.poll_init(initd)
    self.mqtt_init(initd)
};

/**
 *  See {@link Driver#identity Driver.identity}
 */
RESTDriver.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver"] = self.driver

        // once the driver is 'setup' this will have a value
        if (self.iri) {
            identityd["iri"] = self.iri
        }

        _.thing_id(identityd);
        
        self.__identityd = identityd;
    }

    return self.__identityd;
};

/**
 *  See {@link Driver#setup Driver.setup}
 *  <p>
 *  Record the actual API of the JSON. This
 *  is used in creating the proper identity
 */
RESTDriver.prototype.setup = function(paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd)

    if (self.mqtt_topic) {
        self.mqtt_subscribe()
    }

    return self;
};

/**
 *  See {@link Driver#discover Driver.discover}
 */
RESTDriver.prototype.discover = function(paramd, discover_callback) {
    if (paramd.initd === undefined) {
        console.log("# RESTDriver.discover: no nearby discovery (not a problem)")
        return
    }

    discover_callback(new RESTDriver());
};

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
RESTDriver.prototype.push = function(paramd) {
    var self = this;

    console.log("- RESTDriver.push", 
        "\n  iri", self.iri, 
        "\n  driverd", paramd.driverd, 
        "\n  initd", paramd.initd)

    var qitem = {
        id: self.light,
        run: function() {
            unirest
                .put(self.iri)
                .headers({'Accept': 'application/json'})
                .type('json')
                .send(paramd.driverd)
                .end(function(result) {
                    queue.finished(qitem);
                    if (!result.ok) {
                        console.log("# RESTDriver.push/.end", "not ok", "url", self.iri, "result", result.text);
                        return
                    }

                    console.log("- RESTDriver.push/.end.body", result.body);
                })
            ;
        }
    }
    queue.add(qitem);

    return self;
};

RESTDriver.prototype._parse_headers = function(headers) {
    var self = this;

    if (self.__parsed_headers) {
        return
    } else {
        self.__parsed_headers = true
    }

    /*
     *  rel="mqtt"
     */
    if (headers.link) {
        var linkdd = iotdb.libs.http.parse_link(headers.link)
        for (var mqtt_url in linkdd) {
            var linkd = linkdd[mqtt_url]
            if (linkd.rel != "mqtt") {
                continue
            }

            var mqtt_host = null
            var mqtt_port = 1833
            var mqtt_topic = ""

            var mqtt_urlp = node_url.parse(mqtt_url)
            if (mqtt_urlp.protocol != "tcp:") {
                continue
            }

            mqtt_port = parseInt(mqtt_urlp.port)
            mqtt_host = mqtt_urlp.hostname

            if (linkd.topic) {
                mqtt_topic = linkd.topic
            } else {
                var irip = node_url.parse(self.iri)
                if (irip.path) {
                    mqtt_topic = irip.path.replace(/^\//, '')
                }
            }

            console.log("- RestDriver._parse_headers: MQTT info found",
                "\n  mqtt_host", mqtt_host,
                "\n  mqtt_port", mqtt_port,
                "\n  mqtt_topic", mqtt_topic
            )

            self.mqtt_host = mqtt_host
            self.mqtt_port = mqtt_port
            self.mqtt_topic = mqtt_topic
            self.mqtt_subscribe()
            break
        }
    }
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
RESTDriver.prototype.pull = function() {
    var self = this;

    console.log("- RESTDriver.pull", 
        "\n  iri", self.iri
    )

    var qitem = {
        id: self.light,
        run: function() {
            unirest
                .get(self.iri)
                .headers({'Accept': self.content_type})
                .end(function(result) {
                    queue.finished(qitem);
                    if (!result.ok) {
                        console.log("# RESTDriver.pull/.end - not ok", 
                            "\n  url", self.iri, 
                            "\n  result", result.text);
                        return
                    }

                    self._parse_headers(result.headers)

                    if (self.content_type == "application/json") {
                        self.pulled(result.body)
                    } else if (self.content_type.match(/application\/[^+]*[+]json/)) {
                        self.pulled(result.body)
                    } else if ((self.content_type == "application/xml") || (self.content_type == "text/xml")) {
                        xml2js.parseString(result.body, function (err, result) {
                            self.pulled(result)
                        });
                    } else {
                        console.log("# RESTDriver.pull/.end - unknown content_type", self.content_type)
                        return
                    }

                    /*
                     *  Schedule the next data pull
                     */
                    self.poll_reschedule()
                })
            ;
        }
    }
    queue.add(qitem);

    return self;
};

/**
 *  See {@link Driver#handle_mqtt_message Driver.handle_mqtt_message}
 */
RESTDriver.prototype.handle_mqtt_message = function(in_topic, in_message) {
    console.log("- RESTDriver.handle_mqtt_message: received update, pulling")
    this.pull()
};

/*
 *  API
 */
exports.Driver = RESTDriver
