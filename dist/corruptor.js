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

	function Corruptor(imageData) {
	    this.options = {
	        allowance: 8,
	        density: 4,
	        minGradient: 8,
	        minDiff2: 8
	    }

	    this.features = {};

	    this.imageData = imageData;
	}


	Corruptor.prototype.corrupt = function() {
	    var button = new Button(this);
	    this.features = button.corrupt();


	    this.testImageData = button.imageData.copy();
	    for(var y = 0; y < this.testImageData.height; y++)
	        for(var x = 0; x < this.testImageData.width; x++)
	            this.testImageData.setColor(x, y, button.yAverageColors[y]);

	    // for(var x = 0; x < this.testImageData.width; x++)
	    //     for(var y = 0; y < this.testImageData.height; y++)
	    //         this.testImageData.setColor(x, y, button.xAverageColors[x]);


	    return this.features;
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

	ImageData.prototype.toColors = function(density) {
	    density = density || 1;

	    var colors = [];
	    for(var x = 0; x < this.width; x += density)
	        for(var y = 0; y < this.height; y += density)
	            colors.push(this.getColor(x, y));

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

	    if(!Color.isAllSimilar(colors, allowance))
	        throw new Error('Colors are not similar!');
	    
	    return Color.most(colors);
	}

	ImageData.prototype.getBoundary = function(allowance) {
	    var boundary = {};
	    var outerColor = this.getOuterColor(allowance);
	    // 确定边界

	    for(var y = 0; y < this.height; y++) {
	        for(var x = 0; x < this.width; x++)
	            if(!Color.isSimilar(this.getColor(x, y), outerColor, allowance)) {
	                boundary.top = y;
	                break;
	            }

	        if(!isNaN(boundary.top))
	            break;
	    }

	    for(var y = this.height - 1; y >= 0; y--) {
	        for(var x = 0; x < this.width; x++)
	            if(!Color.isSimilar(this.getColor(x, y), outerColor, allowance)) {
	                boundary.bottom = y;
	                break;
	            }

	        if(!isNaN(boundary.bottom))
	            break;
	    }

	    for(var x = 0; x < this.width; x++) {
	        for(var y = boundary.top; y <= boundary.bottom; y++)
	            if(!Color.isSimilar(this.getColor(x, y), outerColor, allowance)) {
	                boundary.left = x;
	                break;
	            }

	        if(!isNaN(boundary.left))
	            break;
	    }

	    for(var x = this.width - 1; x >= 0; x--) {
	        for(var y = boundary.top; y <= boundary.bottom; y++)
	            if(!Color.isSimilar(this.getColor(x, y), outerColor, allowance)) {
	                boundary.right = x;
	                break;
	            }

	        if(!isNaN(boundary.right))
	            break;
	    }

	    return boundary;
	}

	ImageData.prototype.trim = function(allowance) {
	    var boundary = this.getBoundary(allowance);
	    return this.clip(boundary.left, boundary.top, boundary.right - boundary.left + 1, boundary.bottom - boundary.top + 1);
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

	            arr[y*this.width*4 + x*4 + 3] = this.data[y*this.width*4 + x*4 + 3];
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

	ImageData.prototype.pass = function(value) {
	    var arr = new Uint8ClampedArray(this.data.length);

	    for(var x = 0; x < this.width; x++)
	        for(var y = 0; y < this.height; y++) {
	            for(var i = 0; i < 3; i++)
	                arr[y*this.width*4 + x*4 + i] = this.data[y*this.width*4 + x*4 + i] > value ? 255 : 0;
	            arr[y*this.width*4 + x*4 + 3] = this.data[y*this.width*4 + x*4 + 3];
	        }

	    return new ImageData(arr, this.width, this.height);
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

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Color = __webpack_require__(3);



	var manipulator = {};

	// manipulator.

	module.exports = manipulator;

/***/ },
/* 6 */
/***/ function(module, exports) {

	var _ = {}

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


	module.exports = _;

/***/ }
/******/ ])
});
;