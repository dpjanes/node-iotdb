/*
 *  definitions.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-01-17
 *
 *  Precooked definitions
 *
 *  Copyright [2013-2015] [David P. Janes]
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

var iotdb = require('iotdb')

/*
 *  Version 0.4 - explicit declarations
 *
 *  These are all available in IOTDB as a top
 *  level export (i.e. iotdb.boolean.mute)
 */
var attribute = {};
exports.attribute = attribute;

/* boolean */
attribute.boolean = iotdb.make_boolean(":value");
attribute.boolean.on = iotdb.make_boolean(":on");
attribute.boolean.mute = iotdb.make_boolean(":mute");
attribute.boolean.flag = iotdb.make_boolean(":flag");

/* integer */
attribute.integer = iotdb.make_integer(":value")
attribute.integer.percent = iotdb.make_integer(":value")
    .minimum(0)
    .maximum(100)
    .unit("iot-unit:math.fraction.percent");
attribute.integer.percent.volume = iotdb.make_integer(":volume")
    .minimum(0)
    .maximum(100)
    .unit("iot-unit:math.fraction.percent");
attribute.integer.channel = iotdb.make_integer(":value")
    .minimum(1);
attribute.integer.temperature = iotdb.make_integer(":temperature");
attribute.integer.temperature.celsius = iotdb.make_integer(":temperature")
    .unit("iot-unit:temperature.si.celsius");
attribute.integer.fahrenheit = iotdb.make_integer(":temperature")
    .unit("iot-unit:temperature.imperial.fahrenheit");

/* numbers */
attribute.number = iotdb.make_number(":value");
attribute.number.temperature = iotdb.make_number(":temperature");
attribute.number.temperature.celsius = iotdb.make_number(":temperature")
    .unit("iot-unit:temperature.si.celsius");
attribute.number.fahrenheit = iotdb.make_number(":temperature")
    .unit("iot-unit:temperature.imperial.fahrenheit");
attribute.number.temperature.kelvin = iotdb.make_number(":temperature")
    .unit("iot-unit:temperature.si.kelvin");

attribute.number.frequency = iotdb.make_number(":frequency")
    .unit("iot-unit:math.si.hertz");
attribute.number.duration = iotdb.make_number(":duration")
    .unit("iot-unit:math.si.second");

attribute.number.percent = iotdb.make_percent(":value")
attribute.number.percent.volume = iotdb.make_percent(":volume")
attribute.number.percent.brightness = iotdb.make_percent(":brightness")

attribute.number.unit = iotdb.make_unit(":value");
attribute.number.unit.volume = iotdb.make_unit(":volume");
attribute.number.unit.brightness = iotdb.make_unit(":brightness");

/* strings */
attribute.string = iotdb.make_string(":value");
attribute.string.iri = iotdb.make_iri(":iri");
attribute.string.color = iotdb.make_color(":color");
attribute.color = iotdb.make_color(":color");
attribute.string.band = iotdb.make_string(":band");
attribute.string.message = {};
attribute.string.message.text = iotdb.make_string(":message.text");
attribute.string.message.html = iotdb.make_string(":message.html");

attribute.datetime = iotdb.make_datetime(":when")
attribute.datetime.timestamp = iotdb.make_datetime(":timestamp")
attribute.datetime.date = iotdb.make_date(":when")
attribute.datetime.time = iotdb.make_time(":when");

/* vectors */
attribute.vector = {};
attribute.vector.number = {};
attribute.vector.number.xy = {
    x: iotdb.make_number(':plane.x').vector("x/y"),
    y: iotdb.make_number(':plane.y').vector("x/y"),
};
attribute.vector.number.xyz = {
    x: iotdb.make_number(':plane.x').vector("x/y/z"),
    y: iotdb.make_number(':plane.y').vector("x/y/z"),
    z: iotdb.make_number(':plane.z').vector("x/y/z"),
};
attribute.vector.number.axes = {
    roll: iotdb.make_number(':plane.roll').vector("roll/pitch/yaw"),
    pitch: iotdb.make_number(':plane.pitch').vector("roll/pitch/yaw"),
    yaw: iotdb.make_number(':plane.yaw').vector("roll/pitch/yaw"),
};
attribute.vector.number.ll = {
    latitude: iotdb
        .make_number(':latitude')
        .unit("iot-unit:math.angle.degree")
        .minimum(-90)
        .maximum(90)
        .vector("lat/lon"),
    longitude: iotdb
        .make_number(':longitude')
        .unit("iot-unit:math.angle.degree")
        .minimum(-180)
        .maximum(180)
        .vector("lat/lon"),
};
attribute.vector.number.lle = {
    latitude: iotdb
        .make_number(':latitude')
        .unit("iot-unit:math.angle.degree")
        .minimum(-90)
        .maximum(90)
        .vector("lat/lon/altitude"),
    longitude: iotdb
        .make_number(':longitude')
        .unit("iot-unit:math.angle.degree")
        .minimum(-180)
        .maximum(180)
        .vector("lat/lon/altitude"),
    elevation: iotdb
        .make_number(':altitude')
        .vector("lat/lon/altitude"),
};

/* sensors */
attribute.sensor = {};

/* sensor: numbers */
attribute.sensor.number = iotdb.make_number(':sensor')
attribute.sensor.number.battery = iotdb.make_number(':sensor.battery')
attribute.sensor.number.fire = iotdb.make_number(':sensor.fire');
attribute.sensor.number.heat = iotdb.make_number(':sensor.heat');
attribute.sensor.number.smoke = iotdb.make_number(':sensor.smoke');
attribute.sensor.number.chemical = iotdb.make_number(':sensor.chemical');
attribute.sensor.number.chemical.co2 = iotdb.make_number(':sensor.chemical.carbon-dioxide');
attribute.sensor.number.chemical.co = iotdb.make_number(':sensor.chemical.carbon-monoxide');
attribute.sensor.number.contact = iotdb.make_number(':sensor.contact');
attribute.sensor.number.motion = iotdb.make_number(':sensor.motion');
attribute.sensor.number.open = iotdb.make_number(':sensor.open');
attribute.sensor.number.presence = iotdb.make_number(':sensor.presence');
attribute.sensor.number.particulates = iotdb.make_number(':sensor.particulates');
attribute.sensor.number.shatter = iotdb.make_number(':sensor.shatter');
attribute.sensor.number.temperature = iotdb.make_number(":sensor.temperature")
attribute.sensor.number.temperature.celsius = iotdb.make_number(":sensor.temperature")
    .unit("iot-unit:temperature.si.celsius");
attribute.sensor.number.temperature.fahrenheit = iotdb.make_number(":sensor.temperature")
    .unit("iot-unit:temperature.imperial.fahrenheit");
attribute.sensor.number.temperature.kelvin = iotdb.make_number(":sensor.temperature")
    .unit("iot-unit:temperature.si.kelvin");
attribute.sensor.number.humidty = iotdb.make_number(':sensor.humidty');
attribute.sensor.number.sound = iotdb.make_number(':sensor.sound');
attribute.sensor.number.water = iotdb.make_number(':sensor.water');
attribute.sensor.number.humidity = iotdb.make_number(':sensor.humidity')

/* sensor: booleans */
attribute.sensor.boolean = iotdb.make_boolean(':sensor')
attribute.sensor.boolean.battery = iotdb.make_boolean(':sensor.battery')
attribute.sensor.boolean.fire = iotdb.make_boolean(':sensor.fire');
attribute.sensor.boolean.heat = iotdb.make_boolean(':sensor.heat');
attribute.sensor.boolean.smoke = iotdb.make_boolean(':sensor.smoke');
attribute.sensor.boolean.chemical = iotdb.make_boolean(':sensor.chemical');
attribute.sensor.boolean.chemical.co2 = iotdb.make_boolean(':sensor.chemical.carbon-dioxide');
attribute.sensor.boolean.chemical.co = iotdb.make_boolean(':sensor.chemical.carbon-monoxide');
attribute.sensor.boolean.contact = iotdb.make_boolean(':sensor.contact');
attribute.sensor.boolean.connected = iotdb.make_boolean(':sensor.connected');
attribute.sensor.boolean.motion = iotdb.make_boolean(':sensor.motion');
attribute.sensor.boolean.open = iotdb.make_boolean(':sensor.open');
attribute.sensor.boolean.presence = iotdb.make_boolean(':sensor.presence');
attribute.sensor.boolean.particulates = iotdb.make_boolean(':sensor.particulates');
attribute.sensor.boolean.shatter = iotdb.make_boolean(':sensor.shatter');
attribute.sensor.boolean.temperature = iotdb.make_boolean(":sensor.temperature")
attribute.sensor.boolean.humidty = iotdb.make_boolean(':sensor.humidty');
attribute.sensor.boolean.sound = iotdb.make_boolean(':sensor.sound');
attribute.sensor.boolean.water = iotdb.make_boolean(':sensor.water');
attribute.sensor.boolean.humidity = iotdb.make_boolean(':sensor.humidity')

/* sensor: unit (0-1) */
attribute.sensor.unit = iotdb.make_unit(':sensor')
attribute.sensor.unit.battery = iotdb.make_unit(':sensor.battery')
attribute.sensor.unit.fire = iotdb.make_unit(':sensor.fire');
attribute.sensor.unit.heat = iotdb.make_unit(':sensor.heat');
attribute.sensor.unit.smoke = iotdb.make_unit(':sensor.smoke');
attribute.sensor.unit.chemical = iotdb.make_unit(':sensor.chemical');
attribute.sensor.unit.chemical.co2 = iotdb.make_unit(':sensor.chemical.carbon-dioxide');
attribute.sensor.unit.chemical.co = iotdb.make_unit(':sensor.chemical.carbon-monoxide');
attribute.sensor.unit.contact = iotdb.make_unit(':sensor.contact');
attribute.sensor.unit.motion = iotdb.make_unit(':sensor.motion');
attribute.sensor.unit.open = iotdb.make_unit(':sensor.open');
attribute.sensor.unit.presence = iotdb.make_unit(':sensor.presence');
attribute.sensor.unit.particulates = iotdb.make_unit(':sensor.particulates');
attribute.sensor.unit.shatter = iotdb.make_unit(':sensor.shatter');
attribute.sensor.unit.temperature = iotdb.make_unit(":sensor.temperature")
attribute.sensor.unit.humidty = iotdb.make_unit(':sensor.humidty');
attribute.sensor.unit.sound = iotdb.make_unit(':sensor.sound');
attribute.sensor.unit.water = iotdb.make_unit(':sensor.water');
attribute.sensor.unit.humidity = iotdb.make_unit(':sensor.humidity')

/* sensor: percent (0-100) */
attribute.sensor.percent = iotdb.make_percent(':sensor')
attribute.sensor.percent.battery = iotdb.make_percent(':sensor.battery')
attribute.sensor.percent.fire = iotdb.make_percent(':sensor.fire');
attribute.sensor.percent.heat = iotdb.make_percent(':sensor.heat');
attribute.sensor.percent.smoke = iotdb.make_percent(':sensor.smoke');
attribute.sensor.percent.chemical = iotdb.make_percent(':sensor.chemical');
attribute.sensor.percent.chemical.co2 = iotdb.make_percent(':sensor.chemical.carbon-dioxide');
attribute.sensor.percent.chemical.co = iotdb.make_percent(':sensor.chemical.carbon-monoxide');
attribute.sensor.percent.contact = iotdb.make_percent(':sensor.contact');
attribute.sensor.percent.motion = iotdb.make_percent(':sensor.motion');
attribute.sensor.percent.open = iotdb.make_percent(':sensor.open');
attribute.sensor.percent.presence = iotdb.make_percent(':sensor.presence');
attribute.sensor.percent.particulates = iotdb.make_percent(':sensor.particulates');
attribute.sensor.percent.shatter = iotdb.make_percent(':sensor.shatter');
attribute.sensor.percent.temperature = iotdb.make_percent(":sensor.temperature")
attribute.sensor.percent.humidty = iotdb.make_percent(':sensor.humidty');
attribute.sensor.percent.sound = iotdb.make_percent(':sensor.sound');
attribute.sensor.percent.water = iotdb.make_percent(':sensor.water');
attribute.sensor.percent.humidity = iotdb.make_percent(':sensor.humidity')

/* sensor: string */
attribute.sensor.string = iotdb.make_string(':sensor')
attribute.sensor.string.battery = iotdb.make_string(':sensor.battery')
attribute.sensor.string.fire = iotdb.make_string(':sensor.fire');
attribute.sensor.string.heat = iotdb.make_string(':sensor.heat');
attribute.sensor.string.smoke = iotdb.make_string(':sensor.smoke');
attribute.sensor.string.chemical = iotdb.make_string(':sensor.chemical');
attribute.sensor.string.chemical.co2 = iotdb.make_string(':sensor.chemical.carbon-dioxide');
attribute.sensor.string.chemical.co = iotdb.make_string(':sensor.chemical.carbon-monoxide');
attribute.sensor.string.contact = iotdb.make_string(':sensor.contact');
attribute.sensor.string.motion = iotdb.make_string(':sensor.motion');
attribute.sensor.string.open = iotdb.make_string(':sensor.open');
attribute.sensor.string.presence = iotdb.make_string(':sensor.presence');
attribute.sensor.string.particulates = iotdb.make_string(':sensor.particulates');
attribute.sensor.string.shatter = iotdb.make_string(':sensor.shatter');
attribute.sensor.string.temperature = iotdb.make_string(":sensor.temperature")
attribute.sensor.string.humidty = iotdb.make_string(':sensor.humidty');
attribute.sensor.string.sound = iotdb.make_string(':sensor.sound');
attribute.sensor.string.water = iotdb.make_string(':sensor.water');
attribute.sensor.string.humidity = iotdb.make_string(':sensor.humidity')
