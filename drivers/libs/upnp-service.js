var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	http = require("http"),
	url = require("url"),
	xml2js = require('xml2js');

var TRACE = true;
var DETAIL = false;

var UpnpAction = function(desc) {
	this.name = desc.name;
	this.arguments = {};
}

/**
 * A UPnP service.
 */
var UpnpService = function(device, desc) {
    EventEmitter.call(this);

	if (TRACE && DETAIL) {
		console.log("creating service object for: " + JSON.stringify(desc)); 
	}

	this.device = device;

	this.serviceType = desc.serviceType[0];
	this.serviceId   = desc.serviceId[0];
	this.controlUrl  = desc.controlURL[0];
	this.eventSubUrl = desc.eventSubURL[0];
	this.scpdUrl     = desc.SCPDURL[0];

	// actions that can be performed on this service
	this.actions = {};

	// variables that represent state on this service.
	this.stateVariables = {};

	var u = url.parse(device.location);
	this.host = u.hostname;
	this.port = u.port;
	
	this.subscriptionTimeout = 300; // 60;
}

util.inherits(UpnpService, EventEmitter);

/**
 * Call an action on a service.
 * args is a java object of name, value pairs. e.g. { BinaryState : v }
 */
UpnpService.prototype.callAction = function(actionName, args, callback) {
	if (TRACE) {
		console.log("calling action : " + actionName + " " + JSON.stringify(args));
	}
	var argXml = "";
	for (name in args) {
		argXml += "<" + name + ">" + args[name] + "</" + name + ">"; 
	}
	var content =  "<u:" + actionName + " xmlns:u=\""+this.serviceType+"\">" + argXml + "</u:" + actionName + ">";
 
	var s = [SOAP_ENV_PRE, content, SOAP_ENV_POST].join("");
	
	var options = {
	  	host    : this.host,
	  	port    : this.port,
	  	path    : this.controlUrl,
	  	method  : "POST",
	}
	
	if (TRACE && DETAIL) {
		console.log("sending SOAP request " + JSON.stringify(options) + "\n" + s);
	}

	options.headers = {
		"host"           : this.host + ":" + this.port,
		"SOAPACTION"     : "\"" + this.serviceType + "#" + actionName + "\"",
		'Content-Type'   : 'text/xml; charset="utf-8"',
		"content-length" : s.length,
	};

	var req = http.request(options, function(res) {
		var buf = "";
		res.on('data', function (chunk) { buf += chunk });
		res.on('end', function () { 
			if (res.statusCode !== 200) {
			  callback(new Error("Invalid SOAP action"), buf);
			}
			else {
				callback(null, buf)
			}
		});
	});
  
	req.end(s);
}

UpnpService.prototype.subscribe = function(callback) {
	var self = this;
	// TODO determine IP address for service to callback on.
	var callbackUrl = "http://" + this.device.localAddress + ":" + this.device.controlPoint.eventHandler.serverPort + "/listener";
	
	var options = {
	  	method  : "SUBSCRIBE",
	  	host    : this.host,
	  	port    : this.port,
	  	path    : this.eventSubUrl,
	}
	options.headers = {
		"host"     : this.host + ":" + this.port,
		"callback" : "<" + callbackUrl + ">",
		"nt"       : "upnp:event",
		"timeout"  : "Second-" + this.subscriptionTimeout,
	};
	
	if (TRACE) {
		console.log("subscribing: " + JSON.stringify(options));
	}
	
	var req = http.request(options, function(res) {
		var buf = "";
		res.on('data', function (chunk) { buf += chunk });
		res.on('end', function () { 
			if (res.statusCode !== 200) {
			  callback(new Error("Problem with subscription on " + service.serviceId), buf);
			}
			else {
				console.log("got subscription response: " + JSON.stringify(res.headers.sid));
				var sid = res.headers.sid;
				var subscription = new Subscription(self, sid, self.subscriptionTimeout);
				self.device.controlPoint.eventHandler.addSubscription(subscription);

				callback(null, buf)
			} 
		});
	});
  
	req.end("");
}

/**
 * 
 */
UpnpService.prototype._resubscribe = function(sid, callback) {
	var self = this;
	var options = {
	  	method  : "SUBSCRIBE",
	  	host    : this.host,
	  	port    : this.port,
	  	path    : this.eventSubUrl,
	}
	options.headers = {
		"host"     : this.host + ":" + this.port,
		"sid"      : sid,
		"timeout"  : "Second-" + this.subscriptionTimeout,
	};
	
	var req = http.request(options, function(res) {
		var buf = "";
		res.on('data', function (chunk) { buf += chunk });
		res.on('end', function () { 
			if (res.statusCode !== 200) {
				console.log("Problem with re-subscription on " + sid + " : " + buf);
				callback(new Error("Problem with re-subscription on " + sid), buf);
			}
			else {
				console.log("re-subscription success: " + self.device.udn + " : " + self.serviceId);
				callback(null, buf);
			} 
		});
	});
	req.end("");
}

/**
 * 
 */
UpnpService.prototype.unsubscribe = function(sid, callback) {
	var options = {
	  	method  : "UNSUBSCRIBE",
	  	host    : this.host,
	  	port    : this.port,
	  	path    : this.eventSubUrl,
	}
	options.headers = {
		"host"     : this.host + ":" + this.port,
		"sid"      : sid,
	};

	var req = http.request(options, function(res) {
		var buf = "";
		res.on('data', function (chunk) { buf += chunk });
		res.on('end', function () { 
			if (res.statusCode !== 200) {
				if (callback && typeof(callback) === "function") {
					callback(new Error("Problem with unsubscription on " + service.serviceId), buf);
				}
			}
			else {
				console.log("unsubscribe success: " + buf);
				if (callback && typeof(callback) === "function") {
					callback(null, buf);
				}
			} 
		});
	});
	req.end("");
}

/**
 * 
 */
UpnpService.prototype._getServiceDesc = function(callback) {
	var options = {
		host : this.host,
		port : this.port,
		path : this.scpdUrl,
	}
	options.headers = {
		"host"  : this.host + ":" + this.port,
	};
	var req = http.request(options, function(res) {
		var buf = "";
		res.on('data', function (chunk) { buf += chunk });
		res.on('end', function () { 
			if (res.statusCode !== 200) {
				callback(new Error("Problem with getting basic event service desc " + service.serviceId), buf);
			}
			else {
				// TODO handle actions and state variables
				callback(null, buf);
			} 
		});
	});
	req.end("");
}

/**
 * A subscription
 */
var Subscription = function(service, sid, timeout) {
	var self = this;
	this.service = service;
	this.sid = sid;		// subscrioption id
	this.timeout = timeout;	// timeout in seconds
	
	this.timer = setTimeout(function() { 
		self._resubscribe();
	}, (this.timeout*1000)-5000);
}

Subscription.prototype._resubscribe = function() {
	var self = this;
	this.service._resubscribe(this.sid, function(err, buf) {
		if (err) {
			console.log("ERROR:  problem re-subscribing: " + err + "\n" + buf);
			// remove from eventhandler
			self.service.device.controlPoint.eventHandler.removeSubscription(self);
			clearTimeout(self.timer);
			
			// TODO maybe try a new subscription ???
		}
		else {
			// cool
			self.timer = setTimeout(function() { 
				self._resubscribe();
			}, (self.timeout*1000)-5000);
		}
	});
}

Subscription.prototype.unsubscribe = function() {
	clearInterval(this.timer);
	this.service.unsubscribe(sid);
}

Subscription.prototype.handleEvent = function(event) {
	if (TRACE && DETAIL) {
		console.log("subscription event: " + JSON.stringify(event));
	}
	this.service.emit("stateChange", event);
}

exports.UpnpService = UpnpService;


/* ---------------------------------------------------------------------------------- */
const SOAP_ENV_PRE = "<?xml version=\"1.0\"?>\n<s:Envelope \
xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\" \
s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\"><s:Body>\n";

const SOAP_ENV_POST = "</s:Body>\n</s:Envelope>\n";


