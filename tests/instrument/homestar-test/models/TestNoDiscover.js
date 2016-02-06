/*
 *  TestNoDiscover.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-06
 */

var iotdb = require("iotdb");

exports.binding = {
    model_code: "TestNoDiscover",
    discover: false,
    bridge: require('../TestBridge').Bridge,
    model: require('./Test.json'),
};
