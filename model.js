/*
 *  model.js
 *
 *  David Janes
 *  IOTDB
 *  2013-12-22
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

var assert = require("assert");

var _ = require("./helpers");
var attribute = require("./attribute");
var meta_thing = require("./meta");
var model_maker = require("./model_maker");
var libs = require("./libs/libs");

/* --- constants --- */
var VERBOSE = true;
var iot_name = _.expand("iot:name");

var EVENT_THINGS_CHANGED = "things_changed";
var EVENT_THING_CHANGED = "thing_changed";
var EVENT_META_CHANGED = "meta_changed";

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotdb',
    module: 'model',
});

/**
 *  Convenience function to make a ModelMaker instance
 *
 *  @param {string|undefined} _name
 *  see {@ThinkMaker} constructor
 *
 *  @return
 *  a new ModelMaker instance 
 */
var make_model = function(_name) {
    return new model_maker.ModelMaker(_name);
};

/**
 *  Base class for all Things. It does nothing
 *  except exist.
 *  See {@link Thing~subclass} for arguments
 *  passed to subclasses.
 *
 *  <p>
 *  Generally you'll be using something you've made
 *  with {@link make_model} and won't use this at all
 *
 *  @classdesc
 *  Things are objects that represent real world things
 *  such as 
 *  a {@link http://www.belkin.com/us/Products/home-automation/c/wemo-home-automation/ Belkin WeMo},
 *  a {@link http://www.meethue.com/en-CA Philips Hue},
 *  an Arduino project,
 *  a heartrate monitor,
 *  a scale,
 *  and so forth.
 *  Things can be actuators (that is, they make things
 *  happen in the physical world) or sensors (they give readings).
 *
 *  <p>
 *  The purpose of the IOTDB is to provide a robust abstract description
 *  of all things, so that you can say "turn off the stove" or "set the lights
 *  to sunset red" <b>and the right thing will happen</b>, no matter what 
 *  the actual language, protocols or peculiarities of the real device.
 *
 *  <p>
 *  {@link Thing Things} are bound to real devices using {@link Driver Drivers}. 
 *  Things are designed in such a way that they can run on many modern devices,
 *  such as PCs, Raspberry Pis, iPhones, Androids, etc.. There is a JavaScript requirement,
 *  but just the "pure" language and not any libraries such as Node-JS.
 *
 *  <p>
 *  Here's an example of turning on a Thing and setting the color to red, using the
 *  Thing's native keys
 *
 *  <pre>
thing
    .set('rgb', '#FF0000')
 *  </pre>
 *
 *  <p>
 *  Here's an example of doing the same thing semantically
 *  <pre>
thing
    .set('iot-attribute:on', true)
    .set('iot-attribute:color', '#FF0000')
 *  </pre>
 *
 *  <hr />
 *
 *  @constructor
 */
var Model = function() {
};

/**
 *  @callback Thing~subclass
 *
 *  All subclasses of Thing take a single
 *  argument <code>paramd</code>. All the 
 *  options are optional.
 *
 *  @param {dictionary} paramd
 *  @param {undefined|Driver} paramd.driver_instance
 *  The driver for this thing.
 *
 *  @param {*} paramd.api_*
 *  All keys that start with api_* have their
 *  values copies
 *
 *  @return {function}
 *  A function that creates a subclass of Model.
 **/

/**
 *  Make a new instance of this Thing, using
 *  the current object as an exemplar.
 *  <p>
 *  See {@link Thing~subclass}
 *
 *  <p>
 *  <i>This uses a very Javascript hack,
 *  see source code for {@link ModelMaker#make ModelMaker.make}
 *  </i></p>
 */
Model.prototype.make = function(paramd) {
    return new this.__make(paramd);
};

/**
 */
Model.prototype.isa = function(classf) {
    return classf === this.__make;
};

/**
 */
Model.prototype.get_code = function() {
    return this.code;
};

/**
 */
Model.prototype.state = function() {
    var self = this;
    var d = _.deepCopy(self.stated);

    for (var subkey in self.subthingd) {
        var subthing = self.subthingd[subkey];
        var subd = subthing.state();
        d[subkey] = subd;
    }

    return d;
};

/**
 */
Model.prototype.attributes = function() {
    var self = this;
    return self.__attributes;
};

/**
 *  Return a duplicate of this Thing that 
 *  cannot be manipulated further. This is
 *  used (e.g.) when you need to keep a particular
 *  sensor state
 */
Model.prototype.freeze = function() {
    var self = this;

    var new_thing = self.make();
    new_thing.stated = _.deepCopy(self.stated);

    new_thing.update = function() {
        throw new Error("You cannot call 'update' on a frozen Thing");
    };
    new_thing.set = function() {
        throw new Error("You cannot call 'set' on a frozen Thing");
    };

    return new_thing;
};

/**
 *  Tags are for locally identitfying devices
 */
Model.prototype.has_tag = function(tag) {
    return _.ld_contains(this.initd, "tag", tag);

    /*
    var self = this;

    if (_.isArray(self.initd.tag) && (self.initd.tag.indexOf(tag) > -1)) {
        return true
    } else if (self.initd.tag === tag) {
        return true
    } else {
        return false
    }
    */
};

/**
 *  Return the JSON-LD version of this thing
 *
 *  @param {dictionary} paramd
 *  @param {boolean} paramd.include_state
 *  Include the current state
 *
 *  @param {url} paramd.base
 *  Base URL, otherwise 'file:///<code>/'
 *
 *  @return {dictionary}
 *  JSON-LD dictionary
 */
Model.prototype.jsonld = function(paramd) {
    var self = this;
    var key;
    var value;

    paramd = ( paramd !== undefined ) ? paramd : {};
    paramd.base = ( paramd.base !== undefined) ? paramd.base : ( "file:///" + self.code + "");
    paramd.context = ( paramd.context !== undefined) ? paramd.context : true;
    paramd.path = ( paramd.path !== undefined) ? paramd.path : "";

    var rd = {};

    if (paramd.context) {
        var cd = {};
        cd["@base"] = paramd.base ;
        if (paramd.include_state) {
            cd["@vocab"] = paramd.base + "#";
        }
        rd["@context"] = cd;
        rd["@id"] = "";
    } else if (paramd.path.length > 0) {
        rd["@id"] = "#" + paramd.path.replace(/\/+$/, '');
    } else {
        rd["@id"] = "#";
    }

    rd["@type"] = _.expand("iot:Model");

    if (self.name) {
        rd[_.expand("iot:name")] = self.name;
    }
    if (self.description) {
        rd[_.expand("iot:description")] = self.description;
    }
    if (self.help) {
        rd[_.expand("iot:help")] = self.help;
    }

    if (paramd.include_state) {
        for (key in self.stated) {
            rd[key] = self.stated[key];
        }
    }

    // attributes
    var ads = [];
    for (var ax in self.__attributes) {
        var attribute = self.__attributes[ax];
        var ad = {};
        // ad[_.expand('iot:name')] = attribute.get_code()
        ads.push(ad);
        
        for (key in attribute) {
            if (!attribute.hasOwnProperty(key)) {
                continue;
            }

            value = attribute[key];
            if (value === undefined) {
                continue;
            }

            if (_.isFunction(value)) {
                if (key === "__validator") {
                    value = value.toString();
                } else {
                    continue;
                }
            }
            
            if (key === "__validator") {
                ad[_.expand("iot-iotdb:iotdb-attribute-validator")] = value;
            } else if (key === "@id") {
                ad[key] = "#" + paramd.path + value.substring(1);
            } else {
                ad[key] = value;
            }
        }
    }
    if (ads.length > 0) {
        rd[_.expand("iot:attribute")] = ads;
    }

    // initializers
    var ids = [];
    for (var ix in self.initializers) {
        var initializer = self.initializers[ix];
        var ind = {};
        var any = false;
        
        for (key in initializer) {
            if (!initializer.hasOwnProperty(key)) {
                continue;
            }

            value = initializer[key];
            if (value === undefined) {
                continue;
            } else if (_.isFunction(value)) {
                continue;
            }
            
            if (key === "__validator") {
            } else if (key === "@id") {
            } else {
                ind[key] = value;
                any = true;
            }
        }

        if (any) {
            ids.push(ind);
        }
    }
    if (ids.length > 0) {
        rd[_.expand("iot:initializer")] = ids;
    }

    // subthings
    var sds = [];
    for (var skey in self.subthingd) {
        var subthing = self.subthingd[skey];
        var subpath = paramd.path + skey + "/";
        sds.push(subthing.jsonld({
            context: false,
            path: subpath
        }));
    }
    if (sds.length > 0) {
        rd[_.expand("iot:model")] = sds;
    }

    if (self.__validator) {
        rd[_.expand("iot-iotdb:model-validator")] = self.__validator.toString();
    }
    if (self.__driver_setup) {
        rd[_.expand("iot-iotdb:model-driver-setup")] = self.__driver_setup.toString();
    }
    if (self.__driver_in) {
        rd[_.expand("iot-iotdb:model-driver-in")] = self.__driver_in.toString();
    }
    if (self.__driver_out) {
        rd[_.expand("iot-iotdb:model-driver-out")] = self.__driver_out.toString();
    }

    if (self.driver_identityd) {
        var dids = [];
        for (key in self.driver_identityd) {
            dids.push(key);
            dids.push(self.driver_identityd[key]);
        }
        if (dids.length) {
            rd[_.expand("iot-iotdb:driver-identity")] = dids;
        }
    }
    
    return rd;
};

/**
 *  Get a value from the state. Note that there's
 *  no guarentee that the state reflects what your
 *  thing actually is right now
 *
 *  @param find_key
 *  The key (see {@link Thing#_find Model.find} for possibilites)
 *
 *  @return {*}
 *  The current value in the state
 */
Model.prototype.get = function(find_key) {
    var self = this;

    var subthing = self.subthingd[find_key];
    if (subthing !== undefined) {
        return subthing;
    }

    var rd = self._find(find_key);
    if (rd === undefined) {
        // console.log("# Model.get: attribute '" + find_key + "' not found XXX");
        logger.error({
            method: "get",
            find_key: find_key
        }, "cannot find Attribute using find_key");
        return undefined;
    }

    if (rd.attribute) {
        var attribute_key = rd.attribute.get_code();
        var attribute_value = rd.thing.stated[attribute_key];

        return attribute_value;
    } else if (rd.subthing) {
        return rd.subthing;
    } else {
        logger.error({
            method: "get",
            find_key: find_key,
            cause: "Node-IOTDB programming error"
        }, "impossible state");

        throw new Error("Model.get: internal error: impossible state for: " + find_key);
    }
};

/**
 *  Set a value. 
 *
 *  <p>
 *  If this is not in a {@link Thing#start Model.start}/{@link Thing#end Model.end}
 *  bracketing, no callback notifications will be sent,
 *  the new_value will be validated against the attribute
 *  immediately, and the thing will be validated immediately.
 *
 *  <p>
 *  If it is inside, all those checks will be deferred
 *  until the {@link Thing#end Model.end} occurs.
 *
 *  @param find_key
 *  The key (see {@link Thing#_find Model.find} for possibilites)
 *
 *  @param {*} new_value
 *  The value to set
 */
Model.prototype.set = function(find_key, new_value) {
    var self = this;

    var rd = self._find(find_key);
    if (rd === undefined) {
        // console.log("# Model.set: ERROR: attribute '%s' not found for model '%s'", find_key, self.code);
        logger.error({
            method: "set",
            find_key: find_key,
            model_code: self.code,
            cause: "likely programmer error"
        }, "attribute not found");
        return self;
    }

    if (rd.attribute) {
        var attribute_key = rd.attribute.get_code();
        var attribute_value = rd.thing.stated[attribute_key];

        if (attribute_value === new_value) {
            return self;
        }

        rd.thing.ostated[attribute_key] = rd.thing.stated[attribute_key];
        rd.thing.stated[attribute_key] = new_value;

        rd.thing._do_validate(rd.attribute, false);
        rd.thing._do_notify(rd.attribute, false);
        rd.thing._do_push(rd.attribute, false);

        return self;
    } else if (rd.subthing) {
        logger.error({
            method: "set",
            find_key: find_key,
            cause: "caller error / not implemented"
        }, "cannot set a subthing");

        throw new Error("# Model.get: error: cannot set a subthing: " + find_key);
    } else {
        logger.error({
            method: "set",
            find_key: find_key,
            cause: "Node-IOTDB programming error"
        }, "impossible state");

        throw new Error("# Model.get: internal error: impossible state for: " + find_key);
    }
};

/**
 *  Set many values at once, using a dictionary
 *
 *  <p>
 *  NOT FINISHED - NEEDS TO DEAL WITH SUBTHINGS
 */
Model.prototype.update = function(updated, paramd) {
    var self = this;

    paramd = _.defaults(paramd, {
        notify: true
    });

    self.start(paramd);
    for (var key in updated) {
        self.set(key, updated[key]);
    }
    self.end();
};


/**
 *  Start a transaction. No validation, notification
 *  or pushes caused by {@link Thing#set Model.set} will
 *  happen until {@link Thing#end Model.end} is called.
 *
 *  <p>
 *  Transactions may be nested but nothing is "inherited"
 *  from the wrapping transaction.
 *  </p>
 *
 *  @param {boolean} paramd.notify
 *  If true, send notifications. Typically when a user
 *  sets their own values they leave this off.
 *  Default false
 *
 *  @param {boolean} paramd.validate
 *  If true, validate changes. This may be false when 
 *  the driver is setting values.
 *  Default false
 *
 *  @param {boolean} paramd.push
 *  If true, push changes to the driver.
 *  Default true
 *
 *  @return
 *  this
 */
Model.prototype.start = function(paramd) {
    var self = this;

    paramd = _.defaults(paramd, {
        notify: false,  
        validate: true,   
        push: true
    });

    self.stacks.push({
        paramd: paramd,
        attribute_notifyd: {},
        attribute_validated: {},
        attribute_pushd: {},
    });

    for (var subthing_key in self.subthingd) {
        var subthing = self.subthingd[subthing_key];
        subthing.start(paramd);
    }

    return self;
};

/**
 *  End a transaction. 
 *  Pending pushes/notification/validation
 *  caused by {@link Thing#set Model.set}
 *  will be done. 
 *  There must be a corresponding {@link Thing#start Model.start}
 *  called earlier. (<code>paramd</code> is set in the start).
 *
 *  <p>
 *  Transactions may be nested but nothing is "inherited"
 *  from the wrapping transaction.
 *  </p>
 *
 *  <p>
 *  Order of updating
 *  </p>
 *  <ol>
 *  <li>{@link Thing#end Model.end} is called on all submodels
 *  <li>{@link Thing#_do_validates validation} (if paramd.validate is true)
 *  <li>{@link Thing#_do_notifies notification} (if paramd.notify is true)
 *  <li>{@link Thing#_do_pushes driver} push (if paramd.push is true)
 *  </ol>
 *
 *  @return
 *  this
 */
Model.prototype.end = function() {
    var self = this;

    for (var subthing_key in self.subthingd) {
        var subthing = self.subthingd[subthing_key];
        subthing.end();
    }

    var topd = self.stacks.pop();

    if (topd.paramd.validate) {
        self._do_validates(topd.attribute_validated);
    }

    if (topd.paramd.notify) {
        self._do_notifies(topd.attribute_notifyd);
    }

    if (topd.paramd.push) {
        self._do_pushes(topd.attribute_pushd);
    }

    return self;
};

/*
 *  Return the parent of this thing
 *
 *  @return
 *  this
 */
Model.prototype.parent = function() {
    return this.__parent_thing;
};

/**
 *  Register for a callback. See {@link Thing#end Model.end} 
 *  for when callbacks will occcur. Note that
 *  also that we try to supress callbacks
 *  if the value hasn't changed, though there's
 *  no guarentee we're 100% successful at this.
 *
 *  @param find_key
 *  The key to monitor for changes
 *  (see {@link Thing#_find Model.find} for possibilites)
 *
 *  @param {function} callback
 *  The callback function, which takes 
 *  ( thing, attribute, new_value ) as arguments
 *
 *  @return
 *  this
 */
Model.prototype.on = function(find_key, callback) {
    var self = this;
    var attribute_key = null;
    var callbacks = null;

    if (find_key === null) {
        attribute_key = null;

        callbacks = self.callbacksd[attribute_key];
        if (callbacks === undefined) {
            self.callbacksd[attribute_key] = callbacks = [];
        }

        callbacks.push(callback);

        return self;
    }

    var rd = self._find(find_key);
    if (rd === undefined) {
        // console.log("# Model.on: error: attribute '" + find_key + "' not found");
        logger.error({
            method: "on",
            find_key: find_key
        }, "find_key not found");
        return;
    }

    if (rd.subthing) {
        // console.log("# Model.on: subscribing to a subthing not implemented yet");
        logger.error({
            method: "on",
            find_key: find_key
        }, "subscribing to a subthing not implemented yet");
    } else if (rd.attribute) {
        attribute_key = rd.attribute.get_code();

        callbacks = rd.thing.callbacksd[attribute_key];
        if (callbacks === undefined) {
            rd.thing.callbacksd[attribute_key] = callbacks = [];
        }

        callbacks.push(callback);

        return self;
    } else {
        logger.error({
            method: "on",
            find_key: find_key
        }, "impossible state");

        throw new Error("Model.on: error: impossible state: " + find_key);
    }
};

/**
 *  Register for changes to this Thing. The change callback
 *  is triggered at the of a update transaction.
 *
 *  @param {function} callback
 *  The callback function, which takes 
 *  ( thing, changed_attributes ) as arguments
 *
 */
Model.prototype.on_change = function(callback) {
    var self = this;

    assert.ok(_.isFunction(callback));

    self.__emitter.on(EVENT_THING_CHANGED, function(thing) {
        callback(self, []);
    });

    return self;
};

/**
 *  On metadata change (including reachablity)
 */
Model.prototype.on_meta = function(callback) {
    var self = this;

    assert.ok(_.isFunction(callback));

    self.__emitter.on(EVENT_META_CHANGED, function(thing) {
        callback(self, []);
    });

    return self;
};

/*
 *  Send a notification that the metadata has been changed
 */
Model.prototype.meta_changed = function() {
    this.__emitter.emit(EVENT_META_CHANGED, true);
};

/* --- driver section --- */
/**
 *  Return true iff this {@link Thing} works with the {@link Driver driver}.
 *
 *  <p>
 *  If __driver_supported is called, this function is called.
 *  Otherwise the {@link Thing#driver_identityd} is 
 *  checked. This array is set up by the function
 *  {@link Thing#driver_identity}. It may be called multiple
 *  times when setting up the thing so
 *  that multiple drivers are supported.
 *  The function {@link helpers#identity_overlap} is used for matching.
 *
 *  <p>
 *  Typically this function is called by {@link IOTDB#discover_nearby}
 *  or similar.
 *
 *  <p>
 *  XXX consider removing the matchup function
 *
 *  @param {Driver} driver
 *  The {@link Driver}
 *
 *  @param {boolean} otherwise
 *  If this driver does not have an identity, return this value.
 *  This lets us force binding of abstract models to arbitrary drivers
 *
 *  @return {boolean}
 *  true iff this Thing works for the driver
 */
Model.prototype.is_driver_supported = function(driver, otherwise) {
    var self = this;

    if (self.__driver_supported) {
        return self.__driver_supported(driver);
    } else if (self.driver_identityd !== null) {
        var match_identityd = driver.identity(true);
        /*
        console.log("---")
        console.log("HERE:THING (superd)", match_identityd)
        console.log("HERE:DRIVER (subd)", self.driver_identityd);
         */
        if (_.identity_overlap(match_identityd, self.driver_identityd)) {
            return true;
        }

        return false;
    } else if (otherwise === undefined) {
        // console.log("# Model.is_driver_supported: the Model has no identity?")
        return false;
    } else {
        return otherwise;
    }
};

/**
 *  Return the identity of the Driver this thing
 *  is bound to. See {@link Driver#identity Driver.identity)
 *
 *  @param {boolean} kitchen_sink
 *  If true, the {@link Driver} may add additional parameters to
 *  help find and appropriate driver. However, thing_id
 *  must be computed beforehand.
 *
 *  @return {dictionary}
 *  An idenitity object
 */
Model.prototype.identity = function(kitchen_sink) {
    if (this.driver_instance) {
        return this.driver_instance.identity(kitchen_sink);
    } else {
        // console.log("# Model.identity: returning null because this.driver_instance=null");
        logger.error({
            method: "identity",
        }, "returning null self.driver_instance=null");
        
        return null;
    }
};

Model.prototype.thing_id = function() {
    var id = this.identity();
    if (id) {
        return id.thing_id;
    } else {
        // console.log("# Model.thing_id: returning null because this.identity=null");
        logger.error({
            method: "thing_id",
        }, "returning null self.identity=null");
        
        return null;
    }
};

/**
 *  Call a thing to fill in <code>paramd.initd</code>
 *  <p>
 *  Usually called from 
 *  {@link IOT#discover_nearby IOT.discover_nearby} or 
 *  {@link IOT#discover_thing IOT.discover_thing}.
 *
 *  @param {dictionary} paramd
 *  See {@link Driver#setup Driver.setup}
 */
Model.prototype.driver_setup = function(paramd) {
    var self = this;

    if (self.__driver_setup) {
        self.__driver_setup(paramd);
    }
};

/**
 *  Translates between the Driver's state and what the Thing's. 
 *  Typically this will be done with a function 
 *  defined by {@link ModelMaker#driver_in ModelMaker.driver_in}.
 *
 *  <p>
 *  This is usually called by {@link Thing#pull Model.pull} and sometimes
 *  by {@link Driver Drivers} in their setup phase.
 *
 *  @param {dictionary} paramd
 *  See {@link ModelMaker~driver_out_function ModelMaker.driver_out_function}
 */
Model.prototype.driver_in = function(paramd) {
    var self = this;

    if (self.__driver_in) {
        self.__driver_in(paramd);
    } else {
        for (var key in paramd.driverd) {
            paramd.thingd[key] = paramd.driverd[key];
        }
    }
};

/**
 *  Translate between the Thing's state to the Driver's.
 *  <p>
 *  If a {@link ModelMaker~driver_in_function ModelMaker.driver_in_function}
 *  function was defined, it will do the work. Otherwise
 *  we just copy the state as-is.
 *  <p>
 *  This is usually called by {@link Thing#_do_pushes Model._do_pushes}
 *
 *  @param {dictionary} paramd
 *  See {@link ModelMaker~driver_in_function ModelMaker.driver_in_function}
 */
Model.prototype.driver_out = function(paramd) {
    var self = this;

    if (self.__driver_out) {
        self.__driver_out(paramd);
    } else {
        for (var key in paramd.thingd) {
            var value = paramd.thingd[key];
            if ((value !== null) && (value !== undefined)) {
                paramd.driverd[key] = value;
            }
        }
    }
};

/**
 *  Request values from the driver be brought to this object.
 *  Note that it's basically asynchronous
 *
 *  @return {this}
 */
Model.prototype.pull = function() {
    var self = this;

    if (!self.driver_instance) {
        // console.log("# Model.pull: no self.driver_instance?");
        logger.error({
            method: "pull",
            cause: "this Model has been disconnected from it's driver, or was never connected"
        }, "no driver_instance?");
        return;
    }
    
    /* --- allow model opportunity to send a message */
    var paramd = {
        is_pull: true,
        initd: self.initd,
        driverd: {},
        thingd: {},
        libs : libs.libs,
        scratchd: self.__scratchd
    };
    self.driver_out(paramd);

    if (!_.isEmpty(paramd.driverd)) {
        self.driver_instance.push(paramd);
    }

    /* --- tell driver to pull --- */
    self.driver_instance.pull();

    return self;
};

/* --- internals --- */
Model.prototype._do_driver = function(attribute) {
};

/**
 *  Push this updated attribute's value
 *  across the driver to make the change
 *  actually happen.
 *
 *  If there is a no stack or immediate is
 *  <b>true</b>, do the push immediately.
 *  Otherwise we store for later bulk push.
 *
 *  @param attributes
 *  The {@link Attribute} to push
 *
 *  @param immediate
 *  If true, push immediately no matter what
 *
 *  @protected
 */
Model.prototype._do_push = function(attribute, immediate) {
    var self = this;

    if ((self.stacks.length === 0) || immediate) {
        var attributed = {};
        attributed[attribute.get_code()] = attribute;

        self._do_pushes(attributed);

        // if this is happening now, propagate upwards
        if (self.__parent_thing) {
            self.__parent_thing._do_pushes({});
        }
    } else {
        var topd = self.stacks[self.stacks.length - 1];
        topd.attribute_pushd[attribute.get_code()] = attribute;
    }
};

Model.prototype._deep_copy_state = function(thing, use_push_keys) {
    var self = this;
    var d = {};

    for (var key in thing.stated) {
        if (use_push_keys && (thing.__push_keys.indexOf(key) === -1)) {
            continue;
        }
        d[key] = thing.stated[key];
    }

    for (var subthing_key in thing.subthingd) {
        var subthing = thing.subthingd[subthing_key];
        if (subthing.__parent_thing === undefined) {
            continue;
        }

        d[subthing_key] = self._deep_copy_state(subthing, use_push_keys);
    }

    return d;
};


/**
 *  Send values from this object to the driver
 *
 *  @return
 *  self
 *
 *  @protected
 */
Model.prototype._do_pushes = function(attributed) {
    var self = this;

    // this magically does things to '__deep_copy_state'
    self.__push_keys = _.keys(attributed);

    if (!self.driver_instance) {
        // if there's a parent and this has no driver, it will handle it
        if (self.__parent_thing !== undefined) {
            // console.log("HERE:C", self.__push_keys)
            return;
        }

        // console.log("- Model.push: no self.driver_instance?");
        logger.error({
            method: "_do_pushes",
            cause: "this Model has been disconnected from it's driver, or was never connected"
        }, "no driver_instance?");
        return;
    }

    var paramd = {
        initd: self.initd,
        driverd: {},
        thingd: self._deep_copy_state(self, true),
        libs : libs.libs,
        scratchd: self.__scratchd
    };
    self.driver_out(paramd);

    if (!_.isEmpty(paramd.driverd)) {
        self.driver_instance.push(paramd);
    }

    return self;
};

/**
 *  Validate this updated attribute. 
 *
 *  If there is a no stack or immediate is
 *  <b>true</b>, do the validation immediately.
 *  Otherwise we store for later bulk validation.
 *
 *  @param attributes
 *  The {@link Attribute} to validate
 *
 *  @param immediate
 *  If true, validate immediately no matter what
 *
 *  @protected
 */
Model.prototype._do_validate = function(attribute, immediate) {
    var self = this;

    if ((self.stacks.length === 0) || immediate) {
        var attributed = {};
        attributed[attribute.get_code()] = attribute;

        self._do_validates(attributed);
    } else {
        var topd = self.stacks[self.stacks.length - 1];
        topd.attribute_validated[attribute.get_code()] = attribute;
    }
};

/**
 *  Validate all the attributes, then this thing as a whole
 *
 *  @param attributed
 *  A dictionary of {@link Attribute}, which are all the changed 
 *  attributes.
 *
 *  @protected
 */
Model.prototype._do_validates = function(attributed) {
    var self = this;
    var paramd;
    var code;

    for (code in attributed) {
        var attribute = attributed[code];
        code = attribute.get_code();

        paramd = {
            value: self.stated[code],
            code: code,
            libs : libs.libs
        };

        attribute.validate(paramd);

        if (paramd.value !== undefined) {
            self.stated[code] = paramd.value;
        } else {
            self.stated[code] = self.ostated[code];
        }
    }

    if (self.__validator) {
        paramd = {
            codes: _.keys(attributed),          // attributes that have changed
            thingd: _.deepCopy(self.stated),    // the current state of the model
            changed: {},                        // update these values (passed back)
            libs : libs.libs
        };
        self.__validator(paramd);

        self.start({ notify: false, validate: false, push: true });
        for (code in paramd.changed) {
            self.set(code, paramd.changed[code]);
        }
        self.end();
    }
};

/**
 *  Notify listened of this updated attribute. 
 *
 *  If there is a no stack or immediate is
 *  <b>true</b>, do the notifications immediately.
 *  Otherwise we store for later bulk notifications.
 *
 *  @param attributes
 *  The {@link Attribute} that triggers notifications
 *
 *  @param immediate
 *  If true, notify immediately no matter what
 *
 *  @protected
 */
Model.prototype._do_notify = function(attribute, immediate) {
    var self = this;

    if ((self.stacks.length === 0) || immediate) {
        var attributed = {};
        attributed[attribute.get_code()] = attribute;

        self._do_notifies(attributed);
    } else {
        var topd = self.stacks[self.stacks.length - 1];
        topd.attribute_notifyd[attribute.get_code()] = attribute;
    }
};

/**
 *  Do a whole bunch of notifies, one for each
 *  attribute in attributes. Events are bubbled
 *  to parents (clearly identifying the original source!)
 *
 *  <p>
 *  XXX - There's likely a billion things wrong with this code
 *
 *  @param attributed
 *  A dictionary of {@link Attribute}, which are all the changed 
 *  attributes.
 *
 *  @protected
 */
Model.prototype._do_notifies = function(attributed) {
    var self = this;
    var any = false;

    for (var attribute_key in attributed) {
        any = true;

        var attribute = attributed[attribute_key];
        var attribute_value = self.stated[attribute_key];

        var thing = self;
        while (thing) {
            var callbacks = thing.callbacksd[attribute_key];
            if (callbacks === undefined) {
                callbacks = thing.callbacksd[null];
            }
            if (callbacks) {
                callbacks.map(function(callback) {
                    callback(self, attribute, attribute_value);
                });
            }

            thing = thing.__parent_thing;
        }
    }

    // levels of hackdom here
    if (any) {
        this.__emitter.emit(EVENT_THING_CHANGED, self);
    }
};

/**
 *  Find the {@link Attribute attribute} or {@link Thing subthing}
 *  of a key in this.
 *
 *  <p>
 *  If find_key is a string, it is split by the "/"
 *  character.
 *  All the except the last parts are traversed
 *  through submodels. The last part is then checked
 *  by the following rules:
 *
 *  <ul>
 *  <li>
 *  If it starts with an ":", we convert it to
 *  <code>iot-attribute:part</code> 
 *  and research
 *  for a <code>iot:purpose</code> with that value.
 *
 *  <li>
 *  If it contains a ":" (past the first character), 
 *  we {@link helpers:expand expand} and research
 *  for a <code>iot:purpose</code> with that value.
 *
 *  <li>
 *  Otherwise we look for an attribute with that key. 
 *  If it's found, we return a dictionary with 
 *  <code>{ attribute: attribute, thing: containing-thing }</code>
 *
 *  <li>
 *  Otherwise we look for an subthing with that key. 
 *  If it's found, we return a dictionary with 
 *  <code>{ subthing: subthing, thing: containing-thing }</code>
 *  </ul>
 *
 *  @param {string|Attribute} find_key
 *  The key to find, noting the rules above
 *
 *  @return {undefined|dictionary}
 *  If nothing is found, undefined.
 *  Otherwise a dictionary describing whether
 *  it was an {@link Attribute} or {@link Thing}
 *  found and what the contaning {@link Thing} is.
 *
 *  @protected
 */
Model.prototype._find = function(find_key) {
    var self = this;
    var d;
    var subthing;
    var attribute;

    if (typeof find_key === "string") {
        var subkeys = find_key.split("/");
        var thing = self;

        for (var ski = 0; ski < subkeys.length - 1; ski++) {
            var subkey = subkeys[ski];
            subthing = thing.subthingd[subkey];
            if (subthing === undefined) {
                return undefined;
            } else if (!subthing.__is_thing) {
                return undefined;
            } else {
                thing = subthing;
            }
        }

        var last_key = subkeys[subkeys.length - 1];
        if (last_key.substring(0, 1) === ":") {
            d = {};
            d[_.expand("iot:purpose")] = _.expand("iot-attribute:" + last_key.substring(1));

            return thing._find(d);
        } else if (last_key.indexOf(":") > -1) {
            d = {};
            d[_.expand("iot:purpose")] = _.expand(last_key);

            return thing._find(d);
        }

        attribute = thing.attributed[last_key];
        if (attribute !== undefined) {
            return {
                thing: thing,
                attribute: attribute
            };
        }

        subthing = thing.subthingd[last_key];
        if (subthing !== undefined) {
            return {
                thing: thing,
                subthing: subthing
            };
        }

        return undefined;
    } else {
        for (var ai = 0; ai < self.__attributes.length; ai++) {
            attribute = self.__attributes[ai];

            var all = true;
            for (var match_key in find_key) {
                /*
                 *  Somewhat hacky - we always ignore '@'
                 *  values and we ignore iot:name (because 
                 *  iotdb.make_attribute always adds a name)
                 */
                if (match_key === iot_name) {
                    continue;
                } else if (match_key.indexOf('@') === 0) {
                    continue;
                }

                var match_value = find_key[match_key];
                var attribute_value = attribute[match_key];
                if (_.isArray(attribute_value)) {
                    if (_.isArray(match_value)) {
                        for (var mvi in match_value) {
                            var mv = match_value[mvi];
                            if (attribute_value.indexOf(mv) === -1) {
                                all = false;
                                break;
                            }
                        }
                    } else {
                        if (attribute_value.indexOf(match_value) === -1) {
                            all = false;
                            break;
                        }
                    }
                } else if (match_value !== attribute_value) {
                    all = false;
                    break;
                }
            }

            if (all) {
                return {
                    thing: self,
                    attribute: attribute
                };
            }
        }

        return undefined;
    }

};

/**
 *  Return the IOTDB Thing IRI for this Thing
 */
Model.prototype.thing_iri = function() {
    return require('./iotdb').iot().thing_iri(this);
};

/**
 *  Return the IOTDB Place IRI for this Model. The Thing must
 *  be loaded into the graph.
 *
 *  @param {string|Thing} self
 *  If a string, it is expected to be the 'thing_id' for 
 *  the Model.
 *
 *  @return {string|null}
 *  The IRI on IOTDB for the Place assigned to this Model. If there
 *  is no Place assigned or the Thing is not loaded, null is returned
 */
Model.prototype.place_iri = function() {
    var self = this;

    var iot = require('./iotdb').iot();
    if (!iot) {
        logger.fatal({
            method: "place_iri",
            cause: "this is almost impossible"
        }, "no iot() object");

        return null;
    }

    var thing_iri = self.thing_iri();
    if (!thing_iri) {
        return null;
    }

    return iot.gm.get_object(thing_iri, 'iot:place');
};

/**
 *  Return the IOTDB Model IRI for this Model. The Thing
 *  must have been loaded into the Graph.
 *
 *  @param {string|Thing} self
 *  If a string, it is expected to be the 'thing_id' for 
 *  the Model.
 *
 *  @return {string|null}
 *  The IRI on IOTDB for the Thing's Model.
 *  If the Thing is not loaded, null is returned
 */
Model.prototype.model_iri = function() {
    var self = this;

    var iot = require('./iotdb').iot();
    if (!iot) {
        logger.fatal({
            method: "model_iri",
            cause: "this is almost impossible"
        }, "no iot() object");

        return null;
    }

    var thing_iri = self.thing_iri();
    if (!thing_iri) {
        return null;
    }

    return iot.gm.get_object(thing_iri, 'iot:Model');
};

/**
 *  Return the IOTDB Model IRI for this Thing, based on the 
 *  model_code. Does not depend on the Graph.
 *
 *  @return {string}
 *  The IRI on IOTDB for the Thing's Model.
 */
Model.prototype.model_code_iri = function() {
    var self = this;

    var iot = require('./iotdb').iot();
    if (!iot) {
        logger.fatal({
            method: "model_code_iri",
            cause: "this is almost impossible"
        }, "no iot() object");

        return null;
    }

    return iot.model_code_iri(self.code);
};

/**
 *  Return an object to access and
 *  manipulate the Metadata.
 */
Model.prototype.meta = function() {
    var self = this;

    if (self.__meta_thing === undefined) {
        var iot = require('./iotdb').iot();
        if (!iot) {
            logger.fatal({
                method: "meta",
                cause: "this is almost impossible"
            }, "no iot() object");

            return undefined;
        }

        self.__meta_thing = new meta_thing.Meta(iot, self);
    }

    return self.__meta_thing;
};

/**
 *  Add a tag to this Model. Tags are temporary
 *  labels, they are not persisted to IOTDB 
 *  (or the metadata in general).
 *
 *  @param {string} tag
 */
Model.prototype.tag = function(tag) {
    var self = this;

    assert.ok(_.isString(tag));

    _.ld_add(self.initd, "tag", tag);
};

/**
 */
Model.prototype.reachable = function() {
    var self = this;

    if (!self.driver_instance) {
        return false;
    }

    return self.driver_instance.reachable();
};

/**
 *  Return the metadata of the driver
 */
Model.prototype.driver_meta = function() {
    var self = this;

    if (self.driver_instance) {
        return self.driver_instance.meta();
    } else {
        return {};
    }

};

/*
 *  API
 */
exports.Model = Model;
exports.make_model = make_model;
