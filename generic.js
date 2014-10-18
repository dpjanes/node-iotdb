/*
 *  generic.js
 *
 *  David Janes
 *  IOTDB
 *  2014-07-13
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

var _ = require("./helpers")
var attribute = require("./attribute")
var model = require("./model")
var model_maker = require("./model_maker")
var libs = require("./libs/libs")

/* -- */
var FakeAttribute = function(key) {
    this.key = key
};

FakeAttribute.prototype.get_code = function() {
    return this.key
};

FakeAttribute.prototype.validate = function() {
};


/* --- constants --- */
var VERBOSE = true;

/**
 *  Convenience function to make a ModelMaker instance
 *
 *  @param {string|undefined} _name
 *  see {@ThinkMaker} constructor
 *
 *  @return
 *  a new ModelMaker instance 
 */
exports.make_generic = function() {
    return (new model_maker.ModelMaker()).make_generic()
};

/**
 *  This is the Model for a special kind of Thing 
 *  that does not have attributes. Operations 'just
 *  happen' on the underlying data
 *
 *  @constructor
 */
var Generic = function() {
};

Generic.prototype = new model.Model

/**
 *  Get a value from the state. 
 *
 *  @param find_key
 *  The key (see {@link Thing#_find Model.find} for possibilites)
 *
 *  @return {*}
 *  The current value in the state
 */
Generic.prototype.get = function(find_key) {
    var self = this;

    /*
     *  Find the attribute to actually update
     */
    var d = self.stated
    var subkeys = find_key.split('/')
    var lastkey = subkeys[subkeys.length - 1]

    for (var ski = 0; ski < subkeys.length - 1; ski++) {
        var subkey = subkeys[ski];
        var subd = d[subkey]
        if (subd === undefined) {
            return undefined
        } else if (_.isObject(subd)) {
            d = subd
        } else {
            return undefined
        }
    }

    return d[lastkey]
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
Generic.prototype.set = function(find_key, new_value) {
    var self = this;

    /*
     *  Find the attribute to actually update
     */
    var d = self.stated
    var subkeys = find_key.split('/')
    var lastkey = subkeys[subkeys.length - 1]

    for (var ski = 0; ski < subkeys.length - 1; ski++) {
        var subkey = subkeys[ski];
        var subd = d[subkey]
        if (subd === undefined) {
            subd = {}
            d[subkey] = subd
        } else if (_.isObject(subd)) {
        } else {
            console.log("# Generic.set: key incompatible with current state", find_key)
            return
        }

        d = subd
    }

    /*
     *  Update it if it's changed
     */
    if (d[lastkey] == new_value) {
        return
    }

    d[lastkey] = new_value

    /*
     *  Track changes
     */
    var attribute = new FakeAttribute(find_key)

    self._do_validate(attribute, false)
    self._do_notify(attribute, false);
    self._do_push(attribute, false);

    return self;
};

/**
 *  Set many values at once, using a dictionary
 *  AGAIN, this needs a lot of work, especially for
 *  nested things
 */
Generic.prototype.update = function(updated, paramd) {
    var self = this;

    paramd = _.defaults(paramd, {
        notify: true
    })

    self.start(paramd)
    for (var key in updated) {
        self.set(key, updated[key]);
    }
    self.end();
};


/**
 */
Generic.prototype.start = function(paramd) {
    var self = this;

    paramd = _.defaults(paramd, {
        notify: false,  
        validate: true,   
        push: true
    })

    self.stacks.push({
        paramd: paramd,
        attribute_notifyd: {},
        attribute_validated: {},
        attribute_pushd: {},
    })

    return self;
};

/**
 */
Generic.prototype.end = function() {
    var self = this;

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
Generic.prototype.on = function(find_key, callback) {
    var self = this;

    var callbacks = self.callbacksd[find_key];
    if (callbacks === undefined) {
        callbacks = []
        self.callbacksd[find_key] = callbacks 
    }

    callbacks.push(callback);

    return self
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
Generic.prototype.on_change = function(callback) {
    var self = this;

    require('./iotdb').iot().on("thing_changed", function(thing) {
        if (thing == self) {
            callback(self, [])
        }
    })

    return self;
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
Generic.prototype._do_validates = function(attributed) {
    var self = this;

    if (self.__validator) {
        var paramd = {
            codes: _.keys(attributed),          // attributes that have changed
            thingd: _.deepCopy(self.stated),    // the current state of the model
            changed: {},                        // update these values (passed back)
            libs : libs.libs
        }
        self.__validator(paramd);

        self.start({ notify: false, validate: false, push: true });
        for (var code in paramd.changed) {
            self.set(code, paramd.changed[code]);
        }
        self.end();
    }
};

Generic.prototype._do_notifies = function(attributed) {
    var self = this;
    var any = false

    for (var attribute_key in attributed) {
        any = true

        var attribute = attributed[attribute_key];
        var attribute_value = self.get(attribute_key);

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
        require('./iotdb').iot().emit("thing_changed", self)
    }
};

/*
 *  API
 */
exports.Generic = Generic;
