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