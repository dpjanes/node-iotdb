/*
 *  homestar.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-02-03
 *
 *  HomeStar related functions in IOTDB
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

var _ = require('./helpers');


/**
 *  Really HomeStar related, but having them in 
 *  IOTDB makes debugging projects a lot easier
 */
var _group_default = "My Cookbook";
var _cookbook_name = _group_default;
var _cookbook_id;

var recipe = function (initd) {
    if (_cookbook_name && !initd.group) {
        initd.group = _cookbook_name;
    }
    if (_cookbook_id && !initd.cookbook_id) {
        initd.cookbook_id = _cookbook_id;
    }

    exports.iot().data("recipe", initd);
};

var cookbook = function (cookbook_name, cookbook_id) {
    if (cookbook_name) {
        _cookbook_name = cookbook_name;
    } else {
        _cookbook_name = _group_default;
    }

    if (cookbook_id) {
        _cookbook_id = cookbook_id;
    }
};

/**
 *  At a minimum, this will run everything
 *  in iotdb-recipes
 */
var load_recipes = function (initd) {
    try {
        exports.module('iotdb-recipes').load_recipes(initd);
    } catch (x) {
        logger.error({
            method: "load_recipes",
            error: _.error.message(x),
            cause: "likely you need to do $ homestar install iotdb-recipes",
            stack: x.stack,
        }, "recipes could not be initialized");
    }
};

/**
 *  API
 */
exports.recipe = recipe;
exports.cookbook = cookbook;
exports.load_recipes = load_recipes;
