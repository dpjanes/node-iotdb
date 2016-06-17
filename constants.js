/*
 *  constants.js
 *
 *  David Janes
 *  IOTDB
 *  2015-12-25
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

const _ = require("./helpers");

exports.schema_name = _.ld.expand("schema:name");
exports.schema_description = _.ld.expand("schema:description");

exports.iot_Model = _.ld.expand("iot:Model");
exports.iot_Attribute = _.ld.expand("iot:Attribute");

exports.iot_attribute = _.ld.expand("iot:attribute");
exports.iot_help = _.ld.expand("iot:help");
exports.iot_type = _.ld.expand("iot:type");
exports.iot_unit = _.ld.expand("iot:unit");
exports.iot_purpose = _.ld.expand("iot:purpose");
exports.iot_format = _.ld.expand("iot:format");
exports.iot_enumeration = _.ld.expand("iot:enumeration");
exports.iot_facet = _.ld.expand("iot:facet");
exports.iot_measuring = _.ld.expand("iot:measuring");
exports.iot_vector = _.ld.expand("iot:vector");

exports.iot_reachable = _.ld.expand('iot:reachable');
exports.iot_thing_id = _.ld.expand('iot:thing-id');
exports.iot_thing = _.ld.expand('iot:thing');
exports.iot_model_id = _.ld.expand('iot:model-id');

exports.iot_boolean = _.ld.expand("iot:type.boolean");
exports.iot_integer = _.ld.expand("iot:type.integer");
exports.iot_number = _.ld.expand("iot:type.number");
exports.iot_string = _.ld.expand("iot:type.string");
exports.iot_null = _.ld.expand("iot:type.null");
exports.iot_set = _.ld.expand("iot:type.set");
exports.iot_list = _.ld.expand("iot:type.list");

exports.iot_minimum = _.ld.expand("iot:minimum");
exports.iot_maximum = _.ld.expand("iot:maximum");

exports.iot_read = _.ld.expand("iot:read");
exports.iot_write = _.ld.expand("iot:write");

exports.iot_actuator = _.ld.expand("iot:actuator");
exports.iot_sensor = _.ld.expand("iot:sensor");

exports.iot_clear_value = _.ld.expand("iot:clear-value");

exports.iot_color = _.ld.expand("iot:format.color");
exports.iot_iri = _.ld.expand("iot:format.iri");
exports.iot_time = _.ld.expand("iot:format.time");
exports.iot_date = _.ld.expand("iot:format.date");
exports.iot_datetime = _.ld.expand("iot:format.datetime");
