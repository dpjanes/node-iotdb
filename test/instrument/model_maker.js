var attribute = require("../../attribute");
var constants = require("../../constants");
var _ = require("../../helpers");

/**
 *  Duplicate 
 */
var d = require('../../model_maker')
for (var key in d) {
    exports[key] = d[key];
}

var ModelMaker = exports.ModelMaker;

/**
 *  Instrument
 */
ModelMaker.prototype.i = function (code, attribute) {
    var name = _.ld.first(attribute, constants.schema_name);

    if (arguments.length === 1) {
        attribute = arguments[0];
        code = attribute.code();
    }

    return this.attribute(
        _.d.clone.deep(attribute)
        .code(code)
        .name(name || code)
        .reading()
    );
};

ModelMaker.prototype.o = function (code, attribute) {
    var name = _.ld.first(attribute, constants.schema_name);

    if (arguments.length === 1) {
        attribute = arguments[0];
        code = attribute.code();
    }

    return this.attribute(
        _.d.clone.deep(attribute)
        .code(code)
        .name(name || code)
        .control()
    );
};

ModelMaker.prototype.io = function (out_code, in_code, attribute) {
    if (arguments.length === 1) {
        attribute = arguments[0];
        out_code = attribute.code();
        in_code = out_code;
    } else if (arguments.length === 2) {
        attribute = arguments[1];
        in_code = out_code;
    }

    var name = _.ld.first(attribute, constants.schema_name);

    if (out_code === in_code) {
        this.attribute(
            _.d.clone.deep(attribute)
            .code(in_code)
            .name(name || in_code)
            .reading()
            .control()
        );
    } else {
        this.attribute(
            _.d.clone.deep(attribute)
            .code(in_code)
            .name(name || in_code)
            .reading()
        );
        this.attribute(
            _.d.clone.deep(attribute)
            .code(out_code)
            .name(name || out_code)
            .control()
        );
    }

    return this;
};
