/*
 *  ld.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-01-22
 *
 *  Nodejs IOTDB control
 *
 *  Copyright [2013-2016] [David P. Janes]
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

var _ = require("../helpers");

var _namespace = {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",

    "schema": "http://schema.org/",
    "wikipedia": "https://en.wikipedia.org/wiki/",

    "iot": "https://iotdb.org/pub/iot#",
    "iot-purpose": "https://iotdb.org/pub/iot-purpose#",
    "iot-facet": "https://iotdb.org/pub/iot-facet#",
    "iot-unit": "https://iotdb.org/pub/iot-unit#",
};

/*
 *  JSON-LD section. NEW 0.4.X
 */
var _ld_set = function (d, key, value) {
    if ((d === null) || (d === undefined)) {
        return;
    } else if (!_.is.Object(d)) {
        throw new Error("expected Object");
    }

    if ((value === null) || (value === undefined)) {
        delete d[key];
    } else if (!_.is.Array(value)) {
        d[key] = value;
    } else if (value.length === 0) {
        delete d[key];
    } else if (value.length === 1) {
        d[key] = value[0];
    } else {
        d[key] = value;
    }
};

var _ld_get_first = function (d, key, otherwise) {
    if ((d === null) || (d === undefined)) {
        return otherwise;
    } else if (!_.is.Object(d)) {
        throw new Error("expected Object");
    }

    var existing = d[key];
    if (existing === undefined) {
        return otherwise;
    } else if (_.is.Array(existing)) {
        return existing[0];
    } else {
        return existing;
    }
};

var _ld_get_list = function (d, key, otherwise) {
    if (otherwise === undefined) {
        otherwise = [];
    }

    if ((d === null) || (d === undefined)) {
        return otherwise;
    } else if (!_.is.Object(d)) {
        throw new Error("expected Object");
    }

    var existing = d[key];
    if (existing === undefined) {
        return otherwise;
    } else if (_.is.Array(existing)) {
        return existing;
    } else {
        return [existing];
    }
};

var _ld_contains = function (d, key, value) {
    if ((d === null) || (d === undefined)) {
        return false;
    } else if (!_.is.Object(d)) {
        throw new Error("expected Object");
    }

    var existing = d[key];
    if (existing === undefined) {
        return false;
    } else if (_.is.Array(existing)) {
        return existing.indexOf(value) > -1;
    } else {
        return existing === value;
    }
};

var ld_intersection = function (d, key, values) {
    if ((d === null) || (d === undefined)) {
        return [];
    } else if (!_.is.Object(d)) {
        throw new Error("expected Object");
    }

    var existing = d[key];
    if (existing === undefined) {
        existing = [];
    } else if (_.is.Array(existing)) {
    } else {
        existing = [ existing ];
    }

    return _.intersection(existing, values);
};

var ld_intersects = function (d, key, values) {
    return ld_intersection(d, key, values).length > 0;
};

var _ld_remove = function (d, key, values) {
    if ((d === null) || (d === undefined)) {
        return;
    } else if (!_.is.Object(d)) {
        throw new Error("expected Object");
    }

    if (!_.is.Array(values)) {
        values = [ values ];
    }

    var xs = d[key];
    if (xs === undefined) {
        xs = [];
    } else if (!_.is.Array(xs)) {
        xs = [ xs ];
    } else {
    }

    values.map(function(value) {
        var x = xs.indexOf(value);
        if (x !== -1) {
            xs.splice(x, 1);
        }
    });

    if (xs.length === 0) {
        delete d[key];
    } else if (xs.length === 1) {
        d[key] = xs[0];
    } else {
        d[key] = xs;
    }
};

var _ld_add = function (d, key, values) {
    if ((d === null) || (d === undefined)) {
        return;
    } else if (!_.is.Object(d)) {
        throw new Error("expected Object");
    }

    if ((values === null) || (values === undefined)) {
        return;
    }

    if (!_.is.Array(values)) {
        values = [ values ];
    }

    var xs = d[key];
    if (xs === undefined) {
        xs = [];
    } else if (!_.is.Array(xs)) {
        xs = [ xs ];
    } else {
    }

    values.map(function(value) {
        if (xs.indexOf(value) === -1) {
            xs.push(value);
        }
    });

    if (xs.length === 0) {
        delete d[key];
    } else if (xs.length === 1) {
        d[key] = xs[0];
    } else {
        d[key] = xs;
    }
};

/**
 *  Compacts the value according to the namespace.
 *  If value is an array or a dictionary, it will
 *  be recursive
 */
var _ld_compact = function (v, paramd) {
    paramd = _.defaults(paramd, {
        json: true,     // only JSON-friendly
        scrub: false,   // only with ':' in key
        jsonld: false,  // only with ':' in key or starting with '@'
        safe: [ "schema:name", "schema:description", "iot:help", ],
    });

    if (_.is.Array(v)) {
        var ovs = v;
        var nvs = [];
        for (var ovx in ovs) {
            var ov = ovs[ovx];
            var nv = _ld_compact(ov, paramd);
            if (nv !== undefined) {
                nvs.push(nv);
            }
        }
        return nvs;
    } else if (_.is.Function(v)) {
        return undefined;
    } else if (_.is.Object(v)) {
        var ovd = v;
        var nvd = {};
        for (var ovkey in ovd) {
            var nvkey = _ld_compact(ovkey, paramd);

            if (paramd.jsonld) {
                if (ovkey.indexOf(':') !== -1) {
                } else if (ovkey.match(/^@/)) {
                } else {
                    continue;
                }
            } else if (paramd.scrub) {
                if (ovkey.indexOf(':') === -1) {
                    continue;
                }
            }
            
            var ovvalue = ovd[ovkey];
            if (ovkey === "@context") {
                nvd[ovkey] = ovvalue;
                continue;
            } 

            if (paramd.safe.indexOf(nvkey) !== -1) {
                nvd[nvkey] = ovvalue;
                continue;
            }

            var nvvalue = _ld_compact(ovvalue, paramd);
            if (nvvalue !== undefined) {
                nvd[nvkey] = nvvalue;
            }
        }
        return nvd;
    } else if (_.is.String(v)) {
        for (var ns in _namespace) {
            var prefix = _namespace[ns];
            if (v.substring(0, prefix.length) !== prefix) {
                continue;
            }

            return ns + ":" + v.substring(prefix.length);
        }

        return v;
    } else {
        if (!paramd.json) {
            return v;
        } else if (_.is.Number(v)) {
            return v;
        } else if (_.is.Boolean(v)) {
            return v;
        } else if (_.isNull(v)) {
            return v;
        } else {
            return undefined;
        }
    }

};

/**
 *  Compacts the value according to the namespace.
 *  If value is an array or a dictionary, it will
 *  be recursive
 */
var _ld_expand = function (v, paramd) {
    if (!_.is.Object(paramd)) {
        paramd = { otherwise: paramd };
    }

    paramd = _.defaults(paramd, {
        otherwise: undefined,
        json: true,     // only JSON-friendly
        scrub: false,   // only with ':' in key
    });

    if (_.is.Array(v)) {
        var ovs = v;
        var nvs = [];
        for (var ovx in ovs) {
            var ov = ovs[ovx];
            var nv = _ld_expand(ov, paramd);
            if (nv !== undefined) {
                nvs.push(nv);
            }
        }
        return nvs;
    } else if ((v !== null) && _.is.Object(v)) {
        var ovd = v;
        var nvd = {};
        for (var ovkey in ovd) {
            if (paramd.scrub && (ovkey.indexOf(':') === -1)) {
                continue;
            }
            
            var ovvalue = ovd[ovkey];
            var nvvalue = _ld_expand(ovvalue, paramd);
            if (nvvalue !== undefined) {
                var nvkey = _ld_expand(ovkey, paramd);
                nvd[nvkey] = nvvalue;
            }
        }
        return nvd;
    } else if (_.is.String(v)) {
        var match = v.match(/([-a-z0-9_]+):(.*)/);
        if (match === null) {
            if ((paramd.otherwise !== undefined) && (paramd.otherwise !== null)) {
                v = v.replace(/^:/, '');
                if (_.is.String(paramd.otherwise)) {
                    return _ld_expand(paramd.otherwise) + v;
                } else {
                    return v;
                }
            } else {
                return v;
            }
        }

        var url = _namespace[match[1]];

        if (url && url.length) {
            return url + match[2];
        }

        return v;
    } else {
        if (!paramd.json) {
            return v;
        } else if (_.is.Number(v)) {
            return v;
        } else if (_.is.Integer(v)) {
            return v;
        } else if (_.is.Boolean(v)) {
            return v;
        } else if (_.isNull(v)) {
            return paramd.otherwise;
        } else {
            return undefined;
        }
    }

};

exports.ld = {
    namespace: _namespace,
    compact: _ld_compact,
    expand: _ld_expand,
    set: _ld_set,
    first: _ld_get_first,
    list: _ld_get_list,
    contains: _ld_contains,
    remove: _ld_remove,
    add: _ld_add,

    intersects: ld_intersects,
    intersection: ld_intersection,
};
