/*
 *  TestRenamed.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-06
 */

var iotdb = require("iotdb");

exports.binding = {
    model_code: "TestRenamed",
    bridge: require('../TestBridge').Bridge,
    model: require('./Test.json'),
};
