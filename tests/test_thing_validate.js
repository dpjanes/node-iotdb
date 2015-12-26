/*
 *  test_thing_validate.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-16
 *
 *  Test validation at the Thing level
 */

"use strict";

var assert = require("assert")
var attribute = require("../attribute")
var model = require("../model")
var _ = require("../helpers")
var constants = require("../constants")

/* --- tests --- */
/* DPJ 2015-02-22 gone for now - we may bring this feature back */
// describe('test_thing_validate', function(){
//     it('attribute validation', function(){
//         /**
//          *  Test that attribute validation is called
//          *  and that the return value is <i>not</i>
//          *  checked against the required types
//          */
//         var AModel = model.make_model('A')
//             .attribute(
//                 attribute.make_boolean('on').control()
//                     .validator(function(paramd) {
//                         paramd.value = 0;
//                     })
//             )
//             .make();
// 
//         var a = new AModel();
//         a.set('on', false)
// 
//         assert.strictEqual(0, a.get('on'))
//     });
//     it('model validation', function(){
//         /**
//          *  Test that model validation is called
//          *  and that the return value is <i>not</i>
//          *  checked against the required types
//          */
//         var AModel = model.make_model('A')
//             .attribute(
//                 attribute.make_boolean('on').control()
//             )
//             .validator(function(paramd) {
//                 paramd.changed['on'] = 0;
//             })
//             .make();
// 
//         var a = new AModel();
//         a.set('on', false)
// 
//         assert.strictEqual(0, a.get('on'))
//     });
//     it('model validation (broken)', function(){
//         /**
//          *  Test that 'thingd' can't be used
//          *  to alter the model's state
//          */
//         var AModel = model.make_model('A')
//             .attribute(
//                 attribute.make_boolean('on').control()
//             )
//             .validator(function(paramd) {
//                 paramd.thingd['on'] = 0;
//             })
//             .make();
// 
//         var a = new AModel();
//         a.set('on', false)
// 
//         assert.strictEqual(false, a.get('on'))
//     });
// })
