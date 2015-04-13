/*
 *  transporter.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-03-21
 *
 *  Copyright [2013-2015] [David P. Janes]
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

var _ = require('./helpers');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'transporter',
});

/**
 *  Transport changes to Things to the transp
 */
var transport = function(transport, things, paramd) {
    paramd = _.defaults(paramd, {
        verbose: false,
        send: true,
        receive: true,
        meta: true,
        istate: true,
        ostate: true,
        model: true,
    });

    things.on_thing(function(thing) {
        var thing_id = thing.thing_id();
        var meta = thing.meta();

        if (paramd.model && paramd.send) {
            transport.update(thing_id, "model", _.ld.compact(thing.jsonld()));
        }

        /*
         *  This is necessary because 'updated' has no requirement
         *  to actual send data
         */
        var _monitor = function(monitor_band, get, callback) {
            var _receive = function(id, band, d) {
                if (d === undefined) {
                    /* shouldn't happen */
                    return;
                } else if (d === null) {
                    /* no value */
                    return;
                }

                callback(d);
            }

            if (get) {
                transport.get(thing_id, monitor_band, _receive);
            }

            transport.updated(thing_id, monitor_band, function(id, band, d) {
                if (d === undefined) {
                    transport.get(thing_id, band, _receive);
                } else {
                    _receive(id, band, d);
                }
            });
        };

        if (paramd.meta) {
            if (paramd.send) {
                thing.on("meta", function() {
                    transport.update(thing_id, "meta", _.ld.compact(meta.updates()));
                });
            }
            if (paramd.receive) {
                _monitor("meta", true, function(d) {
                    meta.update(d, {
                        set_timestamp: true,
                        check_timestamp: true,
                    });
                });
            }
        }

        if (paramd.ostate) {
            if (paramd.send) {
                transport.update(thing_id, "ostate", thing.state({ ostate: true, istate: false }));
                thing.on("ostate", function() {
                    ostate_transporter.update(thing_id, "ostate", thing.state({ ostate: true, istate: false }));
                });
            }
            if (paramd.receive) {
                _monitor("ostate", false, function(d) {
                    thing.update(d, {
                        notify: true,
                        push: true,
                    });
                });
            }
        }

        if (paramd.istate) {
            if (paramd.send) {
                transport.update(thing_id, "istate", thing.state({ istate: true, ostate: false }));
                thing.on("istate", function() {
                    transport.update(thing_id, "istate", thing.state({ istate: true, ostate: false }));
                });
            }
            if (paramd.receive) {
                _monitor("istate", false, function(d) {
                    // console.log("ISTATE-IN", thing_id, d);
                    thing.update(d, {
                        notify: false,
                        push: false,
                        validate: true,
                    });
                });
            }
        }
    });

};

/**
 */
var bind = function(master_transport, slave_transport, paramd) {
    paramd = _.defaults(paramd, {
        verbose: false,
        bands: [ "istate", "ostate", "model", "meta" ],
        update: true,
        updated: false, // N.B.
        get: true,
        list: true,
    });

    // updates to the src update the dst
    if (paramd.update) {
        master_transport.updated(function(_id, _band, _value) {
            console.log("HERE:A.1", _id, _band);
            if (paramd.bands.indexOf(_band) === -1) {
                console.log("HERE:A.2", _id, _band);
                return;
            }
            console.log("HERE:A.3", _id, _band);
            slave_transport.update(_id, _band, _value);
        })
    }

    // updates to the src update the dst
    if (paramd.updated) {
        slave_transport.updated(function(_id, _band, _value) {
            if (paramd.bands.indexOf(_band) === -1) {
                return;
            }
            master_transport.update(_id, _band, _value);
        })
    }

    if (paramd.get) {
        slave_transport.get = master_transport.get;
    }

    if (paramd.list) {
        slave_transport.list = master_transport.list;
    }
};

/**
 *  API
 */
exports.transport = transport;
exports.bind = bind;
