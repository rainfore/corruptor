var Color = require('./Color.js');

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