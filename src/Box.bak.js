require('./ImageData.js');
var Color = require('./Color.js');

function Box(corruptor) {
    this.corruptor = corruptor;
    this.options = corruptor.options;
    this.imageData = corruptor.imageData;

    this.features = {};
}

Box.prototype.getBackground = function() {
    var innerImageData = this.imageData.clip(this.boundary.left + 1, this.boundary.top + 1, this.boundary.right - this.boundary.left - 1, this.boundary.bottom - this.boundary.top - 1);
    return Color.most(innerImageData.toColors(this.options.density));
}

Box.prototype.getColor = function() {
    
}

Box.prototype.getBorder = function() {
    var border = {};

    // border-color
    var leftCenterColor = this.imageData.getColor(0, this.imageData.height/2>>0);
    var rightCenterColor = this.imageData.getColor(this.imageData.width - 1, this.imageData.height/2>>0);
    var topCenterColor = this.imageData.getColor(this.imageData.width/2>>0, 0);
    var bottomCenterColor = this.imageData.getColor(this.imageData.width/2>>0, this.imageData.height - 1);

    if(!Color.isAllSimilar([leftCenterColor, rightCenterColor, topCenterColor, bottomCenterColor], this.options.allowance))
        return;

    border.color = Color.most([leftCenterColor, rightCenterColor, topCenterColor, bottomCenterColor]);

    // border-width
    border.leftWidth = 0;
    border.rightWidth = 0;
    border.topWidth = 0;
    border.bottomWidth = 0;
    for(var x = 1; x < this.imageData.width/2>>0; x++)
        if(!Color.isSimilar(leftCenterColor, this.imageData.getColor(x, this.imageData.height/2>>0), this.options.allowance)) {
            border.leftWidth = x;
            console.log(leftCenterColor, this.imageData.getColor(x, this.imageData.height/2>>0))
            break;
        }
    for(var x = this.imageData.width - 2; x >= this.imageData.width/2>>0; x--)
        if(!Color.isSimilar(rightCenterColor, this.imageData.getColor(x, this.imageData.height/2>>0), this.options.allowance)) {
            border.rightWidth = this.imageData.width - 1 - x;
            console.log(rightCenterColor, this.imageData.getColor(x, this.imageData.height/2>>0))
            break;
        }
    for(var y = 1; y < this.imageData.height/2>>0; y++)
        if(!Color.isSimilar(topCenterColor, this.imageData.getColor(y, this.imageData.height/2>>0), this.options.allowance)) {
            border.topWidth = y;
            console.log(topCenterColor, this.imageData.getColor(y, this.imageData.height/2>>0))
            break;
        }
    for(var y = this.imageData.height - 2; y >= this.imageData.height/2>>0; y--)
        if(!Color.isSimilar(bottomCenterColor, this.imageData.getColor(y, this.imageData.height/2>>0), this.options.allowance)) {
            border.bottomWidth = this.imageData.height - 1 - y;
            console.log(bottomCenterColor, this.imageData.getColor(y, this.imageData.height/2>>0))
            break;
        }

    return border;
}

Box.prototype.corrupt = function() {
    this.outerColor = this.imageData.getOuterColor(this.options.allowance);

    this.imageData = this.imageData.trim();
    this.borderImageData = this.imageData.laplace8().gray().pass(192);
    this.boundary = this.borderImageData.getBoundary();

    this.features.background = this.getBackground();

    // console.log(Color.aggregate(this.imageData.toColors(), 10));

    return this.features;
}

module.exports = Box;