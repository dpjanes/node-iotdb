/*
 *  test_id_user.js
 *
 *  David Janes
 *  IOTDB
 *  2015-04-13
 *  "45th anniversary of Apollo 13 explosion"
 */

"use strict";

var assert = require("assert")
var _ = require("../helpers")

/* --- tests --- */
describe('test_id_user:', function(){
    it('user - http', function(){
        var expect = "urn:iotdb:user:a7886bb5b04908d8dac45c7eee0476a2";
        var urls = [
            "http://twitter.com/dpjanes",
            "http://TWITTER.com/dpjanes",
            "http://TWITTER.COM/dpjanes",
        ];
        for (var ui in urls) {
            var url = urls[ui];
            assert.strictEqual(_.id.user_urn(url), expect);
        }
    });
    it('user - http:80', function(){
        var expect = "urn:iotdb:user:a7886bb5b04908d8dac45c7eee0476a2";
        var urls = [
            "http://twitter.com:80/dpjanes",
            "http://TWITTER.com:80/dpjanes",
            "http://TWITTER.COM:80/dpjanes",
        ];
        for (var ui in urls) {
            var url = urls[ui];
            assert.strictEqual(_.id.user_urn(url), expect);
        }
    });
    it('user - http:8080', function(){
        var expect = 'urn:iotdb:user:15590253c645062ee3815097ab4413c6';
        var urls = [
            "http://twitter.com:8080/dpjanes",
            "http://TWITTER.com:8080/dpjanes",
            "http://TWITTER.COM:8080/dpjanes",
        ];
        for (var ui in urls) {
            var url = urls[ui];
            assert.strictEqual(_.id.user_urn(url), expect);
        }
    });
    it('user - https', function(){
        var expect = "urn:iotdb:user:aa65797af2ad590e069f40bf28fe66b3";
        var urls = [
            "https://homestar.org/abcdef0123456789",
            "https://HOMESTAR.org/abcdef0123456789",
            "https://HOMESTAR.ORG/abcdef0123456789",
        ];
        for (var ui in urls) {
            var url = urls[ui];
            assert.strictEqual(_.id.user_urn(url), expect);
        }
    });
    it('user - https:443', function(){
        var expect = "urn:iotdb:user:aa65797af2ad590e069f40bf28fe66b3";
        var urls = [
            "https://homestar.org:443/abcdef0123456789",
            "https://HOMESTAR.org:443/abcdef0123456789",
            "https://HOMESTAR.ORG:443/abcdef0123456789",
        ];
        for (var ui in urls) {
            var url = urls[ui];
            assert.strictEqual(_.id.user_urn(url), expect);
        }
    });
    it('user - https:44380', function(){
        var expect = 'urn:iotdb:user:ad2ec15826dd009fcd9bfe538fdbc305';
        var urls = [
            "https://homestar.org:44380/abcdef0123456789",
            "https://HOMESTAR.org:44380/abcdef0123456789",
            "https://HOMESTAR.ORG:44380/abcdef0123456789",
        ];
        for (var ui in urls) {
            var url = urls[ui];
            assert.strictEqual(_.id.user_urn(url), expect);
        }
    });
})
