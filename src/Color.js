function Color(red, green, blue, alpha) {
    this.red = red || 0;
    this.green = green || 0;
    this.blue = blue || 0;
    this.alpha = alpha || 0;

    // tmp
    this.hex = this.toRGBHex();
}

Number.prototype.toHexString = function() {
    var hex = this.toString(16);
    return hex.length === 2 ? hex : '0' + hex;
}

Color.prototype.toHex = function() {
    return '#' + this.alpha.toHexString() + this.red.toHexString() + this.green.toHexString() + this.blue.toHexString();
}

Color.prototype.toRGBHex = function() {
    return '#' + this.red.toHexString() + this.green.toHexString() + this.blue.toHexString();
}


Color.prototype.toString = function() {
    return this.toRGBHex();
}

Color.prototype.length = function() {
    return (Math.abs(this.red) + Math.abs(this.green) + Math.abs(this.blue))/3;
}

Color.areEqual = function(color1, color2) {
    return color1.red === color2.red && color1.green === color2.green && color1.blue === color2.blue;
}

Color.areAllEqual = function(colors) {
    for(var i = 1; i < colors.length; i++)
        if(!Color.areEqual(colors[i], colors[i - 1]))
            return false;
    return true;
}

Color.areSimilar = function(color1, color2, allowance) {
    allowance = allowance || 0;
    return Color.distance(color1, color2) <= allowance;
}

Color.areAllSimilar = function(colors, allowance) {
    for(var i = 1; i < colors.length - 1; i++)
        if(!Color.areSimilar(colors[i], colors[i - 1], allowance))
            return false;
    return true;
}

Color.distance = function(color1, color2) {
    return (Math.abs(color1.red - color2.red) + Math.abs(color1.green - color2.green) + Math.abs(color1.blue - color2.blue))/3;
}

Color.fromHex = function(hex) {
    return new Color(
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
        parseInt(hex.slice(7, 9), 16),
        parseInt(hex.slice(1, 3), 16)
    );
}

Color.fromRGBHex = function(hex) {
    return new Color(
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
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

Color.most = function(colors) {
    var aggregate = Color.aggregate(colors);

    var most;
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

// Boundary Problem
// Color.diff = function(start, colors) {
//     var result = [Color.distance(colors[0], start)];
//     for(var i = 1; i < colors.length; i++)
//         result[i] = Color.distance(colors[i], colors[i - 1]);
//     return result;
// }

// Boundary Problem
Color.diff2Distance = function(color0, color1, color2) {
    return new Color(
        color0.red + color2.red - color1.red*2,
        color0.green + color2.green - color1.green*2,
        color0.blue + color2.blue - color1.blue*2
    ).length();
}

Color.diffDistancePercent = function(color0, color1, color2) {
    return new Color(
        color1.red - color0.red,
        color1.green - color0.green,
        color1.blue - color0.blue
    ).length() / new Color(
        color2.red - color0.red,
        color2.green - color0.green,
        color2.blue - color0.blue
    ).length() * 100;
}

module.exports = Color;