/*
 *  drivers/twitter.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-04-03
 *
 *  Connect to RSS / Atom twitters
 */

"use strict"

var node_twitter = require('twitter')
var iotdb = require("iotdb")
var node_uuid = require('node-uuid')
var unirest = require('unirest')
var stream = require('stream')

var _ = require("../helpers");
var driver = require('../driver')
var FIFOQueue = require('../queue').FIFOQueue

var queue = new FIFOQueue("TwitterDriver");
var twitter_oauthd = null

// for this driver only
var InternalTwitterMessage = iotdb.make_model('InternalTwitterMessage')
    .driver_identity(":twitter")
    .attribute(
        iotdb.make_string(":message.text")
            .code("text")
        )
    .attribute(
        iotdb.make_datetime(":message.created")
            .code("created")
        )
    .attribute(
        iotdb.make_iri(":userid")
    )
    .attribute(
        iotdb.make_iri(":id")
    )
    .driver_setup(function(paramd) {
    })
    .driver_in(function(paramd) {
        if (paramd.driverd !== undefined) {
            paramd.thingd.text = paramd.driverd.text
            paramd.thingd.created = paramd.driverd.created_at
            paramd.thingd.id = "https://twitter.com/" + paramd.driverd.user.screen_name + 
                "/status/"  + paramd.driverd.id_str
            paramd.thingd.userid = "https://twitter.com/" + paramd.driverd.user.screen_name
        }
    })
    .driver_out(function(paramd) {
        if (paramd.thingd.text !== undefined) {
            paramd.driverd.text = paramd.thingd.text 
        }
    })
    .make()
    ;


/**
 */
var TwitterDriver = function(paramd) {
    var self = this;
    driver.Driver.prototype.driver_construct.call(self);

    paramd = _.defaults(paramd, {
        verbose: false,
        driver_iri: "iot-driver:twitter"
    })

    self.verbose = paramd.verbose
    self.driver_iri = _.expand(paramd.driver_iri)

    self.search = null

    self.twitter = null
    self.reload = 120
    self.seend = {}

    self.reloadTimerId = null;

    self._init(paramd.initd)

    return self;
}

TwitterDriver.prototype = new driver.Driver;

/* --- class methods --- */

/**
 *  Return helper functions
 */
TwitterDriver.prototype.register = function(iot) {
    var self = this;

    driver.Driver.prototype.register.call(self, iot);

    twitter_oauthd = iot.cfg_get_oauthd("https://api.twitter.com")
    if (!twitter_oauthd) {
        console.log("# TwitterDriver._setup_poll: no OAuth information found for Twitter")
        console.log("  This means we cannot access twitter until this is set up")
        console.log("")
        console.log("  Please follow the instructions at:")
        console.log("  https://iotdb.org/docs/node/twitter")
        console.log("")
        return
    }
    
    if (iot.initd.twitter) {
        self.iot = iot
        iot.twitter = {
            search: function() {
                self._helper_search(iot, arguments[0], arguments[1])
            },
            send: function() {
                self._helper_send(iot, arguments[0], arguments[1])
            }
        }
    }
}

TwitterDriver.prototype._helper_search = function(iot, search, callback) {
    var self = this;

    console.log("+ TwitterDriver._helper_search")

    var tag = "twitter-search-" + node_uuid.v4()

    iot.on_thing_with_tag(tag, function(iot, thing) {
        thing.on_change(function(thing, attributes) {
            callback(thing)
        })
    })
    iot.discover({
        model: InternalTwitterMessage,
        driver_iri: ":twitter",
        initd : {
            __internal: true,
            search: search,
            tag: tag
        }
    })
}

TwitterDriver.prototype._helper_send = function(iot, text) {
    var self = this;

    console.log("+ TwitterDriver._helper_send")

    if (self.send_twitter) {
        self.send_twitter.update({
            text: text
        })
    } else {
        var make = false
        if (!self.send_tag) {
            self.send_tag = "twitter-send-" + node_uuid.v4()
            make = true
        }

        iot.on_thing_with_tag(self.send_tag, function(iot, thing) {
            self.send_twitter = thing
            self.send_twitter.update({
                text: text
            })
        })

        if (make) {
            iot.discover({
                model: InternalTwitterMessage,
                driver_iri: ":twitter",
                initd : {
                    __internal: true,
                    tag: self.send_tag
                }
            })
        }
    }
}


/**
 *  Pull information from initd
 *
 *  @protected
 */
TwitterDriver.prototype._init = function(initd) {
    var self = this;

    if (!initd) {
        return
    }
    if (initd.search) {
        self.search = initd.search
    }
}

/**
 *  See {@link Driver#identity Driver.identity}
 */
TwitterDriver.prototype.identity = function(kitchen_sink) {
    var self = this;

    if (self.__identityd === undefined) {
        var identityd = {}
        identityd["driver_iri"] = self.driver_iri

        if (self.search) {
            identityd["search"] = self.search
        }

        _.thing_id(identityd);
        
        self.__identityd = identityd;
    }

    return self.__identityd;
}

/**
 *  See {@link Driver#setup Driver.setup}
 */
TwitterDriver.prototype.setup = function(paramd) {
    var self = this;

    /* chain */
    driver.Driver.prototype.setup.call(self, paramd);

    self._init(paramd.initd)
    self._setup_poll()

    return self;
}

/*
 *  See {@link Driver#discover Driver.discover}
 */
TwitterDriver.prototype.discover = function(paramd, discover_callback) {
    discover_callback(new TwitterDriver());
}

/**
 *  Just send the data via PUT to the API
 *  <p>
 *  See {@link Driver#push Driver.push}
 */
TwitterDriver.prototype.push = function(paramd) {
    var self = this;

    console.log("- TwitterDriver.push", paramd.driverd)
    self.twitter
        .updateStatus(paramd.driverd.text, function() {
            console.log("- TwitterDriver.push", "tweet sent")
        });

    return self;
}

/**
 *  Request the Driver's current state. It should
 *  be called back with <code>callback</code>
 *  <p>
 *  See {@link Driver#pull Driver.pull}
 */
TwitterDriver.prototype.pull = function() {
    var self = this;

    console.log("- TwitterDriver.pull", "inherently, this does nothing!")

    return self;
}

/* --- Internals --- */
TwitterDriver.prototype._setup_poll = function() {
    var self = this;

    if (self.twitter) {
        return
    }
    if (!twitter_oauthd) {
        return
    }

    self.twitter = new node_twitter(twitter_oauthd)

    if (self.search){
        console.log("- TwitterDriver._setup_poll", "\n  search:", self.search)
        self.twitter.stream('filter', {track: self.search}, function(stream) {
            stream.on('error', function(e) {
                console.log("- TwitterDriver._setup_poll", "\n  error:", e)
            })
            stream.on('data', function(s) {
                self.pulled(s)
            });
        })
    }

}


/* --- API --- */
exports.Driver = TwitterDriver

