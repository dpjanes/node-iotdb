/*
 *  drivers/tcp-connected.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-08-10
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

"use strict"

var _ = require("../helpers");
var driver = require('../driver')
var FIFOQueue = require('../queue').FIFOQueue
var TCPControlPoint = require('./libs/tcp-connected')

var queue = new FIFOQueue("TCPConnectedDriver");

/**
 */
var TCPConnectedDriver = function(paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: "iot-driver:tcp-connected",
        room: null,
        name: null,
        initd: {}
    })

    self.room = paramd.room
    self.name = paramd.name

    self.verbose = paramd.verbose
    self.driver = _.expand(paramd.driver)

    self._init(paramd.initd)

    self.metad = {}
    if (paramd && paramd.metad) {
        self.metad = _.extend(paramd.metad)
    }
    if (self.name) {
        self.metad[_.expand("iot:name")] = self.name
    }
    self.metad[_.expand("schema:manufacturer")] = "http://www.tcpi.com/"

    /*
     *  Might consider 'network_id' in future? because multiple
     *  machines can see this same lamp and we're going 
     *  with room based naming
     */
    var machine_id = self.cfg_get("machine_id", null)
    if (machine_id && self.name) {
        self.metad["iot:dsid"] = _.expand("iot-driver:tcp-connected/" + machine_id + "/" + self.name)
    }

    return self;
};

TCPConnectedDriver.prototype = new driver.Driver;

/* --- class methods --- */
var _cp = undefined;

TCPConnectedDriver.cp = function() {
    if (_cp === undefined) {
        _cp = new TCPControlPoint();
    }

    return _cp
};

TCPConnectedDriver.prototype.driver_meta = function() {
    return this.metad
};

/**
 *  Pull information from initd
 *
 *  @protected
 */
TCPConnectedDriver.prototype._init = function(initd) {
    var self = this;

    if (!initd) {
        return
    }
};

/**
 *  See {@link Driver#identity Driver.identity}
 */
TCPConnectedDriver.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver"] = self.driver

        if (self.room) {
            identityd["did"] = self.name
            identityd["name"] = self.name
        }

        // XXX machine-id???

        _.thing_id(identityd);
        
        self.__identityd = identityd;
    }

    return self.__identityd;
};

/**
 *  See {@link Driver#setup Driver.setup}
 */
TCPConnectedDriver.prototype.setup = function(paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd)

    return self;
};

/*
 *  See {@link Driver#discover Driver.discover}
 */
TCPConnectedDriver.prototype.discover = function(paramd, discover_callback) {
    var self = this;

    var cp = TCPConnectedDriver.cp();
    cp.GetState(function(error, rooms) {
        if (rooms === null) {
            console.log("# TCPConnectDriver.discover/GetState", "no rooms?")
            return
        }

        for (var ri in rooms) {
            var room = rooms[ri]
            discover_callback(new TCPConnectedDriver({
                room: room,
                name: room.name
            }))

            /*
            tcp.GetRoomStateByName(room.name, function(error,state,level){
                console.log("State: " + state + " at Level: " + level);
                if(state == 0){
                    tcp.TurnOnRoomByName(room);
                }
            });
            tcp.SetRoomLevelByName(room.name, 100);
            */
        }
    })
};

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
TCPConnectedDriver.prototype.push = function(paramd) {
    var self = this;

    console.log("- TCPConnectedDriver.push", 
        "\n  driverd", paramd.driverd, 
        "\n  initd", paramd.initd)

    var cp = TCPConnectedDriver.cp();
    var pulled = null

    if (paramd.driverd.brightness === undefined) {
    } else if (paramd.driverd.brightness > 0) {
        if (!paramd.driverd.on) {
            paramd.driverd.on = true

            pulled = {
                on: true
            }
        }
    } else if (paramd.driverd.brightness === 0) {
        if (paramd.driverd.on !== false) {
            paramd.driverd.on = false

            pulled = {
                on: false
            }
        }
    }

    if (paramd.driverd.brightness !== undefined) {
        var b = paramd.driverd.brightness * 100
        b = Math.min(100, b)
        b = Math.max(0, b)
        cp.SetRoomLevelByName(self.room.name, b)
    }

    if (paramd.driverd.on === undefined) {
    } else if (paramd.driverd.on === true) {
        cp.TurnOnRoomByName(self.room);
    } else if (paramd.driverd.on === false) {
        cp.TurnOffRoomByName(self.room);
    }

    if (pulled) {
        self.pulled(pulled)
    }

    return self;
};

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
TCPConnectedDriver.prototype.pull = function(paramd) {
    var self = this;

    console.log("- TCPConnectedDriver.pull")

    return self;
};


/*
 *  API
 */
exports.Driver = TCPConnectedDriver
