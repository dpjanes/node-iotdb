/*
 *  drivers/firmata.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-04-18
 *
 *  Connect to Arduinos (etc) using Firmata
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

var firmata = require('firmata')

var _ = require("../helpers");
var driver = require('../driver')
var FIFOQueue = require('../queue').FIFOQueue

var boardd = {};
var machine_id = undefined;

var START_SYSEX = 0xF0   
var END_SYSEX = 0xF7   

var unpack_bytes = function(board) {
    var length = ( board.currentBuffer.length - 3 ) / 2;
    var outb = new Buffer(length)
    var p = 0

    for (var obi = 0; obi < length; obi++) {
        var ibi0 = 2 + obi * 2;
        var ibi1 = 3 + obi * 2;
        var ob = (board.currentBuffer[ibi0] & 0x7F) | ((board.currentBuffer[ibi1] & 0x7F) << 7);
        outb[obi] = ob
    }

    return outb
}

var unpack_char8s = function(board) {
    var outb = unpack_bytes(board)
    return outb.toString()
}

var unpack_int8s = function(board) {
    var outb = unpack_bytes(board)
    var outi = []
    for (var i = 0; i < outb.length; i++) {
        outi.push(outb[i])
    }

    return outi
}

var unpack_int16s = function(board) {
    var outb = unpack_bytes(board)
    var outi = []
    for (var i = 0; i < outb.length; i += 2) {
        outi.push(outb.readInt16LE(i))
    }

    return outi
}

var unpack_int32s = function(board) {
    var outb = unpack_bytes(board)
    var outi = []
    for (var i = 0; i < outb.length; i += 4) {
        outi.push(outb.readInt32LE(i))
    }

    return outi
}

var unpack_floats = function(board) {
    var outb = unpack_bytes(board)
    var outi = []
    for (var i = 0; i < outb.length; i += 4) {
        outi.push(outb.readFloatLE(i))
    }

    return outi
}

/**
 */
var FirmataDriver = function(paramd) {
    var self = this;

    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver: "iot-driver:firmata",
        initd: {}
    })

    self.verbose = paramd.verbose
    self.driver = _.expand(paramd.driver)

    self.firmata_ready = false

    self.tty = null
    self.pindd = {}
    self.board = null
    self.sysex = 10

    self._init(paramd.initd)

    return self;
}

FirmataDriver.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  Pull information from initd
 *
 *  @protected
 */
FirmataDriver.prototype._init = function(initd) {
    var self = this;

    if (initd.tty) {
        self.tty = initd.tty
    }

    if (initd.pins && initd.pins.length) {
        var parts = initd.pins.split(";")
        for (var pi in parts) {
            var part = parts[pi]
            var kv = part.split(":")
            self._setup_code(kv[0], kv[1], initd)
        }

        if (self.verbose) console.log("- FirmataDriver._init", "pindd", self.pindd)
    }
}

/**
 */
FirmataDriver.prototype._setup_code = function(code, code_value, initd) {
    var self = this;

    if (!_.isString(code_value)) {
        return
    }

    var pind = {
        code: code,
        mode: "output",
        pin: null,
        initialized: false,
        identity: null,
        sysex: null,
        extension: null
    }

    var parts = code_value.split(",")
    for (var pi in parts) {
        var part = parts[pi]
        var kv = part.split("=")
        if (kv.length == 2) {
            var key = kv[0]
            var value = kv[1]

            if (key == "mode") {
                pind.mode = value
                if (pind.mode.indexOf("sysex-") == 0) {
                    if (pind.sysex === null) {
                        pind.sysex = 0
                    }
                }
            } else if (key == "pin") {
                pind.pin = value
            } else if (key == "extension") {
                pind.extension = value
            } else if (key == "sysex") {
                pind.sysex = value
            } else {
                console.log("# FirmataDriver._setup_code: unknown key",
                    "\n  key", key,
                    "\n  value", value
                )
            }
        }
    }

    if ((pind.pin === null) && (initd && (initd.pin !== undefined))) {
        pind.pin = initd.pin
    }

    if (pind.sysex !== null) {
        if (pind.extension === null) {
            console.log("# FirmataDriver._setup_code: 'extension' was not specified",
                "\n  code", code,
                "\n  code_value", code_value
            )
        }
        if (pind.pin === null) {
            pind.pin = 0
        }
        if (pind.sysex === 0) {
            pind.sysex = self.sysex++
        }

        pind.identity = "pin=" + pind.pin + ",mode=" + pind.mode + ",extension=" + pind.extension
        self.pindd[code] = pind
    } else if (pind.pin !== null) {
        pind.identity = "pin=" + pind.pin + ",mode=" + pind.mode
        self.pindd[code] = pind
    } else {
        console.log("# FirmataDriver._setup_code: 'pin' or 'mode=sysex-*' was not specified",
            "\n  code", code,
            "\n  code_value", code_value
        )
        return
    }
}

/**
 *  See {@link Driver#identity Driver.identity}
 */
FirmataDriver.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["machine_id"] = machine_id
        identityd["driver"] = self.driver
        if (self.tty) {
            identityd["tty"] = self.tty
        }
        if (self.pindd) {
            var codes = Object.keys(self.pindd)
            codes.sort()

            for (var ci in codes) {
                var code = codes[ci];
                var pind = self.pindd[code];
                identityd[code] = pind.identity
            }
        }

        _.thing_id(identityd);
        
        self.__identityd = identityd;
    }

    return self.__identityd;
}

/**
 *  Setup pins
 */
FirmataDriver.prototype._setup_pind = function(pind) {
    var self = this;

    if ((pind.mode == "output") || (pind.mode == "digital-output")) {
        self._setup_digital_output(pind)
    } else if ((pind.mode == "pwm") || (pind.mode == "analog-output")) {
        self._setup_analog_output(pind)
    } else if ((pind.mode == "input") || (pind.mode == "digital-input")) {
        self._setup_digital_input(pind)
    } else if ((pind.mode == "analog") || (pind.mode == "analog-input")) {
        self._setup_analog_input(pind)
    } else if (pind.mode == "sysex-input-float") {
        self._setup_sysex_input_float(pind)
    } else if (pind.mode == "sysex-input-int8") {
        self._setup_sysex_input_int8(pind)
    } else if (pind.mode == "sysex-input-int16") {
        self._setup_sysex_input_int16(pind)
    } else if (pind.mode == "sysex-input-int32") {
        self._setup_sysex_input_int32(pind)
    } else if (pind.mode == "sysex-output-float") {
        self._setup_output_float(pind)
    } else if (pind.mode == "sysex-output-int8") {
        self._setup_sysex_output_int8(pind)
    } else if (pind.mode == "sysex-output-int16") {
        self._setup_sysex_output_int16(pind)
    } else if (pind.mode == "sysex-output-int32") {
        self._setup_sysex_output_int32(pind)
    } else {
        console.log("# FirmataDriver.push: programming error", pind)
    }
}

FirmataDriver.prototype._setup_digital_output = function(pind) {
    var self = this;
    self.queue.add({
        run: function(queue, qitem) {
            if ((pind.pin < 0) || (pind.pin >= self.board.pins.length)) {
                throw new Error("invalid " + pind.mode + " pin (out of range)")
            }
            var bpd = self.board.pins[pind.pin];
            if (bpd.supportedModes.indexOf(self.board.MODES.OUTPUT) == -1) {
                throw new Error("invalid digital-output pin (mode not supported)")
            }

            pind.initialized = true;
            self.board.pinMode(pind.pin, self.board.MODES.OUTPUT);
            queue.finished(qitem);
        }
    })
}

FirmataDriver.prototype._setup_digital_input = function(pind) {
    var self = this;
    self.queue.add({
        run: function(queue, qitem) {
            if ((pind.pin < 0) || (pind.pin >= self.board.pins.length)) {
                throw new Error("invalid " + pind.mode + " pin (out of range)")
            }
            var bpd = self.board.pins[pind.pin];
            if (bpd.supportedModes.indexOf(self.board.MODES.INPUT) == -1) {
                throw new Error("invalid digital-input pin (mode not supported)")
            }

            pind.initialized = true;
            self.board.pinMode(pind.pin, self.board.MODES.INPUT);
            self.board.digitalRead(pind.pin, function(value) {
                var driverd = {}
                driverd[pind.code] = value ? true : false;
                self.pulled(driverd)
            })

            queue.finished(qitem);
        }
    })
}

FirmataDriver.prototype._setup_analog_output = function(pind) {
    var self = this;
    self.queue.add({
        run: function(queue, qitem) {
            if ((pind.pin < 0) || (pind.pin >= self.board.pins.length)) {
                throw new Error("invalid " + pind.mode + " pin (out of range)")
            }
            var bpd = self.board.pins[pind.pin];
            if (bpd.supportedModes.indexOf(self.board.MODES.PWM) == -1) {
                throw new Error("invalid analog-output pin (mode not supported)")
            }

            pind.initialized = true;
            self.board.pinMode(pind.pin, self.board.MODES.PWM);
            queue.finished(qitem);
        }
    })
}

FirmataDriver.prototype._setup_analog_input = function(pind) {
    var self = this;
    self.queue.add({
        run: function(queue, qitem) {
            if ((pind.pin < 0) || (pind.pin >= self.board.analogPins.length)) {
                throw new Error("invalid " + pind.mode + " pin (out of range)")
            }

            var bpd = self.board.pins[self.board.analogPins[pind.pin]];
            if (bpd.supportedModes.indexOf(self.board.MODES.ANALOG) == -1) {
                throw new Error("invalid analog-input pin (mode not supported)")
            }

            pind.initialized = true;
            self.board.pinMode(pind.pin, self.board.MODES.ANALOG);
            self.board.analogRead(pind.pin, function(value) {
                var driverd = {}
                driverd[pind.code] = value / 1024.0
                self.pulled(driverd)
            })

            queue.finished(qitem);
        }
    })
}

FirmataDriver.prototype._setup_sysex_input_float = function(pind) {
    var self = this;
    self.queue.add({
        run: function(queue, qitem) {
            if ((pind.pin < 0) || (pind.pin >= 64)) {
                throw new Error("invalid " + pind.mode + " pin (out of range)")
            }

            pind.initialized = true;
            firmata.SYSEX_RESPONSE[pind.sysex] = function(board) {
                var driverd = {}
                driverd[pind.code] = unpack_floats(board)
                self.pulled(driverd)
            }

            self.board.sendString(pind.extension);
            self.board.sendString("sysex=" + pind.sysex)
            self.board.sendString("pin=" + pind.pin)
            self.board.sendString("")

            queue.finished(qitem);
        }
    })
}

FirmataDriver.prototype._setup_sysex_input_int8 = function(pind) {
}

FirmataDriver.prototype._setup_sysex_input_int16 = function(pind) {
    var self = this;
    self.queue.add({
        run: function(queue, qitem) {
            if ((pind.pin < 0) || (pind.pin >= 64)) {
                throw new Error("invalid " + pind.mode + " pin (out of range)")
            }

            pind.initialized = true;
            firmata.SYSEX_RESPONSE[pind.sysex] = function(board) {
                var driverd = {}
                driverd[pind.code] = unpack_int16s(board)
                self.pulled(driverd)
            }

            self.board.sendString(pind.extension);
            self.board.sendString("sysex=" + pind.sysex)
            self.board.sendString("pin=" + pind.pin)
            self.board.sendString("")

            queue.finished(qitem);
        }
    })
}

FirmataDriver.prototype._setup_sysex_input_int32 = function(pind) {
}

FirmataDriver.prototype._setup_sysex_output_float = function(pind) {
}

FirmataDriver.prototype._setup_sysex_output_int8 = function(pind) {
    var self = this;
    self.queue.add({
        run: function(queue, qitem) {
            if ((pind.pin < 0) || (pind.pin >= 64)) {
                throw new Error("invalid " + pind.mode + " pin (out of range)")
            }

            pind.initialized = true;

            self.board.sendString(pind.extension);
            self.board.sendString("sysex=" + pind.sysex)
            self.board.sendString("pin=" + pind.pin)
            self.board.sendString("")

            queue.finished(qitem);
        }
    })
}

FirmataDriver.prototype._setup_sysex_output_int16 = function(pind) {
}

FirmataDriver.prototype._setup_sysex_output_int32 = function(pind) {
}

/**
 *  See {@link Driver#setup Driver.setup}
 */
FirmataDriver.prototype.setup = function(paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    /* get values from settings */
    if (paramd.thing) {
        var iot = require('../iotdb').iot()
        // var code = _.identifier_to_camel_case(paramd.thing.code)
        var code = paramd.thing.code

        if (paramd.initd.pin === undefined) {
            var key = "firmata/" + code + "/pin"
            var value = iot.cfg_get(key)
            if (value !== undefined) {
                paramd.initd.pin = parseInt(value)
            }
        }

        if (paramd.initd.tty === undefined) {
            var key = "firmata/" + code + "/tty"
            var value = iot.cfg_get(key)
            if (value !== undefined) {
                paramd.initd.tty = value
            } else {
                var key = "firmata/tty"
                var value = iot.cfg_get(key)
                if (value !== undefined) {
                    paramd.initd.tty = value
                }
            }
        }
    }

    self._init(paramd.initd)


    if (!self.tty) {
        console.log("# FirmataDriver.setup: self.tty not set - can't do anything")
        return
    }

    self.board = boardd[self.tty]
    if (self.board === undefined) {
        console.log("- FirmataDriver.setup: create board",
            "\n  tty", self.tty
        )

        self.board = new firmata.Board(self.tty, function(error) {
            if (error) {
                console.log("# FirmataDriver.setup/board: couldn't connect to board",
                    "\n  tty", self.tty,
                    "\n  error", error
                )
                self.board.iotdb_ready = false
                return;
            }

        })

        self.board.iotdb_queue = new FIFOQueue("FirmataDriver:" + self.tty);
        if (!self.board.iotdb_ready) {
            self.board.iotdb_queue.pause()
        }

        self.board.on('ready', function() {
            self.board.iotdb_ready = true
            self.board.iotdb_sysex = 10;
            self.board.iotdb_queue.resume()
        })


        boardd[self.tty] = self.board
    }

    self.queue = self.board.iotdb_queue

    /*
     *  Initialize all the pins
     */
    for (var code in self.pindd) {
        self._setup_pind(self.pindd[code]);
    }

    return self;
}

/**
 *  See {@link Driver#reachable}
 */
FirmataDriver.prototype.reachable = function() {
    var self = this

    if (!self.board) {
        return false
    }

    if (!self.board.iotdb_ready) {
        return false
    }

    if (!self.queue) {
        return false
    }

    return true
}

/*
 *  See {@link Driver#discover Driver.discover}
 */
FirmataDriver.prototype.discover = function(paramd, discover_callback) {
    var self = this;

    if (paramd.initd === undefined) {
        console.log("# FirmataDriver.discover: no nearby discovery (not a problem)")
        return
    }

    if (machine_id === undefined) {
        machine_id = self.cfg_get("machine_id", null)
        if (!machine_id) {
            console.log("############################## ")
            console.log("# FirmataDriver.discover: setup is not complete - cannot run")
            console.log("# Please enter the following command first")
            console.log("#")
            console.log("#   iotdb-control machine-id")
            console.log("#")
            console.log("############################## ")

            return
        }
    } else if (!machine_id) {
        return
    }


    discover_callback(new FirmataDriver())
}

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
FirmataDriver.prototype.push = function(paramd) {
    var self = this;

    if (!self.reachable()) {
        if (!self.__reachable_message) {
            console.log("# FirmataDriver.push", "firmata not reachable just yet")
            self.__reachable_message = true
        }

        return
    } else {
        self.__reachable_message = undefined
    }

    console.log("- FirmataDriver.push", 
        "\n  driverd", paramd.driverd, 
        "\n  initd", paramd.initd)

    for (var key in paramd.driverd) {
        var value = paramd.driverd[key]
        var pind = self.pindd[key]
        if (!pind) {
            console.log("# FirmataDriver.push: no 'pind' for key", key)
            continue;
        }

        console.log("- FirmataDriver.push", 
            "\n  key", key,
            "\n  value", value,
            "\n  pind", pind
            // "\n  attribute", attribute
        )

        if ((pind.mode == "output") || (pind.mode == "digital-output")) {
            self.queue.add({
                run: function(queue, qitem) {
                    self.board.digitalWrite(pind.pin, value ? self.board.HIGH : self.board.LOW);
                    queue.finished(qitem);
                }
            })
        } else if ((pind.mode == "pwm") || (pind.mode == "analog-output")) {
            self.queue.add({
                run: function(queue, qitem) {
                    value = Math.min(Math.max(0, value), 1)
                    value = value * 255.0
                    value = Math.round(value)
                    self.board.analogWrite(pind.pin, value)
                    queue.finished(qitem);
                }
            })
        } else if (pind.mode == "sysex-output-int8") {
            self.queue.add({
                run: function(queue, qitem) {
                    var outb = new Buffer([
                        START_SYSEX,
                        pind.sysex,
                        value[0] & 0xFF,
                        value[1] & 0xFF,
                        value[2] & 0xFF,
                        END_SYSEX
                    ])

                    self.board.sp.write(outb)

                    queue.finished(qitem);
                }
            })
        }
    }

    return self;
}

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
FirmataDriver.prototype.pull = function() {
    var self = this;

    /*
    console.log("- FirmataDriver.pull", 
        "\n  initd", paramd.initd
    )
    */

    return self;
}


/*
 *  API
 */
exports.Driver = FirmataDriver
