require('./ImageData.js');
var Color = require('./Color.js');

function Button(corruptor) {
    this.corruptor = corruptor;
    this.options = corruptor.options;
    this.imageData = corruptor.imageData;

    this.features = {};
}

Button.prototype.getBackground = function() {
    return Color.most(this.innerImageData.toColors(this.options.density));
}

Button.prototype.getColor = function() {
    var colors = [];

    for(var x = 0; x < this.innerEdgeImageData.width; x++)
        for(var y = 0; y < this.innerEdgeImageData.height; y++)
            if(this.innerEdgeImageData.data[y*this.innerEdgeImageData.width*4 + x*4 + 0] === 255)
                colors.push(this.innerImageData.getColor(x, y));

    return Color.most(colors);
}

Button.prototype.getBorder = function() {
    var colors = [];

    for(var x = this.boundary.left; x <= this.boundary.right; x++) {
        colors.push(this.imageData.getColor(x, this.boundary.top));
        colors.push(this.imageData.getColor(x, this.boundary.bottom));
    }

    for(var y = this.boundary.top; x <= this.boundary.bottom; y++) {
        colors.push(this.imageData.getColor(this.boundary.left, y));
        colors.push(this.imageData.getColor(this.boundary.right, y));
    }

    return Color.most(colors);
}

Button.prototype.corrupt = function() {
    this.outerColor = this.imageData.getOuterColor(this.options.allowance);

    // this.imageData = this.imageData.trim();
    this.edgeImageData = this.imageData.laplace8().gray().pass(5);
    this.boundary = this.edgeImageData.getBoundary();
    this.innerImageData = this.imageData.clip(this.boundary.left + 1, this.boundary.top + 1, this.boundary.right - this.boundary.left - 1, this.boundary.bottom - this.boundary.top - 1);
    this.innerEdgeImageData = this.edgeImageData.clip(this.boundary.left + 1, this.boundary.top + 1, this.boundary.right - this.boundary.left - 1, this.boundary.bottom - this.boundary.top - 1);


    this.features.background = this.getBackground();
    this.features.color = this.getColor();
    this.features.border = this.getBorder();

    // console.log(Color.aggregate(this.imageData.toColors(), 10));

    return this.features;
}

module.exports = Button;