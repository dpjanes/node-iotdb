/*
 *  test_cfg.js
 *
 *  David Janes
 *  IOTDB
 *  2014-03-15
 *
 *  Test the CFG library. Note *nix systems only
 */

"use strict";

var assert = require("assert")
var cfg = require("../cfg")
var _ = require("../helpers")

var envd = {
    "IOTDB_CFG": ".",
    "IOTDB_CWD": ".",
    "IOTDB_INSTALL": ".",
    "TMP": "/tmp",
    "ETC": "/etc",
    "TEST_DATA": "data"
}

process.chdir(__dirname)

/* --- tests --- */
describe('test_cfg', function(){
  describe('cfg_expand', function(){
    it('no variable', function(){
        assert.strictEqual("/foo", cfg.cfg_expand(envd, "/foo"))
    })
    it('expands with valid variable', function(){
        assert.strictEqual("./something", cfg.cfg_expand(envd, "$IOTDB_INSTALL/something"))
        assert.strictEqual("/tmp/bar", cfg.cfg_expand(envd, "$TMP/bar"))
        assert.strictEqual("/etc/passwd", cfg.cfg_expand(envd, "$ETC/passwd"))
    });
    it('expands with invalid variable', function(){
        assert.strictEqual("/something", cfg.cfg_expand(envd, "$XXX/something"))
    });
    it('expansion limits', function(){
        assert.strictEqual("/something", cfg.cfg_expand(envd, "$0123/something"))
        assert.strictEqual("/something", cfg.cfg_expand(envd, "$ABCD/something"))
        assert.strictEqual("/something", cfg.cfg_expand(envd, "$abcd/something"))
        assert.strictEqual("/something", cfg.cfg_expand(envd, "$abcd_01234/something"))
        assert.strictEqual("-/something", cfg.cfg_expand(envd, "$abcd_01234-/something"))
    });
  });
  describe('cfg_find', function(){
    it('all files in a directory', function(){
        var expects = [ 'data/cfg1/a.js', 'data/cfg1/a.json', 'data/cfg1/b.js', 'data/cfg1/c.json' ]
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1")))
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1:data/cfg3")))
        assert.ok(_.equals(expects, cfg.cfg_find(envd, [ "data/cfg1" ])))
        assert.ok(_.equals(expects, cfg.cfg_find(envd, [ "data/cfg1", "data/cfg3" ])))
    })
    it('expansion', function(){
        var expects = [ 'data/cfg1/a.js', 'data/cfg1/a.json', 'data/cfg1/b.js', 'data/cfg1/c.json' ]
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "$TEST_DATA/cfg1")))
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "$TEST_DATA/cfg1:$TEST_DATA/cfg3")))
        assert.ok(_.equals(expects, cfg.cfg_find(envd, [ "$TEST_DATA/cfg1" ])))
        assert.ok(_.equals(expects, cfg.cfg_find(envd, [ "$TEST_DATA/cfg1", "$TEST_DATA/cfg3" ])))
    })
    it('.max', function(){
        var expects = [ 'data/cfg1/a.js', 'data/cfg1/a.json', ]
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1", null, { max: 2 })))

        var expects = [ 'data/cfg1/a.js', 'data/cfg1/a.json', 'data/cfg1/b.js', 'data/cfg1/c.json' ]
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1", null, { max: 4 })))
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1", null, { max: 10 })))
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1", null, { max: 0 })))
    })
    it('.dotfiles', function(){
        var expects = [ 'data/cfg1/a.js', 'data/cfg1/a.json', 'data/cfg1/b.js', 'data/cfg1/c.json' ]
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1", null, { dotfiles: false })))

        var expects = [
            'data/cfg1/.d', 'data/cfg1/.d.js', 'data/cfg1/.d.json', 'data/cfg1/a.js',
            'data/cfg1/a.json', 'data/cfg1/b.js', 'data/cfg1/c.json' ]
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1", null, { dotfiles: true })))
    })
    it('name', function(){
        var expects = [ 'data/cfg1/a.js' ]
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1", "a.js")))

        var expects = [ ]
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1", "doesnotexist.js")))
    })
    it('regex', function(){
        var expects = [ 'data/cfg1/a.js', 'data/cfg1/b.js'  ]
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1", /[.]js$/)))

        var expects = [ 'data/cfg1/.d.js', 'data/cfg1/a.js', 'data/cfg1/b.js'  ]
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1", /[.]js$/, { dotfiles: true })))

        var expects = [ 'data/cfg1/.d.js' ]
        assert.ok(_.equals(expects, cfg.cfg_find(envd, "data/cfg1", /[.]js$/, { dotfiles: true, max: 1 })))
    })
    it('all up - multiple directories', function(){
        var expects = [ 'data/cfg1/a.js', 'data/cfg1/b.js', 'data/cfg2/b.js', 'data/cfg2/e.js' ]
        var gots = cfg.cfg_find(envd, "$TEST_DATA/cfg1:$TEST_DATA/cfg2", /[.]js$/)
        assert.ok(_.equals(expects, gots))

        var expects = [ 'data/cfg1/b.js', 'data/cfg2/b.js', ]
        var gots = cfg.cfg_find(envd, "$TEST_DATA/cfg1:$TEST_DATA/cfg2", "b.js")
        assert.ok(_.equals(expects, gots))

        var expects = [ 'data/cfg1/b.js' ]
        var gots = cfg.cfg_find(envd, "$TEST_DATA/cfg1:$TEST_DATA/cfg2", "b.js", { max: 1 })
        assert.ok(_.equals(expects, gots))

        var expects = [ 'data/cfg1/.d.js' ]
        var gots = cfg.cfg_find(envd, "$TEST_DATA/cfg1:$TEST_DATA/cfg2", /[.]js$/, { max: 1, dotfiles: true })
        assert.ok(_.equals(expects, gots))
    })
  })
  describe('cfg_load_json', function(){
    it('', function(done){
        var filenames = cfg.cfg_find({}, "data/cfg1", /[.]json$/)
        filenames.push("does.not.exist")
        cfg.cfg_load_json(filenames, function(paramd) {
            if (paramd.doc) {
                if (paramd.filename == 'data/cfg1/a.json') {
                    var expect = { "name": "a.json" }
                    assert.ok(_.equals(expect, paramd.doc))
                } else if (paramd.filename == 'data/cfg1/c.json') {
                    var expect = { "name": "c.json", "data": [ 1, 2, 3 ] }
                    assert.ok(_.equals(expect, paramd.doc))
                } else {
                    assert.ok(false);
                }
            } else if (paramd.error) {
                assert.strictEqual(paramd.filename, "does.not.exist")
                console.log(paramd)
                done()
            }
        })
    })
  })
})
