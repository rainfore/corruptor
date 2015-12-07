require('./ImageData.js');
var Color = require('./Color.js');
var Button = require('./Button.js');

function Corruptor(image, options, callback) {
    this.options = {
        allowance: 8,
        densityX: 4,
        densityY: 2,
        laplaceThreshold: 8,
        gradientThreshold: 6,
        maxBorder: 4,
        maxBorderRadius: 6,
        deviation: 1,
        smart: true,
        approximate: true,
        warning: 2
    }
    this.features = {};
    this.ruleset = {};

    this.imageData = null;
    this.imageDatas = [];

    this._initImageData(image, function() {
        var ruleset = this.corrupt();
        callback && callback(ruleset);
    }.bind(this));
}

Corruptor.getImageFromPath = function(path, callback) {
    var img = new Image();
    img.src = path;

    img.onload = function() {callback(img);}
}

Corruptor.getImageDataFromImage = function(image) {
    var canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, image.width, image.height);
}

Corruptor.getCanvasFromImageData = function(imageData) {
    var canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    var context = canvas.getContext('2d');
    context.putImageData(imageData, 0, 0);
    return canvas;
}

Corruptor.prototype._initImageData = function(image, callback) {
    if(typeof image === 'string') {
        Corruptor.getImageFromPath(image, function(img) {
            this.imageData = Corruptor.getImageDataFromImage(img);
            callback && callback();
        }.bind(this));
    } else if(image instanceof Image) {
        this.imageData = Corruptor.getImageDataFromImage(image);
        callback && callback();
    } else if(image instanceof ImageData) {
        this.imageData = image;
        callback && callback();
    } else
        throw new Error('Wrong image type!');
}

Corruptor.prototype.corrupt = function() {
    var button = new Button(this);
    this.ruleset = button.corrupt();

    this.imageDatas.push(button.imageData);
    // this.imageDatas.push(button.boolCorruptXImageData);
    // this.imageDatas.push(button.boolCorruptYImageData);
    this.imageDatas.push(button.gradientBoolXImageData);
    this.imageDatas.push(button.gradientBoolYImageData);

    // var yImageData = button.imageData.copy();
    // for(var y = 0; y < yImageData.height; y++)
    //     for(var x = 0; x < yImageData.width; x++)
    //         yImageData.setColor(x, y, button.yColors[y]);
    // this.imageDatas.push(yImageData);

    // var xImageData = button.imageData.copy();
    // for(var x = 0; x < xImageData.width; x++)
    //     for(var y = 0; y < xImageData.height; y++)
    //         xImageData.setColor(x, y, button.xColors[x]);
    // this.imageDatas.push(xImageData);

    // this.imageDatas.push(button.imageData.distanceLaplace());
    // this.imageDatas.push(button.imageData.distanceLaplace().boolCorrupt(8));

    // this.imageDatas.push(button.imageData.distanceLaplaceX());
    // this.imageDatas.push(button.imageData.distanceLaplaceX().boolCorruptX(8));
    // this.imageDatas.push(button.imageData.distanceLaplaceY());
    // this.imageDatas.push(button.imageData.distanceLaplaceY().boolCorruptY(8));

    return this.ruleset;
}

module.exports = Corruptor;