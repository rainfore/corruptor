require('./ImageData.js');
var Color = require('./Color.js');
var _ = require('./util.js');

function Button(corruptor) {
    this.corruptor = corruptor;
    this.options = corruptor.options;
    this.imageData = corruptor.imageData;

    this.features = {};
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

Button.prototype.parse = function() {
    this.outerColor = this.imageData.getOuterColor();
    this.imageData = this.imageData.trim();

    var yMostColors = this.yMostColors = this.getYMostColors();
    var xMostColors = this.xMostColors = this.getXMostColors();
    var yAverageColors = this.yAverageColors = this.getYAverageColors();
    var xAverageColors = this.xAverageColors = this.getXAverageColors();
    var ySections = Color.sections(this.outerColor, yAverageColors, this.outerColor, this.options.minDiff2);
    var xSections = Color.sections(this.outerColor, xAverageColors, this.outerColor, this.options.minDiff2);
    console.log(ySections);
    console.log(xSections);

    // boxSizing: 'border-box';
    // 1. 小圆角
    // 2. 垂直线性渐变
    // 3. 简单阴影

    if(ySections.length === 1) {
    } else if(ySections.length === 2) {
        this.features['height'] = ySections[1];
    } else if(ySections.length === 3) {
        this.features['height'] = ySections[1];
    } else if(ySections.length === 4) {
        this.features['borderTopWidth'] = ySections[1];
        this.features['borderTopColor'] = yMostColors[ySections.slice(0, 1).sum()];
        this.features['height'] = ySections.slice(1, 4).sum();
        this.features['borderBottomWidth'] = ySections[3];
        this.features['borderBottomColor'] = yMostColors[ySections.slice(0, 3).sum()];
    } else if(ySections.length === 5) {
        this.features['borderTopWidth'] = ySections[1];
        this.features['borderTopColor'] = yMostColors[ySections.slice(0, 1).sum()];
        this.features['height'] = ySections.slice(1, 4).sum();
        this.features['borderBottomWidth'] = ySections[3];
        this.features['borderBottomColor'] = yMostColors[ySections.slice(0, 3).sum()];
    } else {
        this.features['borderTopWidth'] = ySections[1];
        this.features['borderTopColor'] = yMostColors[ySections.slice(0, 1).sum()];
        this.features['height'] = ySections.slice(1, ySections.length - 1).sum();
        this.features['borderBottomWidth'] = ySections[ySections.length - 2];
        this.features['borderBottomColor'] = yMostColors[ySections.slice(0, ySections.length - 2).sum()];
    }

    return this.features;
}

Button.prototype.ponder = function() {
    console.log(this.features);
}

Button.prototype.corrupt = function() {
    this.parse();
    this.ponder();
}

module.exports = Button;