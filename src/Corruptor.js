require('./ImageData.js');
var Color = require('./Color.js');
var Button = require('./Button.js');

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