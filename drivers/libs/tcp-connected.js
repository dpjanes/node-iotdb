/**
 *  drivers/upnp.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-08-09
 *
 *  This is an update of
 *  https://github.com/stockmopar/connectedbytcp
 *  to use simpler libraries
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

"use strict"

var util = require('util');
var unirest = require('unirest');
var xml2js = require('xml2js')

module.exports = TCPConnected;

var RequestString = 'cmd=%s&data=%s&fmt=xml';
var GetStateString = ['<gwrcmds><gwrcmd><gcmd>RoomGetCarousel</gcmd><gdata><gip><version>1</version><token>1234567890</token><fields>name,control,power,product,class,realtype,status</fields></gip></gdata></gwrcmd></gwrcmds>'].join('\n');
var RoomSendCommand = ['<gip><version>1</version><token>1234567890</token><rid>%s</rid><value>%s</value></gip>'].join('\n');
var RoomSendLevelCommand = ['<gip><version>1</version><token>1234567890</token><rid>%s</rid><value>%s</value><type>level</type></gip>'].join('\n');

function TCPConnected(host) {
    var self = this;

	if (!host) {
        host = "lighting.local"
    }

	self._host = host;
    self.rooms = [];
};

TCPConnected.prototype._request = function(payload, callback) {
    unirest
        .post('http://'+this._host+'/gwr/gop.php')
        .headers({
            'Content-Type': 'text/xml; charset="utf-8"',
            'Content-Length': payload.length
        })
        .send(payload)
        .end(function(result) {
            if (!result.ok) {
                console.log("# TCPConnected._request", "error", result.error)
                callback(result.error, null)
            } else if (result.body) {
                xml2js.parseString(result.body, function(error, result) {
                    callback(null, flatten(result.gwrcmds))
                });
            } else {
                console.log("# TCPConnected._request", "no body - unexpected")
                callback("no body", null)
            }
        })
    ;
}

/**
 *  This converts what xml-to-js makes to xml2js 
 */
var flatten = function(o) {
    if (Array.isArray(o)) {
        if (o.length === 1) {
            return flatten(o[0])
        } else {
            var ns = []
            for (var oi in o) {
                ns.push(flatten(o[oi]))
            }
            return ns
        }
    } else if (typeof o === "object") {
        var nd = {}
        for (var nkey in o) {
            nd[nkey] = flatten(o[nkey])
        }
        return nd
    } else {
        return o
    }
}

/**
 *  This bridges 
 */
TCPConnected.prototype.GetState = function (cb){
    var self = this;

	var payload = util.format(RequestString,'GWRBatch',encodeURIComponent(GetStateString));

    self._request(payload, function(error, xml) {
        if (xml) {
            try {
                self.rooms = xml['gwrcmd']['gdata']['gip']['room'];
                if (typeof(self.rooms["rid"]) !== 'undefined'){
                    self.rooms = [ self.rooms ];
                }
            }
            catch (err) {
                var error = {error:'Unkown Error'}
            }
        }

        cb(error||null,self.rooms);
    })
}

TCPConnected.prototype.GetRoomStateByName = function (name, cb){
    var self = this;

	self.rooms.forEach(function(room) { 
		if (room["name"] == name){
			var state = 0;
			var i = 0;
			var sum = 0;
			var devices = room["device"];
			if (typeof(devices["did"]) !== 'undefined'){
				i = i+1;
				if(devices["state"] != "0"){
					state = 1;
					sum = sum + parseInt(devices["level"]);
				}
			}else{
				devices.forEach(function(device) { 
					i = i+1;
					if(device["state"] != "0"){
						state = 1;
						sum = sum + parseInt(device["level"]);
					}
				});
				
			}
			if(i == 0){
				sum = 0;
				i = 1;
				state = 0;
			}
			var level = sum / i;
			cb(null,state,level);
		}
	});
}
TCPConnected.prototype.GetRIDByName = function (name){
    var self = this;

	var rid = 0;
	//console.log(self.rooms);
	self.rooms.forEach(function(room) {
		//console.log(room);
		if(room["name"] == name){
			rid = room["rid"];
		}
	});
	//console.log(rid);
	return rid;
}

TCPConnected.prototype.TurnOnRoomByName = function (name){
    var self = this
	var rid = this.GetRIDByName(name);
	
	var RoomCommand = util.format(RoomSendCommand,rid,1);
	var payload = util.format(RequestString,'RoomSendCommand',encodeURIComponent(RoomCommand));

    self._request(payload, function(error, xml) {
    })
}

TCPConnected.prototype.TurnOffRoomByName = function (name, cb){
    var self = this
	// console.log("Turn Off Room");
	var rid = this.GetRIDByName(name);
	
	var RoomCommand = util.format(RoomSendCommand,rid,0);
	var payload = util.format(RequestString,'RoomSendCommand',encodeURIComponent(RoomCommand));
	
    self._request(payload, function(error, xml) {
        if (xml) {
            _process_result(xml)
        }
    })
}

TCPConnected.prototype.SetRoomLevelByName = function (name, level, cb){
    var self = this
	var rid = this.GetRIDByName(name);
	
	var RoomLevelCommand = util.format(RoomSendLevelCommand,rid,level);
	var payload = util.format(RequestString,'RoomSendCommand',encodeURIComponent(RoomLevelCommand));
	
    self._request(payload, function(error, xml) {
    })
}
