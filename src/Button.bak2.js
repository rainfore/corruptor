require('./ImageData.js');
var Color = require('./Color.js');
var _ = require('./util.js');

function Button(corruptor) {
    this.corruptor = corruptor;
    this.options = corruptor.options;
    this.imageData = corruptor.imageData;

    this.features = {};
    this.rules = {};
}

Button.prototype.getXMostColors = function() {
    var arr = [];
    
    for(var x = 0; x < this.imageData.width; x++)
        arr[x] = [];

    for(var y = 0; y < this.imageData.height; y++)
        for(var x = 0; x < this.imageData.width; x++)
            arr[x].push(this.imageData.getColor(x, y));

    for(var x = 0; x < this.imageData.width; x++)
        arr[x] = Color.most(arr[x]);

    return arr;
}

Button.prototype.getYMostColors = function() {
    var arr = [];

    for(var y = 0; y < this.imageData.height; y++)
        arr[y] = [];

    for(var x = 0; x < this.imageData.width; x++)
        for(var y = 0; y < this.imageData.height; y++)
            arr[y].push(this.imageData.getColor(x, y));

    for(var y = 0; y < this.imageData.height; y++)
        arr[y] = Color.most(arr[y]);

    return arr;
}

Button.prototype.getXAverageColors = function() {
    var arr = [];
    
    for(var x = 0; x < this.imageData.width; x++)
        arr[x] = [];

    for(var y = 0; y < this.imageData.height; y++)
        for(var x = 0; x < this.imageData.width; x++)
            arr[x].push(this.imageData.getColor(x, y));

    for(var x = 0; x < this.imageData.width; x++)
        arr[x] = Color.average(arr[x]);

    return arr;
}

Button.prototype.getYAverageColors = function() {
    var arr = [];

    for(var y = 0; y < this.imageData.height; y++)
        arr[y] = [];

    for(var x = 0; x < this.imageData.width; x++)
        for(var y = 0; y < this.imageData.height; y++)
            arr[y].push(this.imageData.getColor(x, y));

    for(var y = 0; y < this.imageData.height; y++)
        arr[y] = Color.average(arr[y]);

    return arr;
}

Button.prototype.getXColors = function() {
    var arr = [];
    
    for(var x = 0; x < this.imageData.width; x++)
        arr[x] = [];

    for(var y = this.imageData.height*1/4>>0; y < this.imageData.height*3/4>>0; y++)
        for(var x = 0; x < this.imageData.width; x++)
            arr[x].push(this.imageData.getColor(x, y));

    for(var x = 0; x < this.imageData.width; x++)
        arr[x] = Color.average(arr[x]);

    return arr;
}

Button.prototype.getYColors = function() {
    var arr = [];

    for(var y = 0; y < this.imageData.height; y++)
        arr[y] = [];

    for(var x = this.imageData.width*1/4>>0; x < this.imageData.width*3/4>>0; x++)
        for(var y = 0; y < this.imageData.height; y++)
            arr[y].push(this.imageData.getColor(x, y));

    for(var y = 0; y < this.imageData.height; y++)
        arr[y] = Color.average(arr[y]);

    return arr;
}

Button.prototype.parse = function() {
    this.outerColor = this.imageData.getOuterColor();
    this.imageData = this.imageData.trim(null, 2);

    var yMostColors = this.yMostColors = this.getYMostColors();
    var xMostColors = this.xMostColors = this.getXMostColors();
    var yColors = this.yColors = this.getYColors();
    var xColors = this.xColors = this.getXColors();
    var ySections = Color.sections(this.outerColor, yColors, this.outerColor, this.options.laplaceThreshold);
    var xSections = Color.sections(this.outerColor, xColors, this.outerColor, this.options.laplaceThreshold);
    // console.log(ySections);
    // console.log(xSections);

    // boxSizing: 'border-box';
    // 1. 小圆角
    // 2. 垂直线性渐变
    // 3. 简单阴影
    // 3. 简单border

    if(ySections.length === 2) {
    } else if(ySections.length >= 3) {
        // no border
        if(ySections[1] > this.options.maxBorder && ySections[ySections.length - 2] >= this.options.maxBorder) {
            this.features['height'] = ySections.slice(1, ySections.length - 1).sum();
        } else {
            this.features['borderTopWidth'] = ySections[1];
            this.features['borderTopColor'] = yMostColors[ySections.slice(0, 1).sum()];
            this.features['height'] = ySections.slice(1, ySections.length - 1).sum();
            this.features['borderBottomWidth'] = ySections[ySections.length - 2];
            this.features['borderBottomColor'] = yMostColors[ySections.slice(0, ySections.length - 2).sum()];
        }
    }

    if(xSections.length === 2) {
    } else if(xSections.length >= 3) {
        // no border
        if(xSections[1] > this.options.maxBorder && xSections[xSections.length - 2] >= this.options.maxBorder) {
            this.features['width'] = xSections.slice(1, xSections.length - 1).sum();
        } else {
            this.features['borderLeftWidth'] = xSections[1];
            this.features['borderLeftColor'] = xMostColors[xSections.slice(0, 1).sum()];
            this.features['width'] = xSections.slice(1, xSections.length - 1).sum();
            this.features['borderRightWidth'] = xSections[xSections.length - 2];
            this.features['borderRightColor'] = xMostColors[xSections.slice(0, xSections.length - 2).sum()];
        }
    }

    return this.features;
}

Button.prototype.ponder = function() {
    var borderWidths = [
        this.features['borderTopWidth'],
        this.features['borderBottomWidth'],
        this.features['borderLeftWidth'],
        this.features['borderRightWidth']
    ];

    var borderColors = [
        this.features['borderTopColor'],
        this.features['borderBottomColor'],
        this.features['borderLeftColor'],
        this.features['borderRightColor']
    ];

    if(_.areAllExists(borderWidths) && _.areAllExists(borderColors)) {
        if(_.areAllEqual(borderWidths) && Color.areAllEqual(borderColors))
            this.rules.border = this.features['borderTopWidth'] + 'px solid ' + this.features['borderTopColor'].toRGBHex();
        else
            console.warn('Border is not all equal!', borderWidths, borderColors.map(function(color) {
                return color.toRGBHex();
            }));
    }
}

Button.prototype.corrupt = function() {
    this.parse();
    this.ponder();
    console.log(this.features);
    console.log(this.rules);
}

module.exports = Button;