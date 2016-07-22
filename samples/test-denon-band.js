/*
 *  test-denon-band.js
 *
 *  David Janes
 *  IOTDB.org
 *  2016-07-22
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

const iotdb = require("../iotdb")
const _ = iotdb._;

iotdb.use("homestar-denon-avr");

const things = iotdb.connect("DenonAVR");

const bands = [
    "iot-purpose:band.bluray",
    "iot-purpose:band.game",
    "iot-purpose:band.cable",
    "iot-purpose:band.dvd",
]

things.on('istate', function (thing) {
    console.log("+ istate\n ", thing.thing_id(), "\n ", thing.state("istate"));
});
things.on("meta", function (thing) {
    console.log("+ meta\n ", thing.thing_id(), thing.state("meta"));
});
things.on("thing", function (thing) {
    console.log("+ thing\n ", thing.thing_id(), thing.state("meta"), things._sid);

    let count = 0;
    setInterval(() => {
        thing.set(":band", bands[count++ % bands.length], 2000)
            .then((ud) => {
                console.log("+", "update", ud);
            })
            .catch(error => {
                console.log("#", _.error.message(error));
            });
    }, 1000);
});
