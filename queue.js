/*
 *  queue.js
 *
 *  David Janes
 *  IOT.org
 *  2013-12-30
 */

/**
 *  Make a FIFOQueue called 'name'.
 *
 *  @param {string} name
 *  A human friendly name for this queue, 
 *  occassionally printed out
 *
 *  @param {dictionary} paramd
 *  @param {integer} paramd.qn
 *  How many items this queue can be executing
 *  at once. Defaults to 1.
 *
 *  @classdesc
 *  FIFO Queue stuff. This is useful e.g. in {@link Driver Drivers}
 *  when you don't want to be pounding on a device's URL with
 *  multiple requests at the same time.
 *
 *  <hr />
 *
 *  @constructor
 */
FIFOQueue = function(name, paramd) {
    var self = this;

    paramd = ( paramd !== undefined ) ? paramd : {}

    self.name = ( name !== undefined ) ? name : "unnamed-queue";
    self.qitems = []
    self.qurrents = [];
    self.qn = ( paramd.qn !== undefined ) ? paramd.qn : 1;
    self.qid = 0;
    self.paused = false;
}

/**
 *  Add a item to the queue, which will be run
 *  when it's appropriate.
 *
 *  @param {dictionary} qitem
 *  @param {function} qitem.run
 *  This is the function that will be called to do 
 *  the work of this queue item. Note that qitem.run
 *  MUST call {@link FIFOQueue#finished finished} with itself
 *  when it's finished to free up the slot in the queue.
 *
 *  @param {*} qitem.id
 *  If this is not undefined, we will replace
 *  the first item currently in the queue
 *  with the same id.
 */
FIFOQueue.prototype.add = function(qitem) {
    var self = this;

    qitem.__qid = self.qid++;

    var found = false;

    if (qitem.id !== undefined) {
        for (var qi in self.qitems) {
            if (self.qitems[qi].id === qitem.id) {
                self.qitems.splice(qi, 1, qitem);
                found = true;
                break;
            }
        }
    }

    if (!found) {
        self.qitems.push(qitem);
    }

    if (!self.paused) {
        self.run();
    }

    if (self.qitems.length > 10) {
        console.log("FIFOQueue(" + self.name + ").add: warning - long queue", self.qitems.length)
    }
}

/**
 *  
 */
FIFOQueue.prototype.pause = function() {
    var self = this;
    self.paused = true
}

/**
 *  
 */
FIFOQueue.prototype.resume = function() {
    var self = this;

    if (self.paused) {
        self.paused = false
        self.run()
    }
}

/**
 *  This function must be called by the qitem when it's
 *  finished doing its work
 *
 *  @param {dictionary} qitem
 *  See {@link FIFOQueue#add add}
 */
FIFOQueue.prototype.finished = function(qitem) {
    var self = this;

    var found = false;
    for (var qi in self.qurrents) {
        if (self.qurrents[qi].__qid === qitem.__qid) {
            self.qurrents.splice(qi, 1);
            found = true;
            break;
        }
    }

    if (!found) {
        console.log("FIFOQueue(" + self.name + ").add: warning - WEIRD state, maybe this qitem is wrong?")
    }

    if (!self.paused) {
        self.run();
    }
}

/**
 *  This function will see if it should run another
 *  qitem. Although it's safe to call, normally you
 *  never need to.
 */
FIFOQueue.prototype.run = function() {
    var self = this;

    if (self.qurrents.length >= self.qn) {
        return;
    }

    if (self.qitems.length == 0) {
        return;
    }

    var qitem = self.qitems[0];
    self.qitems.splice(0, 1);
    self.qurrents.push(qitem);

    qitem.run(self, qitem);
}

/* --- API --- */
exports.FIFOQueue = FIFOQueue
