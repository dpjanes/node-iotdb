/*
 *  helpers.js
 *
 *  David Janes
 *  IOTDB.org
 *  2013-12-01
 *
 *  Nodejs IOTDB control
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

var jsonld = require('jsonld');
var rdf = require('rdf');
var url = require('url');
var crypto = require('crypto');
var node_url = require('url');
var path = require('path');

var modules = [
    require('underscore'),
    require('./helpers/ld'),
];
for (var mi in modules) {
    var module = modules[mi];
    for (var key in module) {
        exports[key] = module[key];
    }
}

/**
 *  @module helpers
 */

// Establish the object that gets returned to break out of a loop iteration.
var breaker = {};

// Save bytes in the minified (but not gzipped) version:
var ArrayProto = Array.prototype,
    ObjProto = Object.prototype,
    FuncProto = Function.prototype;

//use the faster Date.now if available.
var getTime = (Date.now || function () {
    return new Date().getTime();
});

// Create quick reference variables for speed access to core prototypes.
var
    push = ArrayProto.push,
    slice = ArrayProto.slice,
    concat = ArrayProto.concat,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

// All **ECMAScript 5** native function implementations that we hope to use
// are declared here.
var
    nativeForEach = ArrayProto.forEach,
    nativeMap = ArrayProto.map,
    nativeReduce = ArrayProto.reduce,
    nativeReduceRight = ArrayProto.reduceRight,
    nativeFilter = ArrayProto.filter,
    nativeEvery = ArrayProto.every,
    nativeSome = ArrayProto.some,
    nativeIndexOf = ArrayProto.indexOf,
    nativeLastIndexOf = ArrayProto.lastIndexOf,
    nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = FuncProto.bind;


// Collection Functions
// --------------------

// The cornerstone, an `each` implementation, aka `forEach`.
// Handles objects with the built-in `forEach`, arrays, and raw objects.
// Delegates to **ECMAScript 5**'s native `forEach` if available.
var each = exports.each = exports.forEach = function (obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, length = obj.length; i < length; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) return;
        }
    } else {
        var keys = exports.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
        }
    }
};

/*
// Return the results of applying the iterator to each element.
// Delegates to **ECMAScript 5**'s native `map` if available.
exports.map = exports.collect = function (obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function (value, index, list) {
        results.push(iterator.call(context, value, index, list));
    });
    return results;
};

var reduceError = 'Reduce of empty array with no initial value';

// **Reduce** builds up a single result from a list of values, aka `inject`,
// or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
exports.reduce = exports.foldl = exports.inject = function (obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
        if (context) iterator = exports.bind(iterator, context);
        return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function (value, index, list) {
        if (!initial) {
            memo = value;
            initial = true;
        } else {
            memo = iterator.call(context, memo, value, index, list);
        }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
};

// The right-associative version of reduce, also known as `foldr`.
// Delegates to **ECMAScript 5**'s native `reduceRight` if available.
exports.reduceRight = exports.foldr = function (obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
        if (context) iterator = exports.bind(iterator, context);
        return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
        var keys = exports.keys(obj);
        length = keys.length;
    }
    each(obj, function (value, index, list) {
        index = keys ? keys[--length] : --length;
        if (!initial) {
            memo = obj[index];
            initial = true;
        } else {
            memo = iterator.call(context, memo, obj[index], index, list);
        }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
};

// Return the first value which passes a truth test. Aliased as `detect`.
exports.find = exports.detect = function (obj, iterator, context) {
    var result;
    any(obj, function (value, index, list) {
        if (iterator.call(context, value, index, list)) {
            result = value;
            return true;
        }
    });
    return result;
};

// Return all the elements that pass a truth test.
// Delegates to **ECMAScript 5**'s native `filter` if available.
// Aliased as `select`.
exports.filter = exports.select = function (obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function (value, index, list) {
        if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
};

// Return all the elements for which a truth test fails.
exports.reject = function (obj, iterator, context) {
    return exports.filter(obj, function (value, index, list) {
        return !iterator.call(context, value, index, list);
    }, context);
};

// Determine whether all of the elements match a truth test.
// Delegates to **ECMAScript 5**'s native `every` if available.
// Aliased as `all`.
exports.every = exports.all = function (obj, iterator, context) {
    iterator || (iterator = exports.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function (value, index, list) {
        if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
};

// Determine if at least one element in the object matches a truth test.
// Delegates to **ECMAScript 5**'s native `some` if available.
// Aliased as `any`.
var any = exports.some = exports.any = function (obj, iterator, context) {
    iterator || (iterator = exports.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function (value, index, list) {
        if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
};

// Determine if the array or object contains a given value (using `===`).
// Aliased as `include`.
exports.contains = exports.include = function (obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function (value) {
        return value === target;
    });
};

// Invoke a method (with arguments) on every item in a collection.
exports.invoke = function (obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = exports.isFunction(method);
    return exports.map(obj, function (value) {
        return (isFunc ? method : value[method]).apply(value, args);
    });
};

// Convenience version of a common use case of `map`: fetching a property.
exports.pluck = function (obj, key) {
    return exports.map(obj, exports.property(key));
};

// Convenience version of a common use case of `filter`: selecting only objects
// containing specific `key:value` pairs.
exports.where = function (obj, attrs, first) {
    return exports[first ? 'find' : 'filter'](obj, function (value) {
        for (var key in attrs) {
            if (attrs[key] !== value[key]) return false;
        }
        return true;
    });
};

// Convenience version of a common use case of `find`: getting the first object
// containing specific `key:value` pairs.
exports.findWhere = function (obj, attrs) {
    return exports.where(obj, attrs, true);
};

// Return the maximum element or (element-based computation).
// Can't optimize arrays of integers longer than 65,535 elements.
// See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
exports.max = function (obj, iterator, context) {
    if (!iterator && exports.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
        return Math.max.apply(Math, obj);
    }
    if (!iterator && exports.isEmpty(obj)) return -Infinity;
    var result = {
        computed: -Infinity,
        value: -Infinity
    };
    each(obj, function (value, index, list) {
        var computed = iterator ? iterator.call(context, value, index, list) : value;
        computed > result.computed && (result = {
            value: value,
            computed: computed
        });
    });
    return result.value;
};

// Return the minimum element (or element-based computation).
exports.min = function (obj, iterator, context) {
    if (!iterator && exports.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
        return Math.min.apply(Math, obj);
    }
    if (!iterator && exports.isEmpty(obj)) return Infinity;
    var result = {
        computed: Infinity,
        value: Infinity
    };
    each(obj, function (value, index, list) {
        var computed = iterator ? iterator.call(context, value, index, list) : value;
        computed < result.computed && (result = {
            value: value,
            computed: computed
        });
    });
    return result.value;
};

// Shuffle an array, using the modern version of the
// [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
exports.shuffle = function (obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function (value) {
        rand = exports.random(index++);
        shuffled[index - 1] = shuffled[rand];
        shuffled[rand] = value;
    });
    return shuffled;
};

// Sample **n** random values from a collection.
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `map`.
exports.sample = function (obj, n, guard) {
    if (n == null || guard) {
        if (obj.length !== +obj.length) obj = exports.values(obj);
        return obj[exports.random(obj.length - 1)];
    }
    return exports.shuffle(obj).slice(0, Math.max(0, n));
};

// An internal function to generate lookup iterators.
var lookupIterator = function (value) {
    if (value == null) return exports.identity;
    if (exports.isFunction(value)) return value;
    return exports.property(value);
};

// Sort the object's values by a criterion produced by an iterator.
exports.sortBy = function (obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return exports.pluck(exports.map(obj, function (value, index, list) {
        return {
            value: value,
            index: index,
            criteria: iterator.call(context, value, index, list)
        };
    }).sort(function (left, right) {
        var a = left.criteria;
        var b = right.criteria;
        if (a !== b) {
            if (a > b || a === void 0) return 1;
            if (a < b || b === void 0) return -1;
        }
        return left.index - right.index;
    }), 'value');
};

// An internal function used for aggregate "group by" operations.
var group = function (behavior) {
    return function (obj, iterator, context) {
        var result = {};
        iterator = lookupIterator(iterator);
        each(obj, function (value, index) {
            var key = iterator.call(context, value, index, obj);
            behavior(result, key, value);
        });
        return result;
    };
};

// Groups the object's values by a criterion. Pass either a string attribute
// to group by, or a function that returns the criterion.
exports.groupBy = group(function (result, key, value) {
    exports.has(result, key) ? result[key].push(value) : result[key] = [value];
});

// Indexes the object's values by a criterion, similar to `groupBy`, but for
// when you know that your index values will be unique.
exports.indexBy = group(function (result, key, value) {
    result[key] = value;
});

// Counts instances of an object that group by a certain criterion. Pass
// either a string attribute to count by, or a function that returns the
// criterion.
exports.countBy = group(function (result, key) {
    exports.has(result, key) ? result[key] ++ : result[key] = 1;
});

// Use a comparator function to figure out the smallest index at which
// an object should be inserted so as to maintain order. Uses binary search.
exports.sortedIndex = function (array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0,
        high = array.length;
    while (low < high) {
        var mid = (low + high) >>> 1;
        iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
};

// Safely create a real, live array from anything iterable.
exports.toArray = function (obj) {
    if (!obj) return [];
    if (exports.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return exports.map(obj, exports.identity);
    return exports.values(obj);
};

// Return the number of elements in an object.
exports.size = function (obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : exports.keys(obj).length;
};
*/
/*

// Array Functions
// ---------------

// Get the first element of an array. Passing **n** will return the first N
// values in the array. Aliased as `head` and `take`. The **guard** check
// allows it to work with `exports.map`.
exports.first = exports.head = exports.take = function (array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
};

// Returns everything but the last entry of the array. Especially useful on
// the arguments object. Passing **n** will return all the values in
// the array, excluding the last N. The **guard** check allows it to work with
// `exports.map`.
exports.initial = function (array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
};

// Get the last element of an array. Passing **n** will return the last N
// values in the array. The **guard** check allows it to work with `exports.map`.
exports.last = function (array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
};

// Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
// Especially useful on the arguments object. Passing an **n** will return
// the rest N values in the array. The **guard**
// check allows it to work with `exports.map`.
exports.rest = exports.tail = exports.drop = function (array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
};

// Trim out all falsy values from an array.
exports.compact = function (array) {
    return exports.filter(array, exports.identity);
};

// Internal implementation of a recursive `flatten` function.
var flatten = function (input, shallow, output) {
    if (shallow && exports.every(input, exports.isArray)) {
        return concat.apply(output, input);
    }
    each(input, function (value) {
        if (exports.isArray(value) || exports.isArguments(value)) {
            shallow ? push.apply(output, value) : flatten(value, shallow, output);
        } else {
            output.push(value);
        }
    });
    return output;
};

// Flatten out an array, either recursively (by default), or just one level.
exports.flatten = function (array, shallow) {
    return flatten(array, shallow, []);
};

// Return a version of the array that does not contain the specified value(s).
exports.without = function (array) {
    return exports.difference(array, slice.call(arguments, 1));
};
*/
/*

// Produce a duplicate-free version of the array. If the array has already
// been sorted, you have the option of using a faster algorithm.
// Aliased as `unique`.
exports.uniq = exports.unique = function (array, isSorted, iterator, context) {
    if (exports.isFunction(isSorted)) {
        context = iterator;
        iterator = isSorted;
        isSorted = false;
    }
    var initial = iterator ? exports.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function (value, index) {
        if (isSorted ? (!index || seen[seen.length - 1] !== value) : !exports.contains(seen, value)) {
            seen.push(value);
            results.push(array[index]);
        }
    });
    return results;
};

// Produce an array that contains the union: each distinct element from all of
// the passed-in arrays.
exports.union = function () {
    return exports.uniq(exports.flatten(arguments, true));
};

// Produce an array that contains every item shared between all the
// passed-in arrays.
exports.intersection = function (array) {
    var rest = slice.call(arguments, 1);
    return exports.filter(exports.uniq(array), function (item) {
        return exports.every(rest, function (other) {
            return exports.indexOf(other, item) >= 0;
        });
    });
};

// Take the difference between one array and a number of other arrays.
// Only the elements present in just the first array will remain.
exports.difference = function (array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return exports.filter(array, function (value) {
        return !exports.contains(rest, value);
    });
};

// Zip together multiple lists into a single array -- elements that share
// an index go together.
exports.zip = function () {
    var length = exports.max(exports.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
        results[i] = exports.pluck(arguments, '' + i);
    }
    return results;
};

// Converts lists into objects. Pass either a single array of `[key, value]`
// pairs, or two parallel arrays of the same length -- one of keys, and one of
// the corresponding values.
exports.object = function (list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
        if (values) {
            result[list[i]] = values[i];
        } else {
            result[list[i][0]] = list[i][1];
        }
    }
    return result;
};

// If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
// we need this function. Return the position of the first occurrence of an
// item in an array, or -1 if the item is not included in the array.
// Delegates to **ECMAScript 5**'s native `indexOf` if available.
// If the array is large and already in sort order, pass `true`
// for **isSorted** to use binary search.
exports.indexOf = function (array, item, isSorted) {
    if (array == null) return -1;
    var i = 0,
        length = array.length;
    if (isSorted) {
        if (typeof isSorted == 'number') {
            i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
        } else {
            i = exports.sortedIndex(array, item);
            return array[i] === item ? i : -1;
        }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++)
        if (array[i] === item) return i;
    return -1;
};

// Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
exports.lastIndexOf = function (array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
        return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--)
        if (array[i] === item) return i;
    return -1;
};

// Generate an integer Array containing an arithmetic progression. A port of
// the native Python `range()` function. See
// [the Python documentation](http://docs.python.org/library/functions.html#range).
exports.range = function (start, stop, step) {
    if (arguments.length <= 1) {
        stop = start || 0;
        start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while (idx < length) {
        range[idx++] = start;
        start += step;
    }

    return range;
};
*/

// Function (ahem) Functions
// ------------------

/*
// Reusable constructor function for prototype setting.
var ctor = function () {};

// Create a function bound to a given object (assigning `this`, and arguments,
// optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
// available.
exports.bind = function (func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!exports.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function () {
        if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
        ctor.prototype = func.prototype;
        var self = new ctor;
        ctor.prototype = null;
        var result = func.apply(self, args.concat(slice.call(arguments)));
        if (Object(result) === result) return result;
        return self;
    };
};

// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. exports acts
// as a placeholder, allowing any combination of arguments to be pre-filled.
exports.partial = function (func) {
    var boundArgs = slice.call(arguments, 1);
    return function () {
        var args = slice.call(boundArgs);
        exports.each(arguments, function (arg) {
            var index = args.indexOf(exports);
            args[index >= 0 ? index : args.length] = arg;
        });
        return func.apply(this, exports.map(args, function (value) {
            return value === exports ? void 0 : value;
        }));
    };
};

// Bind a number of an object's methods to that object. Remaining arguments
// are the method names to be bound. Useful for ensuring that all callbacks
// defined on an object belong to it.
exports.bindAll = function (obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function (f) {
        obj[f] = exports.bind(obj[f], obj);
    });
    return obj;
};

// Memoize an expensive function by storing its results.
exports.memoize = function (func, hasher) {
    var memo = {};
    hasher || (hasher = exports.identity);
    return function () {
        var key = hasher.apply(this, arguments);
        return exports.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
};

// Delays a function for the given number of milliseconds, and then calls
// it with the arguments supplied.
exports.delay = function (func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function () {
        return func.apply(null, args);
    }, wait);
};

// Defers a function, scheduling it to run after the current call stack has
// cleared.
exports.defer = function (func) {
    return exports.delay.apply(exports, [func, 1].concat(slice.call(arguments, 1)));
};

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
exports.throttle = function (func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function () {
        previous = options.leading === false ? 0 : getTime();
        timeout = null;
        result = func.apply(context, args);
        context = args = null;
    };
    return function () {
        var now = getTime();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = func.apply(context, args);
            context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
};

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
exports.debounce = function (func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function () {
        context = this;
        args = arguments;
        timestamp = getTime();
        var later = function () {
            var last = getTime() - timestamp;
            if (last < wait) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    context = args = null;
                }
            }
        };
        var callNow = immediate && !timeout;
        if (!timeout) {
            timeout = setTimeout(later, wait);
        }
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };
};

// Returns a function that will be executed at most one time, no matter how
// often you call it. Useful for lazy initialization.
exports.once = function (func) {
    var ran = false,
        memo;
    return function () {
        if (ran) return memo;
        ran = true;
        memo = func.apply(this, arguments);
        func = null;
        return memo;
    };
};

// Returns the first function passed as an argument to the second,
// allowing you to adjust arguments, run code before and after, and
// conditionally execute the original function.
exports.wrap = function (func, wrapper) {
    return exports.partial(wrapper, func);
};

// Returns a function that is the composition of a list of functions, each
// consuming the return value of the function that follows.
exports.compose = function () {
    var funcs = arguments;
    return function () {
        var args = arguments;
        for (var i = funcs.length - 1; i >= 0; i--) {
            args = [funcs[i].apply(this, args)];
        }
        return args[0];
    };
};

// Returns a function that will only be executed after being called N times.
exports.after = function (times, func) {
    return function () {
        if (--times < 1) {
            return func.apply(this, arguments);
        }
    };
};
*/
/*

// Object Functions
// ----------------

// Retrieve the names of an object's properties.
// Delegates to **ECMAScript 5**'s native `Object.keys`
exports.keys = nativeKeys || function (obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj)
        if (exports.has(obj, key)) keys.push(key);
    return keys;
};

// Retrieve the values of an object's properties.
exports.values = function (obj) {
    var keys = exports.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
        values[i] = obj[keys[i]];
    }
    return values;
};

// Convert an object into a list of `[key, value]` pairs.
exports.pairs = function (obj) {
    var keys = exports.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
        pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
};

// Invert the keys and values of an object. The values must be serializable.
exports.invert = function (obj) {
    var result = {};
    var keys = exports.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
        result[obj[keys[i]]] = keys[i];
    }
    return result;
};

// Return a sorted list of the function names available on the object.
// Aliased as `methods`
exports.functions = exports.methods = function (obj) {
    var names = [];
    for (var key in obj) {
        if (exports.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
};

// Extend a given object with all the properties in passed-in object(s).
exports.extend = function (obj) {
    each(slice.call(arguments, 1), function (source) {
        if (source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
};

// Return a copy of the object only containing the whitelisted properties.
exports.pick = function (obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function (key) {
        if (key in obj) copy[key] = obj[key];
    });
    return copy;
};

// Return a copy of the object without the blacklisted properties.
exports.omit = function (obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
        if (!exports.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
};
*/

// Fill in a given object with default properties.
exports.defaults = function (obj) {
    each(slice.call(arguments, 1), function (source) {
        if (source) {
            for (var prop in source) {
                if (obj[prop] === void 0) obj[prop] = source[prop];
            }
        }
    });
    return obj;
};


// Create a (shallow-cloned) duplicate of an object.
exports.clone = function (obj) {
    if (!exports.isObject(obj)) return obj;
    return exports.isArray(obj) ? obj.slice() : exports.extend({}, obj);
};

// Invokes interceptor with the obj, and then returns obj.
// The primary purpose of this method is to "tap into" a method chain, in
// order to perform operations on intermediate results within the chain.
exports.tap = function (obj, interceptor) {
    interceptor(obj);
    return obj;
};

/*
// Internal recursive comparison function for `isEqual`.
var eq = function (a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
        // Strings, numbers, dates, and booleans are compared by value.
    case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
    case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
    case '[object Date]':
    case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
        // RegExps are compared by their source patterns and flags.
    case '[object RegExp]':
        return a.source == b.source &&
            a.global == b.global &&
            a.multiline == b.multiline &&
            a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
        // Linear search. Performance is inversely proportional to the number of
        // unique nested structures.
        if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor,
        bCtor = b.constructor;
    if (aCtor !== bCtor && !(exports.isFunction(aCtor) && (aCtor instanceof aCtor) &&
            exports.isFunction(bCtor) && (bCtor instanceof bCtor)) && ('constructor' in a && 'constructor' in b)) {
        return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0,
        result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
        // Compare array lengths to determine if a deep comparison is necessary.
        size = a.length;
        result = size == b.length;
        if (result) {
            // Deep compare the contents, ignoring non-numeric properties.
            while (size--) {
                if (!(result = eq(a[size], b[size], aStack, bStack))) break;
            }
        }
    } else {
        // Deep compare objects.
        for (var key in a) {
            if (exports.has(a, key)) {
                // Count the expected number of properties.
                size++;
                // Deep compare each member.
                if (!(result = exports.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
            }
        }
        // Ensure that both objects contain the same number of properties.
        if (result) {
            for (key in b) {
                if (exports.has(b, key) && !(size--)) break;
            }
            result = !size;
        }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
};

// Perform a deep comparison to check if two objects are equal.
exports.isEqual = function (a, b) {
    return eq(a, b, [], []);
};

// Is a given array, string, or object empty?
// An "empty" object has no enumerable own-properties.
exports.isEmpty = function (obj) {
    if (obj == null) return true;
    if (exports.isArray(obj) || exports.isString(obj)) return obj.length === 0;
    for (var key in obj)
        if (exports.has(obj, key)) return false;
    return true;
};

// Is a given value a DOM element?
exports.isElement = function (obj) {
    return !!(obj && obj.nodeType === 1);
};
*/

// Is a given value an array?
// Delegates to ECMA5's native Array.isArray
exports.isArray = nativeIsArray || function (obj) {
    return toString.call(obj) == '[object Array]';
};

// Is a given variable an object?
exports.isObject = function (obj) {
    return obj === Object(obj);
};

// Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function (name) {
    exports['is' + name] = function (obj) {
        return toString.call(obj) == '[object ' + name + ']';
    };
});

// Define a fallback version of the method in browsers (ahem, IE), where
// there isn't any inspectable "Arguments" type.
if (!exports.isArguments(arguments)) {
    exports.isArguments = function (obj) {
        return !!(obj && exports.has(obj, 'callee'));
    };
};

// Optimize `isFunction` if appropriate.
if (typeof (/./) !== 'function') {
    exports.isFunction = function (obj) {
        return typeof obj === 'function';
    };
};

/*
// Is a given object a finite number?
exports.isFinite = function (obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
};

// Is the given value `NaN`? (NaN is the only number which does not equal itself).
exports.isNaN = function (obj) {
    return exports.isNumber(obj) && obj != +obj;
};
*/

// Is a given value a boolean?
exports.isBoolean = function (obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
};

// Is a given value equal to null?
exports.isNull = function (obj) {
    return obj === null;
};

// Is a given variable undefined?
exports.isUndefined = function (obj) {
    return obj === void 0;
};

// Shortcut function for checking if an object has a given property directly
// on itself (in other words, not on a prototype).
exports.has = function (obj, key) {
    return hasOwnProperty.call(obj, key);
};

/*
// Utility Functions
// -----------------

// Keep the identity function around for default iterators.
exports.identity = function (value) {
    return value;
};

exports.constant = function (value) {
    return function () {
        return value;
    };
};

exports.property = function (key) {
    return function (obj) {
        return obj[key];
    };
};

// Run a function **n** times.
exports.times = function (n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
};

// Return a random integer between min and max (inclusive).
exports.random = function (min, max) {
    if (max == null) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
};

// List of HTML entities for escaping.
var entityMap = {
    escape: {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
    }
};
entityMap.unescape = exports.invert(entityMap.escape);

// Regexes containing the keys and values listed immediately above.
var entityRegexes = {
    escape: new RegExp('[' + exports.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + exports.keys(entityMap.unescape).join('|') + ')', 'g')
};

// Functions for escaping and unescaping strings to/from HTML interpolation.
exports.each(['escape', 'unescape'], function (method) {
    exports[method] = function (string) {
        if (string == null) return '';
        return ('' + string).replace(entityRegexes[method], function (match) {
            return entityMap[method][match];
        });
    };
});

// If the value of the named `property` is a function then invoke it with the
// `object` as context; otherwise, return it.
exports.result = function (object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return exports.isFunction(value) ? value.call(object) : value;
};
*/

/*

// Generate a unique integer id (unique within the entire client session).
// Useful for temporary DOM ids.
var idCounter = 0;
exports.uniqueId = function (prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
};

// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
exports.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
};

// When customizing `templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
};

var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
exports.template = function (text, data, settings) {
    var render;
    settings = exports.defaults({}, settings, exports.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
        (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
        source += text.slice(index, offset)
            .replace(escaper, function (match) {
                return '\\' + escapes[match];
            });

        if (escape) {
            source += "'+\n((__t=(" + escape + "))==null?'':exports.escape(__t))+\n'";
        }
        if (interpolate) {
            source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
        }
        if (evaluate) {
            source += "';\n" + evaluate + "\n__p+='";
        }
        index = offset + match.length;
        return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
        "print=function(){__p+=__j.call(arguments,'');};\n" +
        source + "return __p;\n";

    try {
        render = new Function(settings.variable || 'obj', 'exports', source);
    } catch (e) {
        e.source = source;
        throw e;
    }

    if (data) return render(data, exports);
    var template = function (data) {
        return render.call(this, data, exports);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
};

// Add a "chain" function, which will delegate to the wrapper.
exports.chain = function (obj) {
    return exports(obj).chain();
};
 */


exports.dump = function (bodyd, optd) {
    context = bodyd['@context'];

    if (!optd || optd.compact) jsonld.compact(bodyd, context, function (error, resultd) {
        if (error) console.log("error", error);
        console.log("compact", exports.format(resultd));
    });
    if (!optd || optd.expand) jsonld.expand(bodyd, function (error, resultd) {
        if (error) console.log("error", error);
        console.log("expand", exports.format(resultd));
    });
    if (!optd || optd.normalize) jsonld.normalize(bodyd, {
        format: 'application/nquads'
    }, function (error, result) {
        if (error) console.log("error", error);
        console.log("normalize", result)
    })
};

exports.isAbsoluteURL = function (o) {
    if (typeof o !== 'string') return;
    var u = url.parse(o);
    if (!u) return false;
    if (!u.protocol) return false;
    return u.protocol.length > 0;
};

exports.isString = function (o) {
    return typeof o === 'string';
};

exports.isArray = function (o) {
    return Array.isArray(o);
};

exports.isObject = function (o) {
    return typeof o === 'object';
};

exports.isBoolean = function (o) {
    return typeof o === 'boolean';
};

exports.isFunction = function (o) {
    return typeof o === 'function';
};

exports.isNumber = function (o) {
    return typeof o === 'number';
};

exports.isInteger = function (o) {
    return typeof o === 'number' && ((o % 1) === 0);
};

exports.isDate = function (o) {
    return o instanceof Date;
};

/*
 *  The next three functions courtesy
 *  http://geniuscarrier.com/copy-object-in-javascript/
 */
exports.shallowCopy = function (oldObj) {
    var newObj = {};
    for (var i in oldObj) {
        if (oldObj.hasOwnProperty(i)) {
            newObj[i] = oldObj[i];
        }
    }
    return newObj;
};

exports.deepCopy = function (oldObj) {
    var newObj = oldObj;
    if (oldObj && typeof oldObj === 'object') {
        newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
        for (var i in oldObj) {
            newObj[i] = exports.deepCopy(oldObj[i]);
        }
    }
    return newObj;
};

exports.mix = function () {
    var i, j, newObj = {};
    for (i = 0; i < arguments.length; i++) {
        for (j in arguments[i]) {
            if (arguments[i].hasOwnProperty(j)) {
                newObj[j] = arguments[i][j];
            }
        }
    }
    return newObj;
};

/**
 *  Return the proper keys of a dictionary
 */
exports.keys = function (d) {
    var keys = [];

    for (var key in d) {
        if (d.hasOwnProperty(key)) {
            keys.push(key);
        }
    }

    return keys;
};

/**
 *  Return true iff everthing a === b, in a deep
 *  and "pythonic" sense
 */
exports.equals = function (a, b) {
    return exports.isEqual(a, b);
};

/**
 *  Return true iff everything in subd is in superd
 */
exports.d_contains_d = function (superd, subd) {
    var subkeys = exports.keys(subd);
    for (var sx in subkeys) {
        var subkey = subkeys[sx];
        var subvalue = subd[subkey];
        var supervalue = superd[subkey];
        if (subvalue !== supervalue) {
            return false;
        }
    }

    return true;
};

/**
 */
exports.flatten_arguments = function (a) {
    var rs = [];

    for (var ai = 0; ai < a.length; ai++) {
        rs.push(a[ai]);
    }

    return rs;
};



/*
 *  From:
 *  http://stackoverflow.com/a/1573141/96338
 */
exports.colord = {
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aqua": "#00ffff",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "black": "#000000",
    "blanchedalmond": "#ffebcd",
    "blue": "#0000ff",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgreen": "#006400",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "fuchsia": "#ff00ff",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "gray": "#808080",
    "green": "#008000",
    "greenyellow": "#adff2f",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred ": "#cd5c5c",
    "indigo ": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgrey": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370d8",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "navy": "#000080",
    "oldlace": "#fdf5e6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#d87093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "purple": "#800080",
    "red": "#ff0000",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "silver": "#c0c0c0",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "white": "#ffffff",
    "whitesmoke": "#f5f5f5",
    "yellow": "#ffff00",
    "yellowgreen": "#9acd32"
};

exports.color_to_hex = function (name, otherwise) {
    name = name.toLowerCase();

    var hex = exports.colord[name];
    if (hex !== undefined) {
        return hex.toUpperCase();
    } else {
        return otherwise;
    }
};

/* XXX NOT INTEGRATED YET */
function decimalToHex(d, padding) {
    var hex = Number(Math.floor(d)).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
};

/* --- random stuff --- */
exports.randint = function (n) {
    return Math.floor(Math.random() * n);
};

exports.choose = function (vs) {
    return vs[exports.randint(vs.length)];
};

/**
 *  Copy all keys that start with "api_"
 */
exports.copy_api = function (fromd, tod) {
    var keys = exports.keys(fromd);
    for (var ki in keys) {
        var key = keys[ki];
        if (key.match(/^api_/)) {
            tod[key] = fromd[key];
        }
    }
};

/**
 *  This reliably returns an MD5 hex hash of a _simple_ dictionary
 */
exports.hash_dictionary = function (d, ignores) {
    ignores = ignores ? ignores : [];

    var keys = exports.keys(d);
    keys.sort()

    var hasher = crypto.createHash('md5');

    for (var ki = 0; ki < keys.length; ki++) {
        var key = keys[ki];
        if (ignores.indexOf(key) > -1) {
            continue;
        }

        var value = d[key];
        hasher.update("\0", "binary");
        hasher.update(key, "utf8");
        hasher.update("\0", "binary");
        hasher.update("" + value, "utf8");
    }

    return hasher.digest("hex")
};

/**
 */
exports.md5_hash = function () {
    var hasher = crypto.createHash('md5');
    for (var ai in arguments) {
        var a = arguments[ai];
        hasher.update("" + a)
    }

    return hasher.digest("hex")
};

/**
 *  Adds the "thing_id" key to the dictionary, which
 *  is the {@link helpers#hash_dictionary} of the dictionary
 *  but ignores the key "thing_id" (meaning this function
 *  is safe to call multiple times)
 *
 *  @param {dictionary} identityd
 *  A simple dictionary of values the comprise the identity
 */
exports.thing_id = function (identityd) {
    var hash = exports.hash_dictionary(identityd, ["thing_id", ]);
    identityd["thing_id"] = "urn:iotdb:device:" + hash;
};

/**
 *  Test if the identities "overlap". This is determined by:
 *
 *  <ul>
 *  <li>Every key in subd must be in superd
 *  <li>isArray(supervalue) && isArray(subvalue) : they must have a common element
 *  <li>isArray(supervalue) && !isArray(subvalue) : supevalue must contain subvalue
 *  <li>!isArray(supervalue) && isArray(subvalue) : subvalue must contain supervalue
 *  <li>!isArray(supervalue) && !isArray(subvalue) : subvalue must === supervalue
 *  </ul>
 */
exports.identity_overlap = function (superd, subd) {
    var subkeys = exports.keys(subd);
    for (var skx in subkeys) {
        var subkey = subkeys[skx];
        var supervalue = superd[subkey];
        var subvalue = subd[subkey];

        if (exports.isArray(supervalue)) {
            if (exports.isArray(subvalue)) {
                var common = false;
                for (var ax in supervalue) {
                    for (var bx in subvalue) {
                        if (supervalue[ax] === subvalue[bx]) {
                            common = true;
                            break;
                        }
                    }
                    if (common) {
                        break;
                    }
                }
                if (!common) {
                    return false;
                }
            } else if (supervalue.indexOf(subvalue) == -1) {
                return false;
            }
        } else if (exports.isArray(subvalue)) {
            if (subvalue.indexOf(supervalue) == -1) {
                return false;
            }
        } else if (supervalue !== subvalue) {
            return false;
        }
    }

    return true;
};

/**
 *  This provides a shorthand for when you need
 *  to create a dictionary with only "driver"
 *  as a key.
 */
exports.identity_expand = function (d) {
    if (!d) {
        return d;
    } else if (exports.isString(d)) {
        return {
            "driver": exports.ld.expand(d, "iot-driver:")
        };
    } else {
        if (d.driver) {
            d.driver = exports.ld.expand(d.driver, "iot-driver:")
        }
        return d;
    }
};

var _identifier_to_parts = function (identifier) {
    if (!exports.isString(identifier)) {
        throw new Error("identitfier_to_*: expected a String");
    } else if (!identifier.match(/^[A-Za-z]/)) {
        throw new Error("identitfier_to_*: must start with a letter");
    } else if (identifier.match(/[^-_A-Za-z0-9]/)) {
        throw new Error("identitfier_to_*: must contain only letters, numbers, underscores and dashes")
    }

    var splits = identifier;
    var splits = splits.replace(/([-_])/g, ' ')
    var splits = splits.replace(/([A-Z]+)([A-Z][^A-Z0-9]|$)/g, ' $1 $2')
    var splits = splits.replace(/([A-Z]+)([^A-Z])/g, ' $1$2')
    var splits = splits.toLowerCase()

    var parts = []
    splits.split(" ").map(function (part) {
        if (part) parts.push(part);
    })

    return parts;
};

/**
 *  Convert any string identifier to 'CamelCase'
 *
 *  @param {string} identifier
 *  Any identifier (in CamelCase, dash-case, or underscore_case)
 *
 *  @return {string}
 *  CamelCase version of the identifier
 */
exports.identifier_to_camel_case = function (identifier) {
    var parts = [];
    _identifier_to_parts(identifier).map(function (part) {
        parts.push(part.substring(0, 1).toUpperCase() + part.substring(1));
    });

    return parts.join("");
};

/**
 *  Convert any string identifier to 'dash-case'
 *
 *  @param {string} identifier
 *  Any identifier (in CamelCase, dash-case, or underscore_case)
 *
 *  @return {string}
 *  dash-case version of the identifier
 */
exports.identifier_to_dash_case = function (identifier) {
    return _identifier_to_parts(identifier).join("-");
};

/**
 *  Convert any string identifier to 'underscore_case'
 *
 *  @param {string} identifier
 *  Any identifier (in CamelCase, dash-case, or underscore_case)
 *
 *  @return {string}
 *  underscore_case version of the identifier
 */
exports.identifier_to_underscore_case = function (identifier) {
    return _identifier_to_parts(identifier).join("_");
};

/**
 *  Return a pretty safe string from an identifier
 */
exports.slugify = function (identifier) {
    identifier = identifier.toLowerCase()
    identifier = identifier.replace(/[^a-z0-9]/g, '_')
    identifier = identifier.replace(/_+/g, '_')

    return identifier
};

/**
 *  Make sure a 'paramd' is properly set up. That is,
 *  that it's a dictionary and if any values in defaultd
 *  are undefined in paramd, they're copied over
 *
 *  @param {dictionary|undefined} paramd
 *  The paramd passed in to the function calling this.
 *  Often undefined
 *
 *  @param {dictionary} defaultd
 *  What the values should be
 *
 *  @param {dictionary}
 *  The paramd to use, not necessarily the one passed in
 */
exports.defaults = function (paramd, defaultd) {
    if (!paramd) {
        paramd = {}
    }

    for (var key in defaultd) {
        var pvalue = paramd[key]
        if (pvalue === undefined) {
            paramd[key] = defaultd[key]
        }
    }

    return paramd;
};

/**
 *  Like extend, except dictionaries get merged.
 *  This also only uses JSON-like params, functions
 *  are not copied
 */
exports.smart_extend = function (od) {
    each(slice.call(arguments, 1), function (xd) {
        if (!exports.isObject(xd)) {
            return;
        }

        for (var key in xd) {
            var xvalue = xd[key]
            var ovalue = od[key]

            if ((ovalue === null) || (ovalue === undefined)) {
                od[key] = exports.deepCopy(xvalue);
            } else if (exports.isObject(ovalue) && exports.isObject(xvalue)) {
                exports.smart_extend(ovalue, xvalue)
            } else if (xvalue === undefined) {} else if (exports.isFunction(xvalue)) {} else if (exports.isNaN(xvalue)) {} else {
                od[key] = xvalue
            }
        }
    })

    return od;
};

/**
 *  Remove any loops in the hierarchy
 *  This isn't really working yet - something wrong in the array part
 */
exports.scrub_circular = function (value, parents) {
    if (parents === undefined) {
        parents = [];
    }

    if (value === undefined) {
        return undefined;
    } else if (value === null) {
        return null;
    } else if (exports.isBoolean(value)) {
        return value;
    } else if (exports.isNumber(value)) {
        return value;
    } else if (exports.isString(value)) {
        return value;
    } else if (exports.isArray(value)) {
        // BROKEN
        if (parents.length > 5) {
            return undefined;
        }

        var nparents = parents.slice();
        nparents.push(value);

        var nvalues = [];
        for (var vi in value) {
            var ovalue = value[vi];
            var nvalue = exports.scrub_circular(ovalue, nparents);
            if (nvalue !== undefined) {
                nvalues.push(nvalue);
            }
        }

        return nvalues;
    } else if (exports.isObject(value)) {
        // BROKEN
        if (parents.length > 5) {
            return undefined;
        }

        if (parents.indexOf(value) !== -1) {
            return undefined;
        }

        var nparents = parents.slice();
        nparents.push(value);

        var nvalued = {}
        for (var okey in value) {
            var ovalue = value[okey];
            var nvalue = exports.scrub_circular(ovalue, nparents);
            if (nvalue !== undefined) {
                nvalued[okey] = nvalue;
            }
        }

        return nvalued;
    } else {
        return undefined;
    }
};

/**
 *  Get a 'code' (like a model_code) from a URL. Basically
 *  the last path component in either the hash or in the path itself
 *
 *  @param {string} iri
 *  The IRI to get the code from
 *
 *  @return {string}
 *  The code
 */
exports.iri_to_code = function (iri) {
    var urlp = node_url.parse(iri);
    if (urlp.hash && urlp.hash.length > 1) {
        return path.basename(urlp.hash.substring(1))
    } else {
        return path.basename(urlp.pathname)
    }
};

exports.dump_things = function (iot, things) {
    console.log("----")
    console.log("#things", things.length);
    for (var ti = 0; ti < things.length; ti++) {
        var thing = things[ti];
        var meta = thing.meta()

        console.log("")
        console.log("  thing#:", ti + 1);
        console.log("  name:", thing.code);
        console.log("  thing_id:", thing.thing_id());
        console.log("  thing-iri:", thing.thing_iri());
        console.log("  model-iri:", thing.model_iri());
        console.log("  place-floor:", meta.get("iot:place-floor"));
        console.log("  place-location:", meta.get("iot:place-location"));
        console.log("  place-room:", meta.get("iot:place-room"));
        console.log("  place-iri:", meta.get("iot:place"));

        if (thing.initd.tag) {
            console.log("  tags:", thing.initd.tag)
        }
    }
};

/**
 *  Convert the resut of iot.places() into a hierarchy
 */
exports.places_hierarchy = function (places) {
    var unnulled = function (s) {
        return !s ? "" : s
    }

    var ld = {}
    for (var pdi in places) {
        var placed = places[pdi]

        var plocation = unnulled(placed['iot:place-location'])
        var pd = ld[plocation]
        if (pd === undefined) {
            pd = {}
            ld[plocation] = pd
        }

        var pfloor = unnulled(placed['iot:place-floor'])
        var fd = pd[pfloor]
        if (fd === undefined) {
            fd = {}
            pd[pfloor] = fd
        }

        var proom = unnulled(placed['iot:place-room'])
        fd[proom] = placed['iot:place']
            /*

            var rd = fd[proom]
            if (rd === undefined) {
                rd = []
                fd[proom] = rd
            }

            var piri = placed['iot:place']
            rd.push(piri)
            */
    }

    return ld
};

/**
 *  Django(-ish) string formatting. Can take
 *  multiple dictionaries as arguments, priority
 *  given to the first argument seen
 *  <p>
 *  The first argument can be JSON-like objects,
 *  in which case we'll run this recursively
 */
exports.format = function () {
    if (arguments.length == 0) {
        throw "format requires at least one argument"
    }

    var template = arguments[0]

    var valueds = []
    for (var ai = 1; ai < arguments.length; ai++) {
        valueds.push(arguments[ai])
    }

    return _format(template, valueds)
};

var _format = function (template, valueds) {
    if (exports.isArray(template)) {
        var ns = []
        var os = template
        for (var oi = 0; oi < os.length; oi++) {
            var o = os[oi]
            var n = _format(o, valueds)
            ns.append(ns)
        }
    } else if (exports.isObject(template)) {
        var nd = {}
        var od = template
        for (var key in od) {
            var ovalue = od[key]
            var nvalue = _format(ovalue, valueds)
            nd[key] = nvalue
        }

        return nd
    } else if (!exports.isString(template)) {
        return template
    } else {
        return template.replace(/{{(.*?)}}/g, function (match, variable) {
            var otherwise = ""

            // we can layer in django "|" later
            var colonx = variable.indexOf(':')
            if (colonx > -1) {
                otherwise = variable.substring(colonx + 1)
                variable = variable.substring(0, colonx)
            }

            var parts = variable.replace(/ /g, '').split('.')

            var found = false;

            for (var vdi = 0; vdi < valueds.length; vdi++) {
                var valued = valueds[vdi];
                for (var pi = 0; pi < parts.length - 1; pi++) {
                    var part = parts[pi];
                    var subd = valued[part];
                    if (!exports.isObject(subd)) {
                        break;
                    }

                    valued = subd
                }

                var value = valued[parts[parts.length - 1]]
                if (value !== undefined) {
                    return "" + value
                }
            }

            return otherwise
        })

        return template
    }
};

/**
 */
exports.isThingArray = function (o) {
    if (o === undefined) {
        return false
    } else if (o === null) {
        return false
    } else if (o._instanceof_ThingArray) {
        return true
    } else {
        return false
    }
};

/**
 */
exports.isModel = function (o) {
    if (o === undefined) {
        return false
    } else if (o === null) {
        return false
    } else if (o.Model) {
        return true
    } else {
        return false
    }
};

/**
 *  Try to figure out our IP address
 */
exports.ipv4 = function () {
    var os = require('os');
    var ifaces = os.networkInterfaces();
    for (var dev in ifaces) {
        var devs = ifaces[dev]
        for (var di in devs) {
            var details = devs[di]

            if (details.family != 'IPv4') {
                continue
            }
            if (details.address == '127.0.0.1') {
                continue
            }

            return details.address
        }
    }
}

/**
 */
exports.uid = function (len) {
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    var buf = [],
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        charlen = chars.length;

    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};

