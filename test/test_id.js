/*
 *  test_id.js
 *
 *  David Janes
 *  IOTDB
 *  2015-12-29
 *  "45th anniversary of Apollo 13 explosion"
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

/* --- tests --- */
describe('test_id', function(){
    describe('slugify', function(){
        it('blank', function() {
            var src = "";
            var expected = "";
            var slugged = _.id.slugify(src);
            assert.equal(expected, slugged);
        });
        it('lower', function() {
            var src = "abcdefghijklmnopqrstuvwxyz";
            var expected = "abcdefghijklmnopqrstuvwxyz";
            var slugged = _.id.slugify(src);
            assert.equal(expected, slugged);
        });
        it('upper', function() {
            var src = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var expected = "abcdefghijklmnopqrstuvwxyz";
            var slugged = _.id.slugify(src);
            assert.equal(expected, slugged);
        });
        it('numbers', function() {
            var src = "01234567890";
            var expected = "01234567890";
            var slugged = _.id.slugify(src);
            assert.equal(expected, slugged);
        });
        it('other', function() {
            var src = "!@#$%^&*()_+-=";
            var expected = "_";
            var slugged = _.id.slugify(src);
            assert.equal(expected, slugged);
        });
        it('phrase', function() {
            var src = "Now Is The Time For All Good Men 0 1 2";
            var expected = "now_is_the_time_for_all_good_men_0_1_2";
            var slugged = _.id.slugify(src);
            assert.equal(expected, slugged);
        });
    });
    describe('identifier', function(){
        it('WeMoSwitch', function() {
            var src = "WeMoSwitch";
            assert.equal(_.id.to_camel_case(src), "WeMoSwitch");
            assert.equal(_.id.to_dash_case(src), "we-mo-switch");
            assert.equal(_.id.to_underscore_case(src), "we_mo_switch");
        });
        it('RESTLight', function() {
            var src = "RESTLight";
            assert.equal(_.id.to_camel_case(src), "RestLight");
            assert.equal(_.id.to_dash_case(src), "rest-light");
            assert.equal(_.id.to_underscore_case(src), "rest_light");
        });
        it('C99', function() {
            var src = "C99";
            assert.equal(_.id.to_camel_case(src), "C99");
            assert.equal(_.id.to_dash_case(src), "c99");
            assert.equal(_.id.to_underscore_case(src), "c99");
        });
        it('COAP99', function() {
            var src = "COAP99";
            assert.equal(_.id.to_camel_case(src), "Coap99");
            assert.equal(_.id.to_dash_case(src), "coap99");
            assert.equal(_.id.to_underscore_case(src), "coap99");
        });
        it('COAP99Light', function() {
            var src = "COAP99Light";
            assert.equal(_.id.to_camel_case(src), "Coap99Light");
            assert.equal(_.id.to_dash_case(src), "coap99-light");
            assert.equal(_.id.to_underscore_case(src), "coap99_light");
        });
    });
});
