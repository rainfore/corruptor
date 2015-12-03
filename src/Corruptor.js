require('./ImageData.js');
var Color = require('./Color.js');
var Box = require('./Box.js');

function Corruptor(imageData) {
    this.options = {
        allowance: 5,
        density: 5
    }

    this.features = {};

    this.imageData = imageData;
}


Corruptor.prototype.corrupt = function() {
    var box = new Box(this);
    this.features = box.corrupt();


    this.testImageData = box.edgeImageData;
    console.log(this.features);
    return this.features;
}

module.exports = Corruptor;