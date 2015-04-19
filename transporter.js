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

var path = require('path');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'transporter',
});

/* --- callbacks --- */
/**
 *  @param {string|null} id
 *  The ID of the Record. 
 *  When null, no more records will be called back.
 *
 *  @callback Transport~list_callback
 */

/**
 *  @param {string} id
 *  The ID of the Record
 *
 *  @param {string} band
 *  The Band of the Record
 *
 *  @param {dictionary|undefined|null} value
 *  The Record.
 *  If undefined, the Record is likely 
 *  available (but you'll have to go get it)
 *  If null, the Record does not exist
 *
 *  @callback Transport~get_callback
 */

/* --- constructor --- */
/**
 *  Create a Transporter.
 *
 *  @param {dictionary|undefined} initd
 *  Optional parameters
 *
 *  @param {ThingArray} things
 *  Things to monitor
 *
 *  @constructor
 */
var Transport = function (initd) {
    var self = this;
};

Transport.prototype._isTransport = true;

/* --- methods --- */
/**
 *  List all the IDs associated with this Transport.
 *  <p>
 *  The callback is called one at a time with the
 *  ID of the Record, 
 *  then null when there are no further values.
 *
 *  @param {dictionary|undefined} paramd
 *  Optional parameters
 *
 *  @param {Transport~list_callback} callback
 */
Transport.prototype.list = function (paramd, callback) {
    var self = this;

    throw new Error("Not Implemented");
};

Transport.prototype._validate_list = function (paramd, callback) {
    if (!_.is.Dictionary(paramd)) {
        throw new Error("list: 'paramd' must be a Dictionary");
    }
    if (!_.isFunction(callback)) {
        throw new Error("list: 'callback' must be a Function");
    }
};

/**
 *  Trigger the callback whenever a Record is added.
 *
 *  @param {dictionary|undefined} paramd
 *  Optional parameters
 *
 *  @param {Transport~list_callback} callback
 */
Transport.prototype.added = function (paramd, callback) {
    var self = this;

    throw new Error("Not Implemented");
};

Transport.prototype._validate_added = function (paramd, callback) {
    if (!_.is.Dictionary(paramd)) {
        throw new Error("added: 'paramd' must be a Dictionary");
    }
    if (!_.isFunction(callback)) {
        throw new Error("added: 'callback' must be a Function");
    }
};

/**
 *  Tell about an ID (particularly: does it exists, what bands are available)
 *
 *  @param {string} id
 *  The ID of the Record
 *
 *  @param {Transport~about_callback} callback
 */
Transport.prototype.about = function (paramd, callback) {
    var self = this;

    throw new Error("Not Implemented");
};

Transport.prototype._validate_about = function (paramd, callback) {
    if (!_.is.Dictionary(paramd)) {
        throw new Error("about: 'paramd' must be a Dictionary");
    }
    if (!_.isFunction(callback)) {
        throw new Error("about: 'callback' must be a Function");
    }
    if (!paramd.id) {
        throw new Error("about: 'paramd.id' is required");
    }
    if (!_.isString(paramd.id)) {
        throw new Error("about: 'paramd.id' must be a string");
    }
};

/**
 *  Get an Record and callback.
 *
 *  @param {string} id
 *  The ID of the Record
 *
 *  @param {string|null} band
 *  The band of the Record. If null, a dictionary
 *  should be returned with information
 *  about the item. In particular, key "bands"
 *  with an array of available bands
 *
 *  @param {Transport~get_callback} callback
 */
Transport.prototype.get = function (paramd, callback) {
    var self = this;

    throw new Error("Not Implemented");
};

Transport.prototype._validate_get = function (paramd, callback) {
    if (!_.is.Dictionary(paramd)) {
        throw new Error("get: 'paramd' must be a Dictionary");
    }
    if (!_.isFunction(callback)) {
        throw new Error("get: 'callback' must be a Function");
    }
    if (!paramd.id) {
        throw new Error("get: 'paramd.id' is required");
    }
    if (!_.isString(paramd.id)) {
        throw new Error("get: 'paramd.id' must be a string");
    }
    if (!paramd.band) {
        throw new Error("get: 'paramd.band' is required");
    }
    if (!_.isString(paramd.band)) {
        throw new Error("get: 'paramd.band' must be a string");
    }
};

/**
 *  Update a record
 *  <p>
 *  NOT FINISHED
 *
 *  @param {string} id
 *  The ID of the Record
 *
 *  @param {string} band
 *  The Band of the Record
 *
 *  @param {dictionary|undefined|null} value
 *  The Record.
 *
 *  @param {Transport~get_callback|undefined} callback
 *  Optional callback
 */
Transport.prototype.update = function (paramd, callback) {
    var self = this;

    throw new Error("Not Implemented");
};

Transport.prototype._validate_update = function (paramd, callback) {
    if (!_.is.Dictionary(paramd)) {
        throw new Error("update: 'paramd' must be a Dictionary");
    }
    if (!_.isFunction(callback) && (callback !== undefined)) {
        throw new Error("update: 'callback' must be a Function or undefined");
    }
    if (!paramd.id) {
        throw new Error("update: 'paramd.id' is required");
    }
    if (!_.isString(paramd.id)) {
        throw new Error("update: 'paramd.id' must be a string");
    }
    if (!paramd.band) {
        throw new Error("update: 'paramd.band' is required");
    }
    if (!_.isString(paramd.band)) {
        throw new Error("update: 'paramd.band' must be a string");
    }
};

/**
 *  Callback when a Record is updated.
 *  <p>
 *  Probably could be made a hell of a lot more efficient
 *
 *  @param {string|undefined} id
 *  Optional. The ID of the Record
 *
 *  @param {string|undefined} band
 *  Optional. The Band of the Record (note band can't
 *  be defined with the id)
 *
 *  @param {Transport~get_callback} callback
 */
Transport.prototype.updated = function (paramd, callback) {
    var self = this;

    throw new Error("Not Implemented");
};

Transport.prototype._validate_updated = function (paramd, callback) {
    if (!_.is.Dictionary(paramd)) {
        throw new Error("updated: 'paramd' must be a Dictionary");
    }
    if (!_.isFunction(callback)) {
        throw new Error("updated: 'callback' must be a Function");
    }
    _.defaults(paramd, {
        id: null,
        band: null,
    });
};

/**
 *  Remove a Record. Note that all bands are removed
 *  <p>
 *  NOT IMPLEMENTED for IOTDB
 *
 *  @param {string} id
 *  The ID of the Record
 */
Transport.prototype.remove = function (paramd, callback) {
    var self = this;

    throw new Error("Not Implemented");
};

Transport.prototype._validate_remove = function (paramd, callback) {
    if (!_.is.Dictionary(paramd)) {
        throw new Error("remove: 'paramd' must be a Dictionary");
    }
    if (!_.isFunction(callback) && (callback !== undefined)) {
        throw new Error("remove: 'callback' must be a Function or undefined");
    }
    if (!paramd.id) {
        throw new Error("remove: 'paramd.id' is required");
    }
};

/* --- helper functions --- */
/**
 *  Transport changes to Things to the transp
 */
var transport = function (transport, things, paramd) {
    paramd = _.defaults(paramd, {
        verbose: false,
        send: true,
        receive: true,
        meta: true,
        istate: true,
        ostate: true,
        model: true,
    });

    things.on_thing(function (thing) {
        var thing_id = thing.thing_id();
        var meta = thing.meta();

        if (paramd.model && paramd.send) {
            transport.update(thing_id, "model", _.ld.compact(thing.jsonld()));
        }

        /*
         *  This is necessary because 'updated' has no requirement
         *  to actual send data
         */
        var _monitor = function (monitor_band, get, callback) {
            var _receive = function (id, band, d) {
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

            transport.updated(thing_id, monitor_band, function (id, band, d) {
                if (d === undefined) {
                    transport.get(thing_id, band, _receive);
                } else {
                    _receive(id, band, d);
                }
            });
        };

        if (paramd.meta) {
            if (paramd.send) {
                thing.on("meta", function () {
                    transport.update(thing_id, "meta", _.ld.compact(meta.updates()));
                });
            }
            if (paramd.receive) {
                _monitor("meta", true, function (d) {
                    meta.update(d, {
                        set_timestamp: true,
                        check_timestamp: true,
                    });
                });
            }
        }

        if (paramd.ostate) {
            if (paramd.send) {
                transport.update(thing_id, "ostate", thing.state({
                    ostate: true,
                    istate: false
                }));
                thing.on("ostate", function () {
                    ostate_transporter.update(thing_id, "ostate", thing.state({
                        ostate: true,
                        istate: false
                    }));
                });
            }
            if (paramd.receive) {
                _monitor("ostate", false, function (d) {
                    thing.update(d, {
                        notify: true,
                        push: true,
                    });
                });
            }
        }

        if (paramd.istate) {
            if (paramd.send) {
                transport.update(thing_id, "istate", thing.state({
                    istate: true,
                    ostate: false
                }));
                thing.on("istate", function () {
                    transport.update(thing_id, "istate", thing.state({
                        istate: true,
                        ostate: false
                    }));
                });
            }
            if (paramd.receive) {
                _monitor("istate", false, function (d) {
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
 *  Make one Transport control another.
 *
 *  @param {Transport} master_transport
 *
 *  @param {Transport} slave_transport
 *
 *  @param {dictionary|undefined} paramd
 *  Optional parameters
 *
 *  @param {boolean} paramd.verbose
 *
 *  @param {array} paramd.bands
 *  List of bands to operate on. By default
 *  <code>"istate", "ostate", "model", "meta"</code>.
 *  All subsequent paramd.* values, except as noted:
 *  if <code>true</code> will become this value.
 *
 *  @param {boolean|array} paramd.update
 *  Whenever primary_transport is updated on these bands,
 *  update secondary_transport.
 *  By default <code>true</code>.
 *
 *  @param {boolean|array} paramd.updated
 *  Whenever secondary_transport is updated on these bands,
 *  update primary_transport.
 *  By default <code>false</code>.
 *  If you set this to true (or some bands), the secondary_transport
 *  can update the primary_transport which is
 *  awesome and scary, just like your mom.
 *
 *  @param {boolean|array} paramd.get
 *  Calls to get on secondary_transport (on the bands) will
 *  actually be calling the primary_transport
 *  By default <code>true</code>.
 *
 *  @param {boolean} paramd.list
 *  Calls to list on secondary_transport will
 *  actually be calling the primary_transport. Note
 *  that this is band independent!
 *  By default <code>true</code>.
 *
 *  @param {boolean|array} paramd.copy
 *  All Records from the primary_transport (on
 *  the bands) will be copied to the 
 *  secondary_transport.
 *  By default <code>true</code>.
 */
var bind = function (primary_transport, secondary_transport, paramd) {
    var bi;
    var band;

    paramd = _.defaults(paramd, {
        verbose: false,
        bands: ["istate", "ostate", "model", "meta"],
        update: true,
        updated: false, // N.B.
        get: true,
        list: true,
        added: true,
        copy: true,
    });

    var _go = function (value) {
        return value !== [];
    };

    var _normalize = function (key) {
        var value = paramd[key];
        if (value === true) {
            paramd[key] = paramd.bands;
        } else if (value === false) {
            paramd[key] = [];
        } else if (!_.isArray(value)) {
            throw new Error("bad value - expected Array or Boolean: key=" + key + " value=" + value);
        }
    };

    _normalize("update");
    _normalize("updated");
    _normalize("get");
    _normalize("list");
    _normalize("added");
    _normalize("copy");

    // updates to the src update the dst
    if (_go(paramd.update)) {
        primary_transport.updated(function (ud) {
            if (paramd.update.indexOf(ud.band) === -1) {
                return;
            }

            secondary_transport.update(ud);
        })
    }

    // updates to the dst update the src
    if (_go(paramd.updated)) {
        secondary_transport.updated(function (ud) {
            if (paramd.updated.indexOf(ud.band) === -1) {
                return;
            }

            primary_transport.update(ud);
        })
    }

    // …
    if (_go(paramd.get)) {
        var _secondary_get = secondary_transport.get;
        secondary_transport.get = function (gd, callback) {
            if (paramd.get.indexOf(gd.band) === -1) {
                return _secondary_get(gd, callback);
            } else {
                return primary_transport.get(get_id, get_band, get_callback);
            }
        };
    }

    // …
    if (_go(paramd.list)) {
        secondary_transport.list = function (list_paramd, callback) {
            primary_transport.list(list_paramd, callback);
        }
    }

    // …
    if (_go(paramd.added)) {
        secondary_transport.added = function (added_paramd, callback) {
            primary_transport.added(added_paramd, callback);
        }
    }

    // copy
    if (_go(paramd.copy)) {
        var copy_callback = function (d) {
            if ((d.value === undefined) || (d.value === null)) {
                return;
            }

            secondary_transport.update(d);
        };

        var list_callback = function (d) {
            if (d === null) {
                return;
            }

            for (bi in paramd.copy) {
                var copy_band = paramd.copy[bi];

                primary_transport.get({
                    id: d.id,
                    band: copy_band,
                }, copy_callback);
            }
        };

        primary_transport.added(list_callback);
        primary_transport.list(list_callback);
    }
};

/**
 */
var channel = function (paramd, id, band) {
    var self = this;

    paramd = _.defaults(paramd, {
        prefix: "",
        encode: function (s) {
            return s
        },
    });

    var channel = paramd.prefix;
    if (id) {
        channel = path.join(channel, paramd.encode(id));

        if (band && !paramd.flat_band) {
            channel = path.join(channel, paramd.encode(band));
        }
    }

    return channel;
};

/**
 */
var unchannel = function (paramd, path) {
    paramd = _.defaults(paramd, {
        prefix: "",
        decode: function (s) {
            return s
        },
        dot_id: false,
        dot_band: false,
    });

    var subpath = path.substring(paramd.prefix.length);
    subpath = subpath.replace(/^\/*/, '');
    subpath = subpath.replace(/\/*$/, '');
    subpath = subpath.replace(/\/+/g, '/');

    var parts = subpath.split("/");
    parts = _.map(parts, paramd.decode);

    if (parts.length === 1) {
        var id = parts[0];
        if (!paramd.dot_id && id.match(/^[.]/)) {
            return;
        }

        if (paramd.flat_band) {
            return [id, paramd.flat_band, ];
        } else {
            return [id, ".", ];
        }
    } else if (parts.length === 2) {
        var id = parts[0];
        if (!paramd.dot_id && id.match(/^[.]/)) {
            return;
        }

        var band = parts[1];
        if (!paramd.dot_band, band.match(/^[.]/)) {
            return;
        }

        if (paramd.flat_band) {
            return [id, paramd.flat_band, ];
        } else {
            return [id, band, ];
        }
    } else {
        return;
    }
}

/**
 *  API
 */
exports.Transport = Transport;
exports.transport = transport;
exports.bind = bind;
exports.unchannel = unchannel;
exports.channel = channel;
