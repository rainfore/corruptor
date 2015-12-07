var Corruptor = require('./src/Corruptor.js');
Corruptor._ = require('./src/util.js');
Corruptor.Color = require('./src/Color.js');
Corruptor.manipulator = require('./src/manipulator.js');

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