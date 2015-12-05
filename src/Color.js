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
    return Color.distanceSquare(color1, color2) <= allowance*allowance;
}

Color.isAllSimilar = function(colors, allowance) {
    for(var i = 1; i < colors.length - 1; i++)
        if(!Color.isSimilar(colors[i], colors[i - 1], allowance))
            return false;
    return true;
}

Color.distance = function(color1, color2) {
    return Math.sqrt(
        + (color1.red - color2.red)*(color1.red - color2.red)
        + (color1.green - color2.green)*(color1.green - color2.green)
        + (color1.blue - color2.blue)*(color1.blue - color2.blue)
        + (color1.alpha - color2.alpha)*(color1.alpha - color2.alpha)
    );
}

Color.distanceSquare = function(color1, color2) {
    return (color1.red - color2.red)*(color1.red - color2.red)
         + (color1.green - color2.green)*(color1.green - color2.green)
         + (color1.blue - color2.blue)*(color1.blue - color2.blue)
         + (color1.alpha - color2.alpha)*(color1.alpha - color2.alpha);
}

Color.absDistance = function(color1, color2) {
    return Math.abs(color1.red - color2.red) + Math.abs(color1.green - color2.green) + Math.abs(color1.blue - color2.blue) + Math.abs(color1.alpha - color2.alpha);
}

Color.diffDistance = function(color0, color1, color2) {
    return Math.sqrt(
        + (color0.red + color2.red - color1.red*2)*(color0.red + color2.red - color1.red*2)
        + (color0.green + color2.green - color1.green*2)*(color0.green + color2.green - color1.green*2)
        + (color0.blue + color2.blue - color1.blue*2)*(color0.blue + color2.blue - color1.blue*2)
        + (color0.alpha + color2.alpha - color1.alpha*2)*(color0.alpha + color2.alpha - color1.alpha*2)
    );
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

// Color.diff = function(start, colors) {
//     var result = [Color.distance(colors[0], start)];
//     for(var i = 1; i < colors.length; i++)
//         result[i] = Color.distance(colors[i], colors[i - 1]);
//     return result;
// }

// Color.diff2 = function(start, colors) {
//     var diff = Color.diff(start, colors);
//     var result = [diff[0]];
//     for(var i = 1; i < diff.length; i++)
//         result[i] = diff[i] - diff[i - 1];
//     return result;
// }

Color.sections = function(start, colors, end, minDiff2) {
    colors = [].concat([start], colors, [end]);

    // var diff = [];
    // for(var i = 0; i < colors.length - 1; i++) {   
    //     diff[i] = Color.distance(colors[i + 1], colors[i]);
    //     diff[i] = diff[i] > ? diff[i] : 0;
    // }
    // console.log(diff);

    var diff2 = [];
    for(var i = 0; i < colors.length - 2; i++) {   
        diff2[i] = Color.diffDistance(colors[i], colors[i + 1], colors[i + 2]);
        // Math.abs(diff[i + 1] - diff[i]) >= minDiff2 ? diff[i] : 0; // diff[i] > 36 ? diff[i] : 0;
        diff2[i] = diff2[i] >= minDiff2 ? diff2[i] : 0;
    }
    for(var i = diff2.length - 1; i > 0; i--)
        diff2[i] = diff2[i - 1] ? diff2[i] : 0;
    console.log(diff2);

    var sections = [];
    var width = 0;
    for(var i = 0; i < diff2.length; i++)
        if(diff2[i]) {
            sections.push(width);
            width = 1;
        } else
            width++;

    sections.push(width);

    return sections;
}

Color.toString = function() {
    return this.toHex();
}

module.exports = Color;