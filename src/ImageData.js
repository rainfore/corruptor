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