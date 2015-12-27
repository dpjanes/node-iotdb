/**
 *  Duplicate 
 */
var d = require('../../attribute')
for (var key in d) {
    exports[key] = d[key];
}

/**
 *  Instrument 
 */
exports.make_null = function (purpose, code, name) {
    return exports.make(purpose, code, name).property("iot:type", "iot:type.null");
};
exports.make_boolean = function (purpose, code, name) {
    return exports.make(purpose, code, name).property("iot:type", "iot:type.boolean");
};
exports.make_integer = function (purpose, code, name) {
    return exports.make(purpose, code, name).property("iot:type", "iot:type.integer");
};
exports.make_number = function (purpose, code, name) {
    return exports.make(purpose, code, name).property("iot:type", "iot:type.number");
};

exports.make_unit = function (purpose, code, name) {
    return exports
        .make(purpose, code, name)
        .property("iot:type", "iot:type.number")
        .unit("iot-unit:math.fraction.unit")
        .minimum(0)
        .maximum(1);
};

exports.make_percent = function (purpose, code, name) {
    return exports
        .make(purpose, code, name)
        .property("iot:type", "iot:type.number")
        .unit("iot-unit:math.fraction.percent")
        .minimum(0)
        .maximum(100);
};
exports.make_string = function (purpose, code, name) {
    return exports.make(purpose, code, name).property("iot:type", "iot:type.string");
};

exports.make_iri = function (purpose, code, name) {
    return exports.make(purpose, code, name)
        .property("iot:type", "iot:type.string")
        .format(":format.iri");
};

exports.make_datetime = function (purpose, code, name) {
    return exports.make(purpose, code, name)
        .property("iot:type", "iot:type.string")
        .format("iot:format.datetime");
};

exports.make_date = function (purpose, code, name) {
    return exports.make(purpose, code, name)
        .property("iot:type", "iot:type.string")
        .format("iot:format.date");
};

exports.make_time = function (purpose, code, name) {
    return exports.make(purpose, code, name)
        .property("iot:type", "iot:type.string")
        .format("iot:format.time");
};

exports.make_color = function (purpose, code, name) {
    return exports.make(purpose, code, name)
        .property("iot:type", "iot:type.string")
        .format("iot:format.color");
};
