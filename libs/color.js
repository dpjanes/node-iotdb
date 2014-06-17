/*
 *  color.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-01-05
 *
 *  Helper functions for colors. We
 *  need this so often, we might as well
 *  make it part of the library
 *
 *  A lot of code is from here:
 *  http://stackoverflow.com/a/9493060/96338
 */

var Color = function(value) {
    var self = this;

    var r = 0;
    var g = 0;
    var b = 0;

    var h = 0;
    var s = 0;
    var l = 0;

    if (value !== undefined) {
        self.parseColor(value);
    }
}

Color.prototype.parseColor = function(value) {
    var self = this;

    if (!value) {
        console.trace()
        return
    }

    var match = value.match(/^#?([0-9A-Za-z]{2})([0-9A-Za-z]{2})([0-9A-Za-z]{2})$/)
    if (match) {
        self.set_rgb_255(parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16));
        return
    }

    var match = value.match(/^hsl\(([.\d]+),([.\d]+),([.\d]+)\);*$/)
    if (match) {
        self.set_hsl(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
        return
    }

    var match = value.match(/^rgb\(([\d]+),([\d]+),([\d]+)\);*$/)
    if (match) {
        self.set_rgb_255(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        return
    }
}

Color.prototype.set_rgb_1 = function(r, g, b) {
    var self = this;

    if (r !== undefined) self.r = r;
    if (g !== undefined) self.g = g;
    if (b !== undefined) self.b = b;
    self._rgb_to_hsl();
}

Color.prototype.set_rgb_255 = function(r, g, b) {
    var self = this;


    if (r !== undefined) self.r = r / 255.0;
    if (g !== undefined) self.g = g / 255.0;
    if (b !== undefined) self.b = b / 255.0;

    self._rgb_to_hsl();
}

Color.prototype.set_hsl = function(h, s, l) {
    var self = this;

    if (h !== undefined) self.h = h;
    if (s !== undefined) self.s = s;
    if (l !== undefined) self.l = l;
    self._hsl_to_rgb();
}

Color.prototype.get_hex = function() {
    var self = this;

    var r = Math.floor(self.r * 255);
    var g = Math.floor(self.g * 255);
    var b = Math.floor(self.b * 255);

    var r$ = r.toString(16);
    if (r$.length == 1) r$ = "0" + r$;
    var g$ = g.toString(16);
    if (g$.length == 1) g$ = "0" + g$;
    var b$ = b.toString(16);
    if (b$.length == 1) b$ = "0" + b$;

    return "#" + r$ + g$ + b$;
}

Color.prototype.get_rgb = function() {
    var self = this;

    return "rgb(" + self.r + "," + self.g + "," + self.b + ")";
}

Color.prototype.get_hsl = function() {
    var self = this;

    return "hsl(" + self.h + "," + self.s + "," + self.l + ")";
}

Color.prototype._hsl_to_rgb = function() {
    var self = this;

    var h = self.h
    var s = self.s
    var l = self.l
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    self.r = r;
    self.g = g;
    self.b = b;
}

Color.prototype._rgb_to_hsl = function(){
    var self = this;

    var r = self.r;
    var g = self.g;
    var b = self.b;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    self.h = h;
    self.s = s;
    self.l = l;
}

/*
var color = new Color("#FF0000");
console.log("rgb=" + color.get_rgb());
console.log("hsl=" + color.get_hsl());
console.log("hex=" + color.get_hex());

color.set_hsl(undefined, undefined, 1);
console.log("rgb=" + color.get_rgb());
console.log("hsl=" + color.get_hsl());
console.log("hex=" + color.get_hex());



rgb_to_hex = function(rgb) {
}

var color = "#FF0000"
var rgb = hex_to_rgb(color)
var hsl = rgb_to_hsl(rgb)
console.log(color, rgb, hsl)
hsl[2] = 1
var rgb_1 = hsl_to_rgb(hsl)
console.log(color, rgb_1, hsl)
*/

exports.Color = Color
