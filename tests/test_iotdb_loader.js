/*
 *  test_iotdb_load_model.js
 *
 *  David Janes
 *  IOTDB
 *  2014-02-14
 *
 *  Test loading models from IOTDB
 */

"use strict";

var assert = require("assert")

var iotdb = require("iotdb")
var _ = require("../helpers")

var CLOCK_FILE = __dirname + "/data/abstract-clock.jsonld"
var CLOCK_IRI = "file:///abstract-clock"
var CLOCK_WHEN_IRI = CLOCK_IRI + "#when-instant"

var OVEN_FILE = __dirname + "/data/abstract-stove-oven.jsonld"
var OVEN_IRI = "file:///abstract-stove-oven"
var OVEN_TEMPERATURE_C_IRI = OVEN_IRI + "#temperature_c"

var iotd = {
    auto_iotdb_device_get: false,
    iotdb_nedb: null
}

/* --- tests --- */
describe('test_iotdb_load_model:', function(){
    describe('clock:', function(){
        it('loads the model into the graph', function(done){
            var iot = new iotdb.IOT(iotd)
            iot.on(iotdb.EVENT_UPDATED_MODEL, function(iri) {
                assert.strictEqual(iri, CLOCK_IRI);
                assert.ok(iot.gm.has_subject(CLOCK_IRI))
                assert.ok(iot.gm.has_subject(CLOCK_WHEN_IRI))

                done()
                // console.log(iot.gm.graph)
            })

            iot.on_ready(function() {
                iot.gm.load_file(CLOCK_FILE)
            })
        })
        it('data looks correct', function(done){
            var iot = new iotdb.IOT(iotd)
            iot.on(iotdb.EVENT_UPDATED_MODEL, function(iri) {
                var clockd = { 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'iot:model',
                  'iot:attribute': 'file:///abstract-clock#when-instant',
                  'iot:name': 'abstract-clock' }
                var whend = { 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'iot:attribute',
                  'iot:purpose': 'iot-attribute:when-instant',
                  'iot-js:format': 'iot-js:datetime',
                  'iot-js:type': 'iot-js:string' }

                assert.ok(_.equals(clockd, iot.gm.get_dictionary(CLOCK_IRI)))
                assert.ok(_.equals(whend, iot.gm.get_dictionary(CLOCK_WHEN_IRI)))

                done()
            })

            iot.on_ready(function() {
                iot.gm.load_file(CLOCK_FILE)
            })
        })
        it('attribute serializes correctly', function(done){
            var iot = new iotdb.IOT(iotd)
            iot.on(iotdb.EVENT_UPDATED_MODEL, function(iri) {
                var attributed = { '@type': 'https://iotdb.org/pub/iot#attribute',
                  '@id': '#when-instant',
                  'https://iotdb.org/pub/iot#purpose': 'https://iotdb.org/pub/iot-attribute#when-instant',
                  'https://iotdb.org/pub/iot-js#format': 'https://iotdb.org/pub/iot-js#datetime',
                  'https://iotdb.org/pub/iot-js#type': 'https://iotdb.org/pub/iot-js#string' }

                // _.equals doesn't work for us because javascriptsuck
                var attribute = iot._build_attribute(CLOCK_WHEN_IRI)
                for (var key in attributed) {
                    var v_a = attributed[key]
                    var v_b = attribute[key]

                    assert.strictEqual(v_a, v_b)
                }

                done()
            })

            iot.on_ready(function() {
                iot.gm.load_file(CLOCK_FILE)
            })
        })
        it('model serializes correctly', function(done){
            var iot = new iotdb.IOT(iotd)
            iot.on(iotdb.EVENT_UPDATED_MODEL, function(iri) {
                var model = iot._build_model(CLOCK_IRI)
                assert.ok(_.isFunction(model))
                // console.log(iot.gm.graph)

                // at this point we have a thing we can test conventionally
                var thing = new model()
                assert.strictEqual(null, thing.get('iot-attribute:when-instant'))
                assert.ok(_.equals({ 'when-instant': null }, thing.stated))

                // setting to garbage
                thing.set('when-instant', 'a')
                assert.strictEqual(null, thing.get('iot-attribute:when-instant'))

                // setting to a valid value
                thing.set('when-instant', "2014-02-14T05:00:00.000Z")
                assert.strictEqual("2014-02-14T05:00:00.000Z", thing.get('iot-attribute:when-instant'))

                // console.log(thing.stated)
                done()
            })

            iot.on_ready(function() {
                iot.gm.load_file(CLOCK_FILE)
            })
        })
    })



/*
    describe('oven:', function(){
        it('loads the model into the graph', function(done){
            var iot = new iotdb.IOT(iotd)
            iot.on(iotdb.EVENT_UPDATED_MODEL, function(iri) {
                assert.strictEqual(iri, OVEN_IRI);
                assert.ok(iot.gm.has_subject(OVEN_IRI))
                assert.ok(iot.gm.has_subject(OVEN_TEMPERATURE_C_IRI))

                done()
            })

            iot.on_ready(function() {
                iot.gm.load_file(OVEN_FILE)
            })
        })
        it('data looks correct', function(done){
            var iot = new iotdb.IOT(iotd)
            iot.on(iotdb.EVENT_UPDATED_MODEL, function(iri) {
                // Oven
                var oven_got = iot.gm.get_dictionary(OVEN_IRI, {
                    as_list: true
                })
                delete oven_got['iot-iotdb:model-validator']
                var oven_expect = {
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'iot:model',
                    'iot:attribute': [
                        'file:///abstract-stove-oven#on',
                        'file:///abstract-stove-oven#temperature_f',
                        'file:///abstract-stove-oven#temperature_c',
                        'file:///abstract-stove-oven#reading_c',
                        'file:///abstract-stove-oven#reading_f' ],
                    'iot:name': 'abstract-stove-oven'
                }
                assert.ok(_.equals(oven_got, oven_expect))

                // Temperature
                var temperature_got = iot.gm.get_dictionary(OVEN_TEMPERATURE_C_IRI, {
                    as_list: true
                })
                var temperature_expect = { 'iot-js:minimum': 0,
                    'iot-js:maximum': 260,
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'iot:attribute',
                    'iot:purpose': 'iot-attribute:temperature',
                    'iot:unit': 'iot-unit:temperature.si.celsius',
                    'iot-js:type': 'iot-js:integer'
                }
                assert.ok(_.equals(temperature_got, temperature_expect))

                done()
            })

            iot.on_ready(function() {
                iot.gm.load_file(OVEN_FILE)
            })
        })
        it('attribute serializes correctly', function(done){
            var iot = new iotdb.IOT(iotd)
            iot.on(iotdb.EVENT_UPDATED_MODEL, function(iri) {
                var attributed = { '@type': 'https://iotdb.org/pub/iot#attribute',
                  '@id': '#temperature_c',
                  'https://iotdb.org/pub/iot-js#minimum': 0,
                  'https://iotdb.org/pub/iot-js#maximum': 260,
                  'https://iotdb.org/pub/iot#purpose': 'https://iotdb.org/pub/iot-attribute#temperature',
                  'https://iotdb.org/pub/iot#unit': 'https://iotdb.org/pub/iot-unit#temperature.si.celsius',
                  'https://iotdb.org/pub/iot-js#type': 'https://iotdb.org/pub/iot-js#integer' }


                // _.equals doesn't work for us because javascriptsuck
                var attribute = iot._build_attribute(OVEN_TEMPERATURE_C_IRI)
                for (var key in attributed) {
                    var v_a = attributed[key]
                    var v_b = attribute[key]

                    assert.strictEqual(v_a, v_b)
                }

                done()
            })

            iot.on_ready(function() {
                iot.gm.load_file(OVEN_FILE)
            })
        })
        it('model serializes correctly', function(done){
            var iot = new iotdb.IOT(iotd)
            iot.on(iotdb.EVENT_UPDATED_MODEL, function(iri) {
                var model = iot._build_model(OVEN_IRI)
                assert.ok(_.isFunction(model))
                // console.log(iot.gm.graph)

                // at this point we have a thing we can test conventionally
                var thing = new model()

                assert.strictEqual(null, thing.get('temperature_f'))
                assert.ok(_.equals(thing.stated, { on: null,
                  temperature_f: null,
                  temperature_c: null,
                  reading_c: null,
                  reading_f: null }))

                // setting to out of range values
                thing.set('temperature_f', -100)
                assert.strictEqual(0, thing.get('temperature_f'))

                thing.set('temperature_f', 600)
                assert.strictEqual(500, thing.get('temperature_f'))

                // setting to in range values
                thing.set('temperature_f', 200)
                assert.strictEqual(200, thing.get('temperature_f'))

                // make sure code got invoked!
                assert.strictEqual(93, thing.get('temperature_c'))

                done()
            })

            iot.on_ready(function() {
                iot.gm.load_file(OVEN_FILE)
            })
        })
    })
    */
})
