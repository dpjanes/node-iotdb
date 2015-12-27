/*
 *  definitions.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-01-17
 *
 *  Precooked definitions
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

var iotdb = require('../../iotdb');
var a = require('./attribute');

/*
 *  Version 0.4 - explicit declarations
 *
 *  These are all available in IOTDB as a top
 *  level export (i.e. iotdb.boolean.mute)
 */
var attribute = {};
exports.attribute = attribute;

/* boolean */
attribute.boolean = a.make_boolean(":value");
attribute.boolean.value = a.make_boolean(":value");
attribute.boolean.on = a.make_boolean(":on");
attribute.boolean.mute = a.make_boolean(":mute");
attribute.boolean.flag = a.make_boolean(":flag");

/* integer */
attribute.integer = a.make_integer(":value")
attribute.integer.value = a.make_integer(":value")
attribute.integer.percent = a.make_integer(":value")
    .minimum(0)
    .maximum(100)
    .unit("iot-unit:math.fraction.percent");
attribute.integer.percent.volume = a.make_integer(":volume")
    .minimum(0)
    .maximum(100)
    .unit("iot-unit:math.fraction.percent");
attribute.integer.channel = a.make_integer(":value")
    .minimum(1);
attribute.integer.temperature = a.make_integer(":temperature");
attribute.integer.temperature.celsius = a.make_integer(":temperature")
    .unit("iot-unit:temperature.si.celsius");
attribute.integer.fahrenheit = a.make_integer(":temperature")
    .unit("iot-unit:temperature.imperial.fahrenheit");

/* numbers */
attribute.number = a.make_number(":value");
attribute.number.value = a.make_number(":value");
attribute.number.temperature = a.make_number(":temperature");
attribute.number.temperature.celsius = a.make_number(":temperature")
    .unit("iot-unit:temperature.si.celsius");
attribute.number.fahrenheit = a.make_number(":temperature")
    .unit("iot-unit:temperature.imperial.fahrenheit");
attribute.number.temperature.kelvin = a.make_number(":temperature")
    .unit("iot-unit:temperature.si.kelvin");

attribute.number.frequency = a.make_number(":frequency")
    .unit("iot-unit:math.si.hertz");
attribute.number.duration = a.make_number(":duration")
    .unit("iot-unit:math.si.second");

attribute.number.percent = a.make_percent(":value")
attribute.number.percent.volume = a.make_percent(":volume")
attribute.number.percent.brightness = a.make_percent(":brightness")

attribute.number.unit = a.make_unit(":value");
attribute.number.unit.volume = a.make_unit(":volume");
attribute.number.unit.brightness = a.make_unit(":brightness");

/* strings */
attribute.string = a.make_string(":value");
attribute.string.value = a.make_string(":value");
attribute.string.iri = a.make_iri(":iri");
attribute.string.iri.image = a.make_iri(":iri.image");
attribute.string.color = a.make_color(":color");
attribute.color = a.make_color(":color");
attribute.string.band = a.make_string(":band");
attribute.string.message = {};
attribute.string.message.text = a.make_string(":message.text");
attribute.string.message.html = a.make_string(":message.html");

attribute.datetime = a.make_datetime(":when")
attribute.datetime.start = a.make_datetime(":when-start")
attribute.datetime.end = a.make_datetime(":when-end")
attribute.datetime.timestamp = a.make_datetime(":timestamp")
attribute.datetime.date = a.make_date(":when")
attribute.datetime.time = a.make_time(":when");

/* vectors */
attribute.vector = {};
attribute.vector.number = {};
attribute.vector.number.xy = {
    x: a.make_number(':plane.x').vector("x/y"),
    y: a.make_number(':plane.y').vector("x/y"),
};
attribute.vector.number.xyz = {
    x: a.make_number(':plane.x').vector("x/y/z"),
    y: a.make_number(':plane.y').vector("x/y/z"),
    z: a.make_number(':plane.z').vector("x/y/z"),
};
attribute.vector.number.axes = {
    roll: a.make_number(':plane.roll').vector("roll/pitch/yaw"),
    pitch: a.make_number(':plane.pitch').vector("roll/pitch/yaw"),
    yaw: a.make_number(':plane.yaw').vector("roll/pitch/yaw"),
};
attribute.vector.number.ll = {
    latitude: a
        .make_number(':latitude')
        .unit("iot-unit:math.angle.degree")
        .minimum(-90)
        .maximum(90)
        .vector("lat/lon"),
    longitude: a
        .make_number(':longitude')
        .unit("iot-unit:math.angle.degree")
        .minimum(-180)
        .maximum(180)
        .vector("lat/lon"),
};
attribute.vector.number.lle = {
    latitude: a
        .make_number(':latitude')
        .unit("iot-unit:math.angle.degree")
        .minimum(-90)
        .maximum(90)
        .vector("lat/lon/altitude"),
    longitude: a
        .make_number(':longitude')
        .unit("iot-unit:math.angle.degree")
        .minimum(-180)
        .maximum(180)
        .vector("lat/lon/altitude"),
    elevation: a
        .make_number(':altitude')
        .vector("lat/lon/altitude"),
};

/* sensors */
attribute.sensor = {};

/* sensor: numbers */
attribute.sensor.number = a.make_number(':sensor')
attribute.sensor.number.battery = a.make_number(':sensor.battery')
attribute.sensor.number.fire = a.make_number(':sensor.fire');
attribute.sensor.number.heat = a.make_number(':sensor.heat');
attribute.sensor.number.smoke = a.make_number(':sensor.smoke');
attribute.sensor.number.chemical = a.make_number(':sensor.chemical');
attribute.sensor.number.chemical.co2 = a.make_number(':sensor.chemical.carbon-dioxide');
attribute.sensor.number.chemical.co = a.make_number(':sensor.chemical.carbon-monoxide');
attribute.sensor.number.contact = a.make_number(':sensor.contact');
attribute.sensor.number.motion = a.make_number(':sensor.motion');
attribute.sensor.number.open = a.make_number(':sensor.open');
attribute.sensor.number.presence = a.make_number(':sensor.presence');
attribute.sensor.number.particulates = a.make_number(':sensor.particulates');
attribute.sensor.number.shatter = a.make_number(':sensor.shatter');
attribute.sensor.number.temperature = a.make_number(":sensor.temperature")
attribute.sensor.number.temperature.celsius = a.make_number(":sensor.temperature")
    .unit("iot-unit:temperature.si.celsius");
attribute.sensor.number.temperature.fahrenheit = a.make_number(":sensor.temperature")
    .unit("iot-unit:temperature.imperial.fahrenheit");
attribute.sensor.number.temperature.kelvin = a.make_number(":sensor.temperature")
    .unit("iot-unit:temperature.si.kelvin");
attribute.sensor.number.humidty = a.make_number(':sensor.humidty');
attribute.sensor.number.sound = a.make_number(':sensor.sound');
attribute.sensor.number.water = a.make_number(':sensor.water');
attribute.sensor.number.humidity = a.make_number(':sensor.humidity')

/* sensor: booleans */
attribute.sensor.boolean = a.make_boolean(':sensor')
attribute.sensor.boolean.battery = a.make_boolean(':sensor.battery')
attribute.sensor.boolean.fire = a.make_boolean(':sensor.fire');
attribute.sensor.boolean.heat = a.make_boolean(':sensor.heat');
attribute.sensor.boolean.smoke = a.make_boolean(':sensor.smoke');
attribute.sensor.boolean.chemical = a.make_boolean(':sensor.chemical');
attribute.sensor.boolean.chemical.co2 = a.make_boolean(':sensor.chemical.carbon-dioxide');
attribute.sensor.boolean.chemical.co = a.make_boolean(':sensor.chemical.carbon-monoxide');
attribute.sensor.boolean.contact = a.make_boolean(':sensor.contact');
attribute.sensor.boolean.connected = a.make_boolean(':sensor.connected');
attribute.sensor.boolean.motion = a.make_boolean(':sensor.motion');
attribute.sensor.boolean.open = a.make_boolean(':sensor.open');
attribute.sensor.boolean.presence = a.make_boolean(':sensor.presence');
attribute.sensor.boolean.particulates = a.make_boolean(':sensor.particulates');
attribute.sensor.boolean.shatter = a.make_boolean(':sensor.shatter');
attribute.sensor.boolean.temperature = a.make_boolean(":sensor.temperature")
attribute.sensor.boolean.humidty = a.make_boolean(':sensor.humidty');
attribute.sensor.boolean.sound = a.make_boolean(':sensor.sound');
attribute.sensor.boolean.water = a.make_boolean(':sensor.water');
attribute.sensor.boolean.humidity = a.make_boolean(':sensor.humidity')

/* sensor: unit (0-1) */
attribute.sensor.unit = a.make_unit(':sensor')
attribute.sensor.unit.battery = a.make_unit(':sensor.battery')
attribute.sensor.unit.fire = a.make_unit(':sensor.fire');
attribute.sensor.unit.heat = a.make_unit(':sensor.heat');
attribute.sensor.unit.smoke = a.make_unit(':sensor.smoke');
attribute.sensor.unit.chemical = a.make_unit(':sensor.chemical');
attribute.sensor.unit.chemical.co2 = a.make_unit(':sensor.chemical.carbon-dioxide');
attribute.sensor.unit.chemical.co = a.make_unit(':sensor.chemical.carbon-monoxide');
attribute.sensor.unit.contact = a.make_unit(':sensor.contact');
attribute.sensor.unit.motion = a.make_unit(':sensor.motion');
attribute.sensor.unit.open = a.make_unit(':sensor.open');
attribute.sensor.unit.presence = a.make_unit(':sensor.presence');
attribute.sensor.unit.particulates = a.make_unit(':sensor.particulates');
attribute.sensor.unit.shatter = a.make_unit(':sensor.shatter');
attribute.sensor.unit.temperature = a.make_unit(":sensor.temperature")
attribute.sensor.unit.humidty = a.make_unit(':sensor.humidty');
attribute.sensor.unit.sound = a.make_unit(':sensor.sound');
attribute.sensor.unit.water = a.make_unit(':sensor.water');
attribute.sensor.unit.humidity = a.make_unit(':sensor.humidity')

/* sensor: percent (0-100) */
attribute.sensor.percent = a.make_percent(':sensor')
attribute.sensor.percent.battery = a.make_percent(':sensor.battery')
attribute.sensor.percent.fire = a.make_percent(':sensor.fire');
attribute.sensor.percent.heat = a.make_percent(':sensor.heat');
attribute.sensor.percent.smoke = a.make_percent(':sensor.smoke');
attribute.sensor.percent.chemical = a.make_percent(':sensor.chemical');
attribute.sensor.percent.chemical.co2 = a.make_percent(':sensor.chemical.carbon-dioxide');
attribute.sensor.percent.chemical.co = a.make_percent(':sensor.chemical.carbon-monoxide');
attribute.sensor.percent.contact = a.make_percent(':sensor.contact');
attribute.sensor.percent.motion = a.make_percent(':sensor.motion');
attribute.sensor.percent.open = a.make_percent(':sensor.open');
attribute.sensor.percent.presence = a.make_percent(':sensor.presence');
attribute.sensor.percent.particulates = a.make_percent(':sensor.particulates');
attribute.sensor.percent.shatter = a.make_percent(':sensor.shatter');
attribute.sensor.percent.temperature = a.make_percent(":sensor.temperature")
attribute.sensor.percent.humidty = a.make_percent(':sensor.humidty');
attribute.sensor.percent.sound = a.make_percent(':sensor.sound');
attribute.sensor.percent.water = a.make_percent(':sensor.water');
attribute.sensor.percent.humidity = a.make_percent(':sensor.humidity')

/* sensor: string */
attribute.sensor.string = a.make_string(':sensor')
attribute.sensor.string.battery = a.make_string(':sensor.battery')
attribute.sensor.string.fire = a.make_string(':sensor.fire');
attribute.sensor.string.heat = a.make_string(':sensor.heat');
attribute.sensor.string.smoke = a.make_string(':sensor.smoke');
attribute.sensor.string.chemical = a.make_string(':sensor.chemical');
attribute.sensor.string.chemical.co2 = a.make_string(':sensor.chemical.carbon-dioxide');
attribute.sensor.string.chemical.co = a.make_string(':sensor.chemical.carbon-monoxide');
attribute.sensor.string.contact = a.make_string(':sensor.contact');
attribute.sensor.string.motion = a.make_string(':sensor.motion');
attribute.sensor.string.open = a.make_string(':sensor.open');
attribute.sensor.string.presence = a.make_string(':sensor.presence');
attribute.sensor.string.particulates = a.make_string(':sensor.particulates');
attribute.sensor.string.shatter = a.make_string(':sensor.shatter');
attribute.sensor.string.temperature = a.make_string(":sensor.temperature")
attribute.sensor.string.humidty = a.make_string(':sensor.humidty');
attribute.sensor.string.sound = a.make_string(':sensor.sound');
attribute.sensor.string.water = a.make_string(':sensor.water');
attribute.sensor.string.humidity = a.make_string(':sensor.humidity')
