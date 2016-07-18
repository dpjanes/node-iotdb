/*
 *  TestMatch.js
 *
 *  David Janes
 *  IOTDB
 *  2016-07-18
 */

const model = require('./test.json');
model["iot:model-id"] = "test-match";

exports.binding = {
    bridge: require('../TestBridge').Bridge,
    model: model,
    matchd: {
        "iot:thing-number": 101,
    },
};
