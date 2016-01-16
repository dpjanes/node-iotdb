/*
 *  test_id.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-16
 *  "Augustus becomes the first Roman Emperor (27 BC)"
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
var _ = require("../helpers")

var _instrument = function(callback) {
    _.id.thing_urn.set({
        "machine-id": "UNIQUE-MACHINE-ID",
        "network-id": "UNIQUE-NETWORK-ID",
    });

    callback();
};

/* --- tests --- */
describe('test_id', function(){
    describe('test_urn', function(){
        describe('unique', function(){
            it('empty request', function(done){
                _instrument(function() {
                    var response = _.id.thing_urn.unique();
                    var expected = "urn:iotdb:thing";

                    assert.strictEqual(response, expected);
                    done();
                });
            });
            it('three string + number', function(done){
                _instrument(function() {
                    var response = _.id.thing_urn.unique("MyThing", "Something", "Else", 42);
                    var expected = "urn:iotdb:thing:MyThing:Something:Else:42";

                    assert.strictEqual(response, expected);
                    done();
                });
            });
        });
        describe('unique_hash', function(){
            it('empty request', function(done){
                _instrument(function() {
                    var response = _.id.thing_urn.unique_hash();
                    var expected = "urn:iotdb:thing:d41d8cd98f00b204e9800998ecf8427e";

                    assert.strictEqual(response, expected);
                    done();
                });
            });
            it('three string + number', function(done){
                _instrument(function() {
                    var response = _.id.thing_urn.unique_hash("MyThing", "Something", "Else", 42);
                    var expected = "urn:iotdb:thing:MyThing:Something:Else:a1d0c6e83f027327d8461063f4ac58a6";

                    assert.strictEqual(response, expected);
                    done();
                });
            });
            it('three strings', function(done){
                _instrument(function() {
                    var response = _.id.thing_urn.unique_hash("MyThing", "Something", "Else");
                    var expected = "urn:iotdb:thing:MyThing:Something:6a0053231db40a4539b8f783a719a54a";

                    assert.strictEqual(response, expected);
                    done();
                });
            });
        });
        describe('network_unique', function(){
            it('empty request', function(done){
                _instrument(function() {
                    var response = _.id.thing_urn.network_unique();
                    var expected = "urn:iotdb:thing:83a68409a2ac318526b47d56c5a0aa9e";

                    assert.strictEqual(response, expected);
                    done();
                });
            });
            it('three string + number', function(done){
                _instrument(function() {
                    var response = _.id.thing_urn.network_unique("MyThing", "Something", "Else", 42);
                    var expected = "urn:iotdb:thing:MyThing:Something:Else:42:127c0ae452eb4ef71804f2bcc1892af4";

                    assert.strictEqual(response, expected);
                    done();
                });
            });
            it('three strings', function(done){
                _instrument(function() {
                    var response = _.id.thing_urn.network_unique("MyThing", "Something", "Else");
                    var expected = "urn:iotdb:thing:MyThing:Something:Else:7db5be509eb3898b10df9628e122ef2f";

                    assert.strictEqual(response, expected);
                    done();
                });
            });
        });
        describe('machine_unique', function(){
            it('empty request', function(done){
                _instrument(function() {
                    var response = _.id.thing_urn.machine_unique();
                    var expected = "urn:iotdb:thing:72f2fb8c5aab3722ee9bd40ca4233551";

                    assert.strictEqual(response, expected);
                    done();
                });
            });
            it('three string + number', function(done){
                _instrument(function() {
                    var response = _.id.thing_urn.machine_unique("MyThing", "Something", "Else", 42);
                    var expected = "urn:iotdb:thing:MyThing:Something:Else:42:2faeff45a50ab41653eb8058927f6968";

                    assert.strictEqual(response, expected);
                    done();
                });
            });
            it('three strings', function(done){
                _instrument(function() {
                    var response = _.id.thing_urn.machine_unique("MyThing", "Something", "Else");
                    var expected = "urn:iotdb:thing:MyThing:Something:Else:abfb7765fd95fc24813bdd58b35358fe";

                    assert.strictEqual(response, expected);
                    done();
                });
            });
        });
    });
});
