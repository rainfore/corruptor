(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Corruptor"] = factory();
	else
		root["Corruptor"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Corruptor = __webpack_require__(1);
	Corruptor._ = __webpack_require__(6);
	Corruptor.Color = __webpack_require__(3);
	Corruptor.manipulator = __webpack_require__(5);

	// var gm = require('gm');
	// var path = require('path');

	// function Corruptor() {}

	// Corruptor.prototype.corrupt = function(src, type) {
	//     var image = gm(src);
	//     var imageInfo = {};

	//     image.size(function(err, value) {
	//         imageInfo.size = value;

	//         image.format(function(err, value) {
	//             imageInfo.format = value;

	//             image.color(function(err, value) {
	//                 imageInfo.color = value;

	//                 console.log(imageInfo);
	//             })
	//         });
	//     })

	    // gm(src).setFormat('ppm')
	    // .resize(1, 1)
	    // .toBuffer(function(err, buffer) {
	    //     var color = "rgb(" + buffer.readUInt8(buffer.length - 3)
	    //         + "," + buffer.readUInt8(buffer.length - 2)
	    //         + "," + buffer.readUInt8(buffer.length - 1) + ")";

	    //     console.log(color);
	    // });
	    // gm(__dirname + '/' + src)
	    // .resize(150, 150, '!')
	    // .autoOrient()
	    // .write(__dirname + '/' + path.dirname(src) + '/test2.jpg', function(err) {
	    //     err && console.log(err);
	    // });
	// }

	module.exports = Corruptor;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(2);
	var Color = __webpack_require__(3);
	var Button = __webpack_require__(4);

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

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Color = __webpack_require__(3);

	ImageData.prototype.getColor = function(x, y) {
	    return new Color(
	        this.data[y*this.width*4 + x*4 + 0],
	        this.data[y*this.width*4 + x*4 + 1],
	        this.data[y*this.width*4 + x*4 + 2],
	        this.data[y*this.width*4 + x*4 + 3]
	    );
	}

	ImageData.prototype.setColor = function(x, y, color) {
	    this.data[y*this.width*4 + x*4 + 0] = color.red;
	    this.data[y*this.width*4 + x*4 + 1] = color.green;
	    this.data[y*this.width*4 + x*4 + 2] = color.blue;
	    this.data[y*this.width*4 + x*4 + 3] = color.alpha;
	}

	ImageData.prototype.getColors = function(density, left, top, width, height) {
	    density = density || 1;
	    left = left || 0;
	    top = top || 0;
	    width = width || this.width - left;
	    height = height || this.height - top;

	    var colors = [];
	    for(var x = 0; x < width; x += density)
	        for(var y = 0; y < height; y += density)
	            colors.push(this.getColor(left + x, top + y));

	    return colors;
	}

	ImageData.prototype.clip = function(left, top, width, height) {
	    var arr = new Uint8ClampedArray(width*height*4);

	    for(var x = 0; x < width; x++)
	        for(var y = 0; y < height; y++)
	            for(var i = 0; i < 4; i++)
	                arr[y*width*4 + x*4 + i] = this.data[(y + top)*this.width*4 + (x + left)*4 + i]
	    
	    return new ImageData(arr, width, height);
	}

	ImageData.prototype.copy = function() {
	    return this.clip(0, 0, this.width, this.height);
	}

	ImageData.prototype.getOuterColor = function(allowance) {
	    var colors = [
	        this.getColor(0, 0),
	        this.getColor(0, this.height - 1),
	        this.getColor(this.width - 1, 0),
	        this.getColor(this.width - 1, this.height - 1)
	    ];

	    if(!Color.areAllSimilar(colors, allowance))
	        throw new Error('Colors are not similar!');
	    
	    return Color.most(colors);
	}

	ImageData.prototype.getBoundary = function(allowance) {
	    var boundary = {};
	    var outerColor = this.getOuterColor(allowance);
	    // 确定边界

	    for(var y = 0; y < this.height; y++) {
	        for(var x = 0; x < this.width; x++)
	            if(!Color.areSimilar(this.getColor(x, y), outerColor, allowance)) {
	                boundary.top = y;
	                break;
	            }

	        if(!isNaN(boundary.top))
	            break;
	    }

	    for(var y = this.height - 1; y >= 0; y--) {
	        for(var x = 0; x < this.width; x++)
	            if(!Color.areSimilar(this.getColor(x, y), outerColor, allowance)) {
	                boundary.bottom = y;
	                break;
	            }

	        if(!isNaN(boundary.bottom))
	            break;
	    }

	    for(var x = 0; x < this.width; x++) {
	        for(var y = boundary.top; y <= boundary.bottom; y++)
	            if(!Color.areSimilar(this.getColor(x, y), outerColor, allowance)) {
	                boundary.left = x;
	                break;
	            }

	        if(!isNaN(boundary.left))
	            break;
	    }

	    for(var x = this.width - 1; x >= 0; x--) {
	        for(var y = boundary.top; y <= boundary.bottom; y++)
	            if(!Color.areSimilar(this.getColor(x, y), outerColor, allowance)) {
	                boundary.right = x;
	                break;
	            }

	        if(!isNaN(boundary.right))
	            break;
	    }

	    return boundary;
	}

	ImageData.prototype.trim = function(allowance, padding) {
	    padding = padding || 0;
	    var boundary = this.getBoundary(allowance);
	    return this.clip(
	        boundary.left - padding,
	        boundary.top - padding,
	        boundary.right - boundary.left + 1 + padding*2,
	        boundary.bottom - boundary.top + 1 + padding*2
	    );
	}

	ImageData.prototype.average = function() {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 0; x < this.width; x++)
	        for(var y = 0; y < this.height; y++) {
	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] = (
	                    + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                    + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + x*4 + i]
	                    + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                    + this.data[y*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                    + this.data[y*this.width*4 + x*4 + i]
	                    + this.data[y*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                    + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                    + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + x*4 + i]
	                    + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                )/9;

	            arr[y*this.width*4 + x*4 + 3] = this.data[y*this.width*4 + x*4 + 3];
	        }
	    
	    return new ImageData(arr, this.width, this.height);
	}

	ImageData.prototype.averageWithWeight = function() {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 0; x < this.width; x++)
	        for(var y = 0; y < this.height; y++) {
	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] = (
	                    + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                    + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + x*4 + i]*2
	                    + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                    + this.data[y*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]*2
	                    + this.data[y*this.width*4 + x*4 + i]*4
	                    + this.data[y*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]*2
	                    + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                    + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + x*4 + i]*2
	                    + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                )/16;

	            arr[y*this.width*4 + x*4 + 3] = this.data[y*this.width*4 + x*4 + 3];
	        }
	    
	    return new ImageData(arr, this.width, this.height);
	}

	// Boundary Problem
	ImageData.prototype.laplace = function() {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 0; x < this.width; x++)
	        for(var y = 0; y < this.height; y++) {
	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] =
	                    + this.data[y*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                    + this.data[y*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                    + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + x*4 + i]
	                    + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + x*4 + i]
	                    - this.data[y*this.width*4 + x*4 + i]*4;

	            arr[y*this.width*4 + x*4 + 3] = this.data[y*this.width*4 + x*4 + 3];
	        }
	    
	    return new ImageData(arr, this.width, this.height);
	}

	// Boundary Problem
	ImageData.prototype.laplace8 = function() {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 0; x < this.width; x++)
	        for(var y = 0; y < this.height; y++) {
	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] =
	                    + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                    + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + x*4 + i]
	                    + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                    + this.data[y*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                    + this.data[y*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                    + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                    + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + x*4 + i]
	                    + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                    - this.data[y*this.width*4 + x*4 + i]*8;

	            arr[y*this.width*4 + x*4 + 3] = this.data[y*this.width*4 + x*4 + 3];
	        }
	    
	    return new ImageData(arr, this.width, this.height);
	}

	// Boundary Problem
	ImageData.prototype.distanceLaplace = function() {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 0; x < this.width; x++)
	        for(var y = 0; y < this.height; y++) {
	            var length = new Color(
	                + this.data[y*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + 0]
	                + this.data[y*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + 0]
	                + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + x*4 + 0]
	                + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + x*4 + 0]
	                - this.data[y*this.width*4 + x*4 + 0]*4,
	                + this.data[y*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + 1]
	                + this.data[y*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + 1]
	                + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + x*4 + 1]
	                + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + x*4 + 1]
	                - this.data[y*this.width*4 + x*4 + 1]*4,
	                + this.data[y*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + 2]
	                + this.data[y*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + 2]
	                + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + x*4 + 2]
	                + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + x*4 + 2]
	                - this.data[y*this.width*4 + x*4 + 2]*4,
	                0
	            ).length();

	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] = length;
	            arr[y*this.width*4 + x*4 + 3] = 255;
	        }
	    
	    return new ImageData(arr, this.width, this.height);
	}

	// Boundary Problem
	ImageData.prototype.distanceLaplaceX = function() {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var y = 0; y < this.height; y++) {
	        for(var x = 1; x < this.width - 1; x++) {
	            var length = new Color(
	                + this.data[y*this.width*4 + (x - 1)*4 + 0]
	                + this.data[y*this.width*4 + (x + 1)*4 + 0]
	                - this.data[y*this.width*4 + x*4 + 0]*2,
	                + this.data[y*this.width*4 + (x - 1)*4 + 1]
	                + this.data[y*this.width*4 + (x + 1)*4 + 1]
	                - this.data[y*this.width*4 + x*4 + 1]*2,
	                + this.data[y*this.width*4 + (x - 1)*4 + 2]
	                + this.data[y*this.width*4 + (x + 1)*4 + 2]
	                - this.data[y*this.width*4 + x*4 + 2]*2,
	                0
	            ).length();
	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] = length;
	            arr[y*this.width*4 + x*4 + 3] = 255;
	        }

	        var length = new Color(
	            this.data[(y*this.width + 1)*4 + 0] - this.data[y*this.width*4 + 0],
	            this.data[(y*this.width + 1)*4 + 1] - this.data[y*this.width*4 + 1],
	            this.data[(y*this.width + 1)*4 + 2] - this.data[y*this.width*4 + 2],
	            0
	        ).length();
	        for(var i = 0; i < 3; i++)
	            arr[y*this.width*4 + i] = length;
	        arr[y*this.width*4 + 3] = 255;

	        var length = new Color(
	            this.data[y*this.width*4 + (this.width - 2)*4 + 0] - this.data[y*this.width*4 + (this.width - 1)*4 + 0],
	            this.data[y*this.width*4 + (this.width - 2)*4 + 1] - this.data[y*this.width*4 + (this.width - 1)*4 + 1],
	            this.data[y*this.width*4 + (this.width - 2)*4 + 2] - this.data[y*this.width*4 + (this.width - 1)*4 + 2],
	            0
	        ).length();
	        for(var i = 0; i < 3; i++)
	            arr[y*this.width*4 + (this.width - 1)*4 + i] = length;
	        arr[y*this.width*4 + (this.width - 1)*4 + 3] = 255;
	    }
	    
	    return new ImageData(arr, this.width, this.height);
	}

	// Boundary Problem
	ImageData.prototype.distanceLaplaceY = function() {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 0; x < this.width; x++) {   
	        for(var y = 1; y < this.height - 1; y++) {
	            var length = new Color(
	                + this.data[(y - 1)*this.width*4 + x*4 + 0]
	                + this.data[(y + 1)*this.width*4 + x*4 + 0]
	                - this.data[y*this.width*4 + x*4 + 0]*2,
	                + this.data[(y - 1)*this.width*4 + x*4 + 1]
	                + this.data[(y + 1)*this.width*4 + x*4 + 1]
	                - this.data[y*this.width*4 + x*4 + 1]*2,
	                + this.data[(y - 1)*this.width*4 + x*4 + 2]
	                + this.data[(y + 1)*this.width*4 + x*4 + 2]
	                - this.data[y*this.width*4 + x*4 + 2]*2,
	                0
	            ).length();
	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] = length;
	            arr[y*this.width*4 + x*4 + 3] = 255;
	        }

	        var length = new Color(
	            + this.data[(this.width + x)*4 + 0] - this.data[x*4 + 0],
	            + this.data[(this.width + x)*4 + 1] - this.data[x*4 + 1],
	            + this.data[(this.width + x)*4 + 2] - this.data[x*4 + 2],
	            0
	        ).length();
	        for(var i = 0; i < 3; i++)
	            arr[x*4 + i] = length;
	        arr[x*4 + 3] = 255;

	        var length = new Color(
	            + this.data[(this.height - 2)*this.width*4 + x*4 + 0] - this.data[(this.height - 1)*this.width*4 + x*4 + 0],
	            + this.data[(this.height - 2)*this.width*4 + x*4 + 1] - this.data[(this.height - 1)*this.width*4 + x*4 + 1],
	            + this.data[(this.height - 2)*this.width*4 + x*4 + 2] - this.data[(this.height - 1)*this.width*4 + x*4 + 2],
	            0
	        ).length();
	        for(var i = 0; i < 3; i++)
	            arr[(this.height - 1)*this.width*4 + x*4 + i] = length;
	        arr[(this.height - 1)*this.width*4 + x*4 + 3] = 255;
	    }
	    
	    return new ImageData(arr, this.width, this.height);
	}

	// Boundary Problem
	ImageData.prototype.boolCorrupt = function(value) {
	    value = value || 0;

	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 1; x < this.width; x++) {
	        for(var y = 1; y < this.height; y++) {
	            for(var i = 0; i < 3; i++)
	                if(this.data[(y - 1)*this.width*4 + x*4 + i] >= value && this.data[y*this.width*4 + (x - 1)*4 + i] >= value && this.data[y*this.width*4 + x*4 + i] >= value)
	                    arr[y*this.width*4 + x*4 + i] = 255;
	                else
	                    arr[y*this.width*4 + x*4 + i] = 0;
	            arr[y*this.width*4 + x*4 + 3] = 255;
	        }

	        for(var i = 0; i < 3; i++)
	            arr[x*4 + i] = 0;
	        arr[x*4 + 3] = 255;
	    }

	    for(var y = 0; y < this.height; y++) {
	        for(var i = 0; i < 3; i++)
	            arr[y*this.width*4 + i] = 0;
	        arr[y*this.width*4 + 3] = 255;        
	    }

	    return new ImageData(arr, this.width, this.height);
	}

	// Boundary Problem
	ImageData.prototype.boolCorruptX = function(value) {
	    value = value || 0;

	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var y = 0; y < this.height; y++) {
	        for(var x = 1; x < this.width; x++) {
	            for(var i = 0; i < 3; i++)
	                if(this.data[y*this.width*4 + (x - 1)*4 + i] >= value && this.data[y*this.width*4 + x*4 + i] >= value)
	                    arr[y*this.width*4 + x*4 + i] = 255;
	                else
	                    arr[y*this.width*4 + x*4 + i] = 0;
	            arr[y*this.width*4 + x*4 + 3] = 255;
	        }

	        for(var i = 0; i < 3; i++)
	            arr[y*this.width*4 + i] = 0;
	        arr[y*this.width*4 + 3] = 255;
	    }

	    return new ImageData(arr, this.width, this.height);
	}

	// Boundary Problem
	ImageData.prototype.boolCorruptY = function(value) {
	    value = value || 0;

	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 0; x < this.width; x++) {
	        for(var y = 1; y < this.height; y++) {
	            for(var i = 0; i < 3; i++)
	                if(this.data[(y - 1)*this.width*4 + x*4 + i] >= value && this.data[y*this.width*4 + x*4 + i] >= value)
	                    arr[y*this.width*4 + x*4 + i] = 255;
	                else
	                    arr[y*this.width*4 + x*4 + i] = 0;
	            arr[y*this.width*4 + x*4 + 3] = 255;
	        }

	        for(var i = 0; i < 3; i++)
	            arr[x*4 + i] = 0;
	        arr[x*4 + 3] = 255;
	    }

	    return new ImageData(arr, this.width, this.height);
	}

	ImageData.prototype.sobel = function() {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 0; x < this.width; x++)
	        for(var y = 0; y < this.height; y++) {
	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] =
	                    + Math.abs(
	                       + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                       + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + x*4 + i]*2
	                       + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                       - this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                       - this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + x*4 + i]*2
	                       - this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                    )
	                    + Math.abs(
	                       + this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                       + this.data[y*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]*2
	                       + this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + (x + 1 < this.width ? x + 1 : x)*4 + i]
	                       - this.data[(y - 1 >= 0 ? y - 1 : y)*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                       - this.data[y*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]*2
	                       - this.data[(y + 1 < this.height ? y + 1 : y)*this.width*4 + (x - 1 >= 0 ? x - 1 : x)*4 + i]
	                    ) 

	            arr[y*this.width*4 + x*4 + 3] = 255;
	        }
	    
	    return new ImageData(arr, this.width, this.height);
	}

	// Boundary Problem
	ImageData.prototype.gradientX = function() {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var y = 0; y < this.height; y++) {
	        for(var x = 1; x < this.width; x++) {
	            var length = new Color(
	                this.data[y*this.width*4 + x*4 + 0] - this.data[y*this.width*4 + (x - 1)*4 + 0],
	                this.data[y*this.width*4 + x*4 + 1] - this.data[y*this.width*4 + (x - 1)*4 + 1],
	                this.data[y*this.width*4 + x*4 + 2] - this.data[y*this.width*4 + (x - 1)*4 + 2],
	                0
	            ).length();
	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] = length;
	            arr[y*this.width*4 + x*4 + 3] = 255;
	        }

	        for(var i = 0; i < 3; i++)
	            arr[y*this.width*4 + i] = 0;
	        arr[y*this.width*4 + 3] = 255;
	    }
	    
	    return new ImageData(arr, this.width, this.height);
	}

	// Boundary Problem
	ImageData.prototype.gradientY = function() {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 0; x < this.width; x++) {
	        for(var y = 1; y < this.height; y++) {
	            var length = new Color(
	                this.data[y*this.width*4 + x*4 + 0] - this.data[(y - 1)*this.width*4 + x*4 + 0],
	                this.data[y*this.width*4 + x*4 + 1] - this.data[(y - 1)*this.width*4 + x*4 + 1],
	                this.data[y*this.width*4 + x*4 + 2] - this.data[(y - 1)*this.width*4 + x*4 + 2],
	                0
	            ).length();
	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] = length;
	            arr[y*this.width*4 + x*4 + 3] = 255;
	        }

	        for(var i = 0; i < 3; i++)
	            arr[x*4 + i] = 0;
	        arr[x*4 + 3] = 255;
	    }
	    
	    return new ImageData(arr, this.width, this.height);
	}

	ImageData.prototype.gray = function() {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 0; x < this.width; x++)
	        for(var y = 0; y < this.height; y++) {
	            var gray = (this.data[y*this.width*4 + x*4 + 0] + this.data[y*this.width*4 + x*4 + 1] + this.data[y*this.width*4 + x*4 + 2])/3;

	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] = gray;

	            arr[y*this.width*4 + x*4 + 3] = this.data[y*this.width*4 + x*4 + 3];
	        }

	    return new ImageData(arr, this.width, this.height);
	}

	ImageData.prototype.bool = function(value) {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 0; x < this.width; x++)
	        for(var y = 0; y < this.height; y++) {
	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] = this.data[y*this.width*4 + x*4 + i] > value ? 255 : 0;
	            arr[y*this.width*4 + x*4 + 3] = 255;
	        }

	    return new ImageData(arr, this.width, this.height);
	}

	ImageData.prototype.getXOrBools = function(top, bottom) {
	    top = top || 0;
	    bottom = bottom || this.height - 1;

	    var arr = [];
	    
	    for(var x = 0; x < this.width; x++) {
	        arr[x] = 0;
	        for(var y = top; y <= bottom; y++)
	            for(var i = 0; i < 3; i++)
	                arr[x] += this.data[y*this.width*4 + x*4 + i];
	        arr[x] = arr[x] ? 1 : 0;
	    }

	    return arr;
	}

	ImageData.prototype.getYOrBools = function(left, right) {
	    left = left || 0;
	    right = right || this.width - 1;

	    var arr = [];
	    
	    for(var y = 0; y < this.height; y++) {
	        arr[y] = 0;
	        for(var x = left; x <= right; x++)
	            for(var i = 0; i < 3; i++)
	                arr[y] += this.data[y*this.width*4 + x*4 + i];
	        arr[y] = arr[y] ? 1 : 0;
	    }

	    return arr;
	}

	ImageData.prototype.getXMostColors = function() {
	    var arr = [];
	    
	    for(var x = 0; x < this.width; x++) {
	        arr[x] = [];
	        for(var y = 0; y < this.height; y++)
	            arr[x].push(this.getColor(x, y));
	        arr[x] = Color.most(arr[x]);
	    }

	    return arr;
	}

	ImageData.prototype.getYMostColors = function() {
	    var arr = [];

	    for(var y = 0; y < this.height; y++) {   
	        arr[y] = [];
	        for(var x = 0; x < this.width; x++)
	            arr[y].push(this.getColor(x, y));
	        arr[y] = Color.most(arr[y]);
	    }

	    return arr;
	}

	ImageData.prototype.getXAverageColors = function() {
	    var arr = [];
	    
	    for(var x = 0; x < this.width; x++) {
	        arr[x] = [];
	        for(var y = 0; y < this.height; y++)
	            arr[x].push(this.getColor(x, y));
	        arr[x] = Color.average(arr[x]);
	    }

	    return arr;
	}

	ImageData.prototype.getYAverageColors = function() {
	    var arr = [];

	    for(var y = 0; y < this.height; y++) {
	        arr[y] = [];
	        for(var x = 0; x < this.width; x++)
	            arr[y].push(this.getColor(x, y));
	        arr[y] = Color.average(arr[y]);
	    }

	    return arr;
	}

	ImageData.prototype.getXColors = function() {
	    var arr = [];

	    for(var x = 0; x < this.width; x++) {   
	        arr[x] = [];
	        for(var y = this.height*1/4>>0; y < this.height*3/4>>0; y++)
	            arr[x].push(this.getColor(x, y));
	        arr[x] = Color.average(arr[x]);
	    }

	    return arr;
	}

	ImageData.prototype.getYColors = function() {
	    var arr = [];

	    for(var y = 0; y < this.height; y++) {
	        arr[y] = [];
	        for(var x = this.width*1/4>>0; x < this.width*3/4>>0; x++)
	            arr[y].push(this.getColor(x, y));
	        arr[y] = Color.average(arr[y]);
	    }

	    return arr;
	}

	module.exports = ImageData;

/***/ },
/* 3 */
/***/ function(module, exports) {

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
	    return Math.abs(color1.red - color2.red) + Math.abs(color1.green - color2.green) + Math.abs(color1.blue - color2.blue);
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
	// Color.diff2 = function(start, colors) {
	//     var diff = Color.diff(start, colors);
	//     var result = [diff[0]];
	//     for(var i = 1; i < diff.length; i++)
	//         result[i] = diff[i] - diff[i - 1];
	//     return result;
	// }

	module.exports = Color;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(2);
	var Color = __webpack_require__(3);
	var _ = __webpack_require__(6);

	function Button(corruptor) {
	    this.corruptor = corruptor;
	    this.options = corruptor.options;
	    this.imageData = corruptor.imageData;

	    this.features = {};
	    this.ruleset = {};
	}


	// - 小圆角
	// - 垂直线性渐变
	// - 简单外阴影
	// - 大padding
	// - 小边框
	Button.prototype.parse = function() {
	    this.outerColor = this.imageData.getOuterColor();
	    this.imageData = this.imageData.trim(null, 2);    // trim保留2像素边框
	    // this.boolCorruptXImageData = this.imageData.distanceLaplaceX().boolCorruptX(this.options.laplaceThreshold);
	    // this.boolCorruptYImageData = this.imageData.distanceLaplaceY().boolCorruptY(this.options.laplaceThreshold);
	    this.gradientBoolXImageData = this.imageData.gradientX().bool(this.options.gradientThreshold);
	    this.gradientBoolYImageData = this.imageData.gradientY().bool(this.options.gradientThreshold);

	    // 获取双向bool值
	    var xOrBools = this.gradientBoolXImageData.getXOrBools();
	    var yOrBools = this.gradientBoolYImageData.getYOrBools();
	    var radiusInnerBoundary = {};
	    var radiusInnerXBoundary = _.getBoundaryOfBools(xOrBools);
	    var radiusInnerYBoundary = _.getBoundaryOfBools(yOrBools);
	    radiusInnerBoundary.left = radiusInnerXBoundary.start;
	    radiusInnerBoundary.right = radiusInnerXBoundary.end;
	    radiusInnerBoundary.top = radiusInnerYBoundary.start;
	    radiusInnerBoundary.bottom = radiusInnerYBoundary.end;
	    xOrBools = this.gradientBoolXImageData.getXOrBools(radiusInnerBoundary.top, radiusInnerBoundary.bottom);
	    yOrBools = this.gradientBoolYImageData.getYOrBools(radiusInnerBoundary.left, radiusInnerBoundary.right);

	    // 获取双向sections
	    var xSections = _.getSections(xOrBools);
	    var ySections = _.getSections(yOrBools);

	    // @TODO: 大阴影、大边框问题
	    var xSectionsBoundary = _.getBoundaryFromMax(xSections, xOrBools.length/2);
	    var ySectionsBoundary = _.getBoundaryFromMax(ySections, yOrBools.length/2);

	    if(xSectionsBoundary.start !== xSectionsBoundary.end) {
	        var xSectionsMiddles = xSections.splice(xSectionsBoundary.start + 1, xSectionsBoundary.end - xSectionsBoundary.start - 1);
	        xSections.splice(xSectionsBoundary.start + 1, 0, xSectionsMiddles.sum());
	        xSectionsBoundary.end -= xSectionsMiddles.length - 1;
	    }

	    if(ySectionsBoundary.start !== ySectionsBoundary.end) {
	        var ySectionsMiddles = ySections.splice(ySectionsBoundary.start + 1, ySectionsBoundary.end - ySectionsBoundary.start - 1)
	        ySectionsBoundary.start !== ySectionsBoundary.end && ySections.splice(ySectionsBoundary.start + 1, 0, ySectionsMiddles.sum());
	        ySectionsBoundary.end -= ySectionsMiddles.length - 1;
	    }

	    var borderBoundary = {};
	    borderBoundary.left = xSections[0];
	    borderBoundary.right = xOrBools.length - xSections[xSections.length - 1] - 1;
	    borderBoundary.top = ySections[0];
	    borderBoundary.bottom = yOrBools.length - ySections[ySections.length - 1] - 1;

	    // 判断特性
	    // box-sizing: border-box;
	    // width & height
	    this.features['width'] = borderBoundary.right - borderBoundary.left + 1;
	    this.features['height'] = borderBoundary.bottom - borderBoundary.top + 1;    

	    if(xSections.length === 2) {
	    } else if(xSections.length >= 3) {
	        // border
	        if(xSections[1] > this.options.maxBorder && xSections[xSections.length - 2] >= this.options.maxBorder) {
	        } else {
	            this.features['border-left-width'] = xSections[1];
	            this.features['border-left-color'] = _.getEqualColors(
	                this.imageData.getColors(null, borderBoundary.left, radiusInnerBoundary.top + 1, this.features['border-left-width'], radiusInnerBoundary.bottom - radiusInnerBoundary.top - 1),
	                this.options.warning >= 2 && 'border-left-colors'
	            );
	            this.features['border-right-width'] = xSections[xSections.length - 2];
	            this.features['border-right-color'] = _.getEqualColors(
	                this.imageData.getColors(null, xSections.slice(0, xSections.length - 2).sum(), radiusInnerBoundary.top + 1, this.features['border-right-width'], radiusInnerBoundary.bottom - radiusInnerBoundary.top - 1),
	                this.options.warning >= 2 && 'border-right-colors'
	            );
	        }

	        // padding
	        if(xSectionsBoundary.start === xSectionsBoundary.end)
	            this.features['padding-left'] = this.features['padding-right'] = (xSections[xSectionsBoundary.start]/40>>0)*10;
	        else {
	            this.features['padding-left'] = xSections[xSectionsBoundary.start];
	            this.features['padding-right'] = xSections[xSectionsBoundary.end];
	        }
	    }

	    if(ySections.length === 2) {
	    } else if(ySections.length >= 3) {
	        // border
	        if(ySections[1] > this.options.maxBorder && ySections[ySections.length - 2] >= this.options.maxBorder) {
	        } else {
	            this.features['border-top-width'] = ySections[1];
	            this.features['border-top-color'] = _.getEqualColors(
	                this.imageData.getColors(null, radiusInnerBoundary.left + 1, borderBoundary.top, radiusInnerBoundary.right - radiusInnerBoundary.left - 1, this.features['border-top-width']),
	                this.options.warning >= 2 && 'border-top-colors'
	            );
	            this.features['border-bottom-width'] = ySections[ySections.length - 2];
	            this.features['border-bottom-color'] = _.getEqualColors(
	                this.imageData.getColors(null, radiusInnerBoundary.left + 1, ySections.slice(0, ySections.length - 2).sum(), radiusInnerBoundary.right - radiusInnerBoundary.left - 1, this.features['border-bottom-width']),
	                this.options.warning >= 2 && 'border-bottom-colors'
	            );
	        }
	    }

	    // border-radius
	    // - 目前只考虑四个圆角相等的情况
	    var borderRadiuses = [
	        radiusInnerBoundary.left - borderBoundary.left + 1 - (this.features['border-left-width'] || 0),
	        borderBoundary.right - radiusInnerBoundary.right + 1 - (this.features['border-right-width'] || 0),
	        radiusInnerBoundary.top - borderBoundary.top + 1 - (this.features['border-top-width'] || 0),
	        borderBoundary.bottom - radiusInnerBoundary.bottom + 1 - (this.features['border-bottom-width'] || 0)
	    ];

	    console.log(borderBoundary, radiusInnerBoundary, borderRadiuses);

	    return this.features;
	}

	Button.prototype.interpret = function() {
	    // $line-height
	    this.ruleset['$line-height'] = (this.options.approximate ? _.approximate(this.features['height']) : this.features['height']) + 'px';

	    // border
	    var borderWidths = [
	        this.features['border-left-width'],
	        this.features['border-right-width'],
	        this.features['border-top-width'],
	        this.features['border-bottom-width']
	    ];

	    var borderColors = [
	        this.features['border-left-color'],
	        this.features['border-right-color'],
	        this.features['border-top-color'],
	        this.features['border-bottom-color']
	    ];

	    if(_.areAllExists(borderWidths) && _.areAllExists(borderColors)) {
	        if(_.areAllEqual(borderWidths) && Color.areAllEqual(borderColors))
	            this.ruleset['border'] = this.features['border-left-width'] + 'px solid ' + this.features['border-left-color'].toRGBHex();
	        else {
	            this.options.warning >= 1 && console.warn('borders are not all equal!', borderWidths, borderColors.join(', '));
	            this.ruleset['border-left'] = this.features['border-left-width'] + 'px solid ' + this.features['border-left-color'].toRGBHex();
	            this.ruleset['border-right'] = this.features['border-right-width'] + 'px solid ' + this.features['border-right-color'].toRGBHex();
	            this.ruleset['border-top'] = this.features['border-top-width'] + 'px solid ' + this.features['border-top-color'].toRGBHex();
	            this.ruleset['border-bottom'] = this.features['border-bottom-width'] + 'px solid ' + this.features['border-bottom-color'].toRGBHex();
	        }
	    }

	    // padding-x
	    var paddingXs = [
	        this.features['padding-left'],
	        this.features['padding-right']
	    ];
	    if(_.areAllExists(paddingXs)) {
	        if(paddingXs[0] === paddingXs[1])
	            this.ruleset['padding'] = '0 ' + (this.options.approximate ? _.approximate(paddingXs[0]) : paddingXs[0]) + 'px';
	        else {
	            if(this.options.smart) {
	                var paddingX = (paddingXs[0] + paddingXs[1])/2>>0;
	                this.ruleset['padding'] = '0 ' + (this.options.approximate ? _.approximate(paddingX) : paddingX) + 'px';
	            } else {
	                this.options.warning >= 1 && console.warn('padding-xs are not equal!', paddingXs[0], paddingXs[1]);
	                this.ruleset['padding-left'] = paddingXs[0];
	                this.ruleset['padding-right'] = paddingXs[1];
	            }
	        }
	    }
	}

	Button.prototype.corrupt = function() {
	    this.parse();
	    this.interpret();
	    console.log(this.features);
	    // console.log(this.ruleset);

	    return this.ruleset;
	}

	module.exports = Button;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Color = __webpack_require__(3);



	var manipulator = {};

	// manipulator.

	module.exports = manipulator;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Color = __webpack_require__(3);

	var _ = {};

	_.sum = function(arr, count) {
	    var result = 0;
	    for(var i = 0; i < count; i++)
	        result += arr[i];
	    return result;
	}

	Array.prototype.sum = function() {
	    var result = 0;
	    for(var i = 0; i < this.length; i++)
	        result += this[i];
	    return result;
	}

	_.push = function(map, key, value) {
	    if(map[key])
	        map[key].push(value);
	    else
	        map[key] = [value];
	}

	_.areAllEqual = function(arr) {
	    for(var i = 1; i < arr.length; i++)
	        if(arr[i] !== arr[i - 1])
	            return false;
	    return true;
	}


	_.isExists = function(item) {
	    return item !== undefined;
	}

	_.areAllExists = function(arr) {
	    return arr.every(function(item) {
	        return item !== undefined;
	    });
	}

	// Boundary Problem
	_.getBoundaryOfBools = function(arr) {
	    var start, end, count;

	    count = 0;
	    for(start = 1; i < arr.length; start++) {
	        if(arr[start] != arr[start - 1])
	            count++;
	        if(count === 2)
	            break;
	    }

	    count = 0;
	    for(end = arr.length - 2; end >= 0; end--) {
	        if(arr[end] != arr[end + 1])
	            count++;
	        if(count === 2)
	            break;
	    }

	    return {start: start - 1, end: end};
	}

	_.getSections = function(arr) {
	    var sections = [];

	    var width = 0;
	    for(var i = 0; i < arr.length; i++)
	        if(arr[i]) {
	            sections.push(width);
	            width = 1;
	        } else
	            width++;
	    
	    sections.push(width);

	    return sections;
	}

	_.getBoundaryFromMax = function(arr, half) {
	    var start = 0, end = 0;
	    
	    var max = 0, sum = 0;
	    for(var i = 0; i < arr.length && sum < half; i++) {
	        if(arr[i] >= max) {
	            max = arr[i];
	            start = i;
	        }
	        sum += arr[i];
	    }

	    var max = 0, sum = 0;
	    for(var i = arr.length - 1; i >= 0 && sum < half; i--) {
	        if(arr[i] >= max) {
	            max = arr[i];
	            end = i;
	        }
	        sum += arr[i];
	    }

	    return {start: start, end: end};
	}

	//  0,  1,  2,  3,  4,  5,  6,  7,  8,  9
	// 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
	// 20, 21, 22, 23, 24, 25, 26, 27, 28, 29

	// font-size =
	// -
	// 10, 10, 12, 14, 14, 16, 16, 18, 18, 20

	// padding = 
	//  0,  1,  2,  3,  4,  5,  6,  8,  8, 10
	// 10, 10, 12, 14, 14, 15, 16, 18, 18, 20
	// 20, 20, 22, 24, 24, 25, 26, 27, 28, 30

	// height =
	//  0,  1,  2,  3,  4,  5,  6,  8,  8, 10
	// 10, 10, 12, 14, 14, 15, 16, 18, 18, 20
	// 20, 20, 22, 24, 24, 25, 26, 27, 28, 30
	_.approximate = function(number) {
	    number = Math.round(number);

	    if(number <= 10)
	        return number;
	    else if(!(number%5) || !(number%2))
	        return number;
	    else if(number%10 === 1)
	        return number - 1;
	    else
	        return number + 1;
	}

	_.getEqualColors = function(colors, warning) {
	    if(Color.areAllEqual(colors))
	        return colors[0];
	    else {
	        warning && console.warn(warning + ' are not all equal!'); //, colors.join(', '));
	        return Color.average(colors);
	    }
	}

	module.exports = _;

/***/ }
/******/ ])
});
;