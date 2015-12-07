CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y, x+w, y+h, r);
    this.arcTo(x+w, y+h, x, y+h, r);
    this.arcTo(x, y+h, x, y, r);
    this.arcTo(x, y, x+w, y, r);
    // this.arcTo(x+r, y);
    this.closePath();
    return this;
}

var img = document.getElementById('image');

function preImage(img, success, error) {
    if(img.complete)
        img.getAttribute('src') ? success() : error();
    else
        img.onload = success;
}

function saveImage($a) {
    var canvas = document.getElementById('canvas');
    $a.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
}

preImage(img, function() {
    var canvas = document.getElementById('canvas');
    var width = canvas.width = img.width;
    var height = canvas.height = img.height;
    var context = canvas.getContext('2d');
    
    context.drawImage(img, 0, 0);
    var corruptor = new Corruptor(context.getImageData(0, 0, width, height));
    corruptor.corrupt();

    // trim
    width = canvas.width = corruptor.imageData.width;
    height = canvas.height = corruptor.imageData.height;
    context.putImageData(corruptor.testImageData, 0, 0);
}, function() {
    var canvas = document.getElementById('canvas');
    var width = canvas.width = 200;
    var height = canvas.height = 100;
    var context = canvas.getContext('2d');
    
    context.roundRect(20, 20, 60, 20, 4);
    context.strokeStyle = '#ccc';
    context.fillStyle = '#eee';
    context.stroke();
    context.fill();

    var corruptor = new Corruptor(context.getImageData(0, 0, width, height));
    corruptor.corrupt();

    // context.putImageData(corruptor.testImageData, 0, 0);
});