function Color(red, green, blue, alpha) {
    this.red = red || 0;
    this.green = green || 0;
    this.blue = blue || 0;
    this.alpha = alpha || 0;

    // tmp
    this.hex = this.toHex();
}

Number.prototype.toHexString = function() {
    var hex = this.toString(16).toUpperCase();
    return hex.length === 2 ? hex : '0' + hex;
}

Color.prototype.toHex = function() {
    return this.alpha.toHexString() + this.red.toHexString() + this.green.toHexString() + this.blue.toHexString();
}

Color.prototype.toRGBHex = function() {
    return this.red.toHexString() + this.green.toHexString() + this.blue.toHexString();
}

Color.isEqual = function(color1, color2) {
    return color1.red === color2.red && color1.green === color2.green && color1.blue === color2.blue && color1.alpha === color2.alpha;
}

Color.isAllEqual = function(colors) {
    for(var i = 1; i < colors.length; i++)
        if(!Color.isEqual(colors[i], colors[i - 1]))
            return false;
    return true;
}

Color.isSimilar = function(color1, color2, allowance) {
    allowance = allowance || 0;
    return Math.abs(color1.red - color2.red) <= allowance && Math.abs(color1.green - color2.green) <= allowance && Math.abs(color1.blue - color2.blue) <= allowance && Math.abs(color1.alpha - color2.alpha) <= allowance;
}

Color.isAllSimilar = function(colors, allowance) {
    for(var i = 1; i < colors.length - 1; i++)
        if(!Color.isSimilar(colors[i], colors[i - 1], allowance))
            return false;
    return true;
}

Color.fromHex = function(hex) {
    return new Color(
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        parseInt(hex.slice(6, 8), 16),
        parseInt(hex.slice(0, 2), 16)
    );
}

Color.fromRGBHex = function(hex) {
    return new Color(
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        255
    );
}

Color.aggregate = function(colors, value) {
    value = value || 0;

    var aggregate = {};

    for(var i = 0; i < colors.length; i++) {
        var hex = colors[i].toHex();
        if(aggregate[hex] === undefined)
            aggregate[hex] = 1;
        else
            aggregate[hex]++;
    }

    for(var key in aggregate)
        if(aggregate[key] < value)
            delete aggregate[key];

    return aggregate;
}

Color.most = function(colors, value) {
    var aggregate = Color.aggregate(colors, value);

    var most = null;
    for(var key in aggregate) {
        if(!most || aggregate[most] < aggregate[key])
            most = key;
    }

    return most && Color.fromHex(most);
}

Color.average = function(colors) {
    var red = 0, green = 0, blue = 0, alpha = 0;

    for(var i = 0; i < colors.length; i++) {
        var color = colors[i];
        red += color.red;
        green += color.green;
        blue += color.blue;
        alpha += color.alpha;
    }

    return new Color(
        red/colors.length>>0,
        green/colors.length>>0,
        blue/colors.length>>0,
        alpha/colors.length>>0
    );
}

Color.toString = function() {
    return this.toHex();
}

module.exports = Color;