/*
 *  test_id_thing_urn.js
 *
 *  David Janes
 *  IOTDB
 *  2016-01-16
 *  "Augustus becomes the first Roman Emperor (27 BC)"
 */

"use strict";

var assert = require("assert")
var sleep = require("sleep");
const iotdb = require("../iotdb");
const _ = require("../helpers");

describe('test_id_thing_urn', function(){
    let ok;
    beforeEach(function() {
        ok = iotdb.shims.keystore(() => ({
            get: ( key, otherwise ) => {
                if (key === "/homestar/runner/keys/homestar/key") {
                    return "UNIQUE-MACHINE-ID";
                } else {
                    return otherwise;
                }
            }
        }));
        // console.log("HERE:TEST", iotdb.__filename);
    });
    afterEach(function() {
        iotdb.shims.keystore(ok);
    });
    it('machine_id', function(){
        var response = _.id.machine_id();
        var expected = "UNIQUE-MACHINE-ID";

        assert.strictEqual(response, expected);
    });
    describe('test_urn', function(){
        describe('unique', function(){
            it('empty request', function(done){
                    var response = _.id.thing_urn.unique();
                    var expected = "urn:iotdb:thing";

                    assert.strictEqual(response, expected);
                    done();
            });
            it('three string + number', function(done){
                    var response = _.id.thing_urn.unique("MyThing", "Something", "Else", 42);
                    var expected = "urn:iotdb:thing:MyThing:Something:Else:42";

                    assert.strictEqual(response, expected);
                    done();
            });
        });
        describe('unique_hash', function(){
            it('empty request', function(done){
                    var response = _.id.thing_urn.unique_hash();
                    var expected = "urn:iotdb:thing:d41d8cd98f00b204e9800998ecf8427e";

                    assert.strictEqual(response, expected);
                    done();
            });
            it('three string + number', function(done){
                    var response = _.id.thing_urn.unique_hash("MyThing", "Something", "Else", 42);
                    var expected = "urn:iotdb:thing:MyThing:Something:Else:a1d0c6e83f027327d8461063f4ac58a6";

                    assert.strictEqual(response, expected);
                    done();
            });
            it('three strings', function(done){
                    var response = _.id.thing_urn.unique_hash("MyThing", "Something", "Else");
                    var expected = "urn:iotdb:thing:MyThing:Something:6a0053231db40a4539b8f783a719a54a";

                    assert.strictEqual(response, expected);
                    done();
            });
        });
        describe('machine_unique', function(){
            it('empty request', function(done){
                    var response = _.id.thing_urn.machine_unique();
                    var expected = 'urn:iotdb:thing:98975ddc296ccc277a7f1d99545fa48e' 
                    assert.strictEqual(response, expected);
                    done();
            });
            it('three string + number', function(done){
                    var response = _.id.thing_urn.machine_unique("MyThing", "Something", "Else", 42);
                    var expected = 'urn:iotdb:thing:MyThing:Something:Else:42:41b4c34e7f7ce88dbc5e05eb1a4f5a3c' 

                    assert.strictEqual(response, expected);
                    done();
            });
            it('three strings', function(done){
                    var response = _.id.thing_urn.machine_unique("MyThing", "Something", "Else");
                    var expected = 'urn:iotdb:thing:MyThing:Something:Else:24dc5487031655485b33176ec15a57aa' 

                    assert.strictEqual(response, expected);
                    done();
            });
        });
    });
});
