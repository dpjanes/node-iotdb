"use strict"

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    http = require("http"),
    url = require("url"),
    xml2js = require('xml2js');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'drivers/libs/upnp-service',
});

var TRACE = true;
var DETAIL = false;

var UpnpAction = function (desc) {
    this.name = desc.name;
    this.arguments = {};
}

/**
 * A UPnP service.
 */
var UpnpService = function (device, desc) {
    EventEmitter.call(this);

    if (TRACE && DETAIL) {
        console.log("- UPnP:UpnpService", "creating service object", JSON.stringify(desc));
        logger.info({
            method: "UpnpService"
        }, "");
    }

    this.device = device;

    this.forgotten = false
    this.serviceType = desc.serviceType[0];
    this.serviceId = desc.serviceId[0];
    this.controlUrl = desc.controlURL[0];
    this.eventSubUrl = desc.eventSubURL[0];
    this.scpdUrl = desc.SCPDURL[0];

    // actions that can be performed on this service
    this.actions = {};

    // variables that represent state on this service.
    this.stateVariables = {};

    var u = url.parse(device.location);
    this.host = u.hostname;
    this.port = u.port;

    this.subscriptionTimeout = 30; // 60;
}

util.inherits(UpnpService, EventEmitter);

/**
 *  forget about this device (called from upnp-device.forget)
 */
UpnpService.prototype.forget = function () {
    var self = this

    logger.info({
        method: "UpnpService.forget",
        serviceType: this.serviceType, 
        serviceId: this.serviceId,
    }, "forgetting this device");
    self.forgotten = true
        // self.removeAllListeners()
}

/**
 * Call an action on a service.
 * args is a java object of name, value pairs. e.g. { BinaryState : v }
 */
UpnpService.prototype.callAction = function (actionName, args, callback) {
    if (this.forgotten) {
        retrurn
    }

    if (TRACE) {
        logger.info({
            method: "UpnpService.callAction",
            actionName: actionName,
            args: args,
        }, "calling action");
    }
    var argXml = "";
    for (var name in args) {
        argXml += "<" + name + ">" + args[name] + "</" + name + ">";
    }
    var content = "<u:" + actionName + " xmlns:u=\"" + this.serviceType + "\">" + argXml + "</u:" + actionName + ">";

    var s = [SOAP_ENV_PRE, content, SOAP_ENV_POST].join("");

    var options = {
        host: this.host,
        port: this.port,
        path: this.controlUrl,
        method: "POST",
    }

    if (TRACE && DETAIL) {
        console.log("- UPnP:UpnpService.callAction", "- sending SOAP request " + JSON.stringify(options) + "\n" + s);
        logger.info({
            method: "UpnpService.callAction",
        }, "");
    }

    options.headers = {
        "host": this.host + ":" + this.port,
        "SOAPACTION": "\"" + this.serviceType + "#" + actionName + "\"",
        'Content-Type': 'text/xml; charset="utf-8"',
        "content-length": s.length,
    };

    var req = http.request(options, function (res) {
        var buf = "";
        res.on('data', function (chunk) {
            buf += chunk
        });
        res.on('error', function (error) {
            console.log("# UPnP:UpnpService.callAction", "error receiving HTTP request", error)
            logger.info({
                method: "UpnpService.callAction/on(error)",
            }, "");
            callback(error, buf);
        })
        res.on('end', function () {
            if (res.statusCode !== 200) {
                callback(new Error("Invalid SOAP action"), buf);
            } else {
                callback(null, buf)
            }
        });
    });
    req.on('error', function (error) {
        console.log("# UpnpService.callAction", "error sending HTTP request", error)
        logger.info({
            method: "UpnpService.callAction/on(error)",
        }, "");
        callback(error, "");
    })

    req.end(s);
}

UpnpService.prototype.subscribe = function (callback) {
    if (this.forgotten) {
        retrurn
    }

    var self = this;
    // TODO determine IP address for service to callback on.
    var callbackUrl = "http://" + this.device.localAddress + ":" + this.device.controlPoint.eventHandler.serverPort + "/listener";

    var options = {
        method: "SUBSCRIBE",
        host: this.host,
        port: this.port,
        path: this.eventSubUrl,
    }
    options.headers = {
        "host": this.host + ":" + this.port,
        "callback": "<" + callbackUrl + ">",
        "nt": "upnp:event",
        "timeout": "Second-" + this.subscriptionTimeout,
    };

    if (TRACE) {
        logger.info({
            method: "UpnpService.subscribe",
            options: options
        }, "subscribing");
    }

    var req = http.request(options, function (res) {
        var buf = "";
        res.on('data', function (chunk) {
            buf += chunk
        });
        res.on('end', function () {
            if (res.statusCode !== 200) {
                callback(new Error("Problem with subscription on " + service.serviceId), buf);
            } else {
                logger.error({
                    method: "UpnpService.subscribe/on(end)",
                    headers: res.headers
                }, "error subscribing");
                var sid = res.headers.sid;
                var subscription = new Subscription(self, sid, self.subscriptionTimeout);
                self.device.controlPoint.eventHandler.addSubscription(subscription);

                callback(null, buf)
            }
        });
    });
    req.on('error', function (error) {
        logger.info({
            method: "UpnpService.subscribe/on(error)",
            error: error
        }, "error sending HTTP request");
        callback(error, "");
    })

    req.end("");
}

/**
 *
 */
UpnpService.prototype._resubscribe = function (sid, callback) {
    if (this.forgotten) {
        retrurn
    }

    var self = this;
    var options = {
        method: "SUBSCRIBE",
        host: this.host,
        port: this.port,
        path: this.eventSubUrl,
    }
    options.headers = {
        "host": this.host + ":" + this.port,
        "sid": sid,
        "timeout": "Second-" + this.subscriptionTimeout,
    };

    if (TRACE && DETAIL) {
        console.log("- UPnP:UpnpService.resubscribe", "resubscribing", JSON.stringify(options));
        logger.info({
            method: "UpnpService._resubscribe",
        }, "");
    }

    var req = http.request(options, function (res) {
        var buf = "";
        res.on('data', function (chunk) {
            buf += chunk
        });
        res.on('end', function () {
            if (res.statusCode !== 200) {
                console.log("# UPnP:UpnpService._resubscribe", "Problem with re-subscription", sid, buf);
                callback(new Error("Problem with re-subscription on " + sid), buf);
            } else {
                if (TRACE && DETAIL) {
                    console.log("- UPnP:UpnpService._resubscribe",
                        "re-subscription success", self.device.udn, self.serviceId);
                }
                callback(null, buf);
            }
        });
    });
    req.on('error', function (error) {
        console.log("# UPnP:UpnpService._resubscribe", "error sending HTTP request", error)
        callback(error, "");
    })
    req.end("");
}

/**
 *
 */
UpnpService.prototype.unsubscribe = function (sid, callback) {
    var options = {
        method: "UNSUBSCRIBE",
        host: this.host,
        port: this.port,
        path: this.eventSubUrl,
    }
    options.headers = {
        "host": this.host + ":" + this.port,
        "sid": sid,
    };

    var req = http.request(options, function (res) {
        var buf = "";
        res.on('data', function (chunk) {
            buf += chunk
        });
        res.on('end', function () {
            if (res.statusCode !== 200) {
                if (callback && typeof (callback) === "function") {
                    callback(new Error("Problem with unsubscription on " + service.serviceId), buf);
                }
            } else {
                console.log("unsubscribe success: " + buf);
                if (callback && typeof (callback) === "function") {
                    callback(null, buf);
                }
            }
        });
    });
    req.on('error', function (error) {
        console.log("# UPnP:UpnpService.unsubscribe", "error sending HTTP request", error)
        callback(error, "");
    })
    req.end("");
}

/**
 *
 */
UpnpService.prototype._getServiceDesc = function (callback) {
    var options = {
        host: this.host,
        port: this.port,
        path: this.scpdUrl,
    }
    options.headers = {
        "host": this.host + ":" + this.port,
    };
    var req = http.request(options, function (res) {
        var buf = "";
        res.on('data', function (chunk) {
            buf += chunk
        });
        res.on('end', function () {
            if (res.statusCode !== 200) {
                callback(new Error("Problem with getting basic event service desc " + service.serviceId), buf);
            } else {
                // TODO handle actions and state variables
                callback(null, buf);
            }
        });
    });
    req.on('error', function (error) {
        console.log("# UPnP:UpnpService._getServiceDesc", "error sending HTTP request", error)
        callback(error, "");
    })
    req.end("");
}

/**
 * A subscription
 */
var Subscription = function (service, sid, timeout) {
    var self = this;
    this.service = service;
    this.sid = sid; // subscrioption id
    this.timeout = timeout; // timeout in seconds

    this.timer = setTimeout(function () {
        self._resubscribe();
    }, (this.timeout * 1000) - 5000);
}

Subscription.prototype._resubscribe = function () {
    var self = this;

    if (self.service.forgotten) {
        try {
            this.unsubscribe()
        } catch (x) {}

        try {
            self.service.device.controlPoint.eventHandler.removeSubscription(self);
        } catch (x) {}

        clearTimeout(self.timer);
        return
    }

    this.service._resubscribe(this.sid, function (err, buf) {
        if (self.service.forgotten) {
            clearTimeout(self.timer);
            return
        }

        if (err) {
            console.log("# UPnP:Subscription._resubscribe", "ERROR: problem re-subscribing", err, "\n  ", buf);
            try {
                self.service.device.controlPoint.eventHandler.removeSubscription(self);
            } catch (x) {}
            clearTimeout(self.timer);

            console.log("# UPnP:Subscription._resubscribe", "attempting to subscribe from scratch")
            self.service.subscribe(function (err, buf) {})

            // self.service.emit("failed", "resubscribe", err);
            // TODO maybe try a new subscription ???
        } else {
            // cool
            self.timer = setTimeout(function () {
                self._resubscribe();
            }, (self.timeout * 1000) - 5000);
        }
    });
}

Subscription.prototype.unsubscribe = function () {
    clearInterval(this.timer);
    this.service.unsubscribe(sid);
}

Subscription.prototype.handleEvent = function (event) {
    if (this.service.forgotten) {
        return
    }

    if (TRACE && DETAIL) {
        console.log("# UPnP:Subscription.handleEvent", "subscription event", JSON.stringify(event));
    }
    this.service.emit("stateChange", event);
}

exports.UpnpService = UpnpService;


/* ---------------------------------------------------------------------------------- */
var SOAP_ENV_PRE = "<?xml version=\"1.0\"?>\n<s:Envelope \
xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\" \
s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\"><s:Body>\n";

var SOAP_ENV_POST = "</s:Body>\n</s:Envelope>\n";
