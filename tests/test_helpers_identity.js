/*
 *  test_helpers_identity.js
 *
 *  David Janes
 *  IOTDB
 *  2014-01-01
 *
 *  Test identity_* functions in helpers
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

/* --- tests --- */
/*
describe('test_helpers_identity:', function(){
  describe('identity', function(){
    it('overlap simple', function(){
        {
            // true because every key in subd is in superd (i.e. no keys)
            var superd = {
            }
            var subd = {
            }
            assert.strictEqual(true, _.identity_overlap(superd, subd));
        }
        {
            // true because every key in subd is in superd (i.e. no keys)
            var superd = {
                a: 1
            }
            var subd = {
            }
            assert.strictEqual(true, _.identity_overlap(superd, subd));
        }
        {
            // false because 'a' is not in superd
            var superd = {
            }
            var subd = {
                a: 1
            }
            assert.strictEqual(false, _.identity_overlap(superd, subd));
        }
        {
            // true because 'a' is the same in both
            var superd = {
                a: 1
            }
            var subd = {
                a: 1
            }
            assert.strictEqual(true, _.identity_overlap(superd, subd));
        }
        {
            // false because 'a' is different in both
            var superd = {
                a: 2
            }
            var subd = {
                a: 1
            }
            assert.strictEqual(false, _.identity_overlap(superd, subd));
        }
        {
            var superd = {
                a: 1,
                b: 2,
                c: 3,
                d: 4
            }
            var subd = {
                a: 1
            }
            assert.strictEqual(true, _.identity_overlap(superd, subd));
        }
        {
            var superd = {
                a: 1,
                b: 2,
                c: 3,
                d: 4
            }
            var subd = {
                a: 1,
                b: 2,
                c: 3,
                d: 4
            }
            assert.strictEqual(true, _.identity_overlap(superd, subd));
        }
        {
            var superd = {
                a: 1,
                b: 2,
                c: 3,
                d: 4
            }
            var subd = {
                a: 1,
                b: 2,
                c: 3,
                d: 4,
                e: 5
            }
            assert.strictEqual(false, _.identity_overlap(superd, subd));
        }
    });
    it('overlap super-array', function(){
        {
            var superd = {
                a: [1, 2]
            }
            var subd = {
                a: 1
            }
            assert.strictEqual(true, _.identity_overlap(superd, subd));
        }
        {
            var superd = {
                a: [2, 3]
            }
            var subd = {
                a: 1
            }
            assert.strictEqual(false, _.identity_overlap(superd, subd));
        }
    });
    it('overlap sub-array', function(){
        {
            var superd = {
                a: 1
            }
            var subd = {
                a: [1, 2]
            }
            assert.strictEqual(true, _.identity_overlap(superd, subd));
        }
        {
            var superd = {
                a: 1
            }
            var subd = {
                a: [2, 3]
            }
            assert.strictEqual(false, _.identity_overlap(superd, subd));
        }
    });
    it('overlap sub/super-array', function(){
        {
            var superd = {
                a: [1, 2]
            }
            var subd = {
                a: [1, 2]
            }
            assert.strictEqual(true, _.identity_overlap(superd, subd));
        }
        {
            var superd = {
                a: [1, 2, 3, 4, 5]
            }
            var subd = {
                a: [5, 6, 7, 8, 9]
            }
            assert.strictEqual(true, _.identity_overlap(superd, subd));
        }
        {
            var superd = {
                a: [4, 5]
            }
            var subd = {
                a: [2, 3]
            }
            assert.strictEqual(false, _.identity_overlap(superd, subd));
        }
    });
  });
})
 */
