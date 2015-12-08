var Color = require('./Color.js');

var _ = {};

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

Array.prototype.average = function() {
    return this.sum()/this.length;
}

_.push = function(map, key, value) {
    if(map[key])
        map[key].push(value);
    else
        map[key] = [value];
}

_.areAllEqual = function(arr) {
    for(var i = 1; i < arr.length; i++)
        if(arr[i] !== arr[i - 1])
            return false;
    return true;
}


_.isExists = function(item) {
    return item !== undefined;
}

_.areAllExists = function(arr) {
    return arr.every(function(item) {
        return item !== undefined;
    });
}

_.areAllTrue = function(arr) {
    return arr.every(function(item) {
        return !!item;
    });
}

// Boundary Problem
_.getBoundaryOfBools = function(arr) {
    var start, end, count;

    count = 0;
    for(start = 1; i < arr.length; start++) {
        if(arr[start] != arr[start - 1])
            count++;
        if(count === 2)
            break;
    }

    count = 0;
    for(end = arr.length - 2; end >= 0; end--) {
        if(arr[end] != arr[end + 1])
            count++;
        if(count === 2)
            break;
    }

    return {start: start - 1, end: end};
}

_.getSections = function(arr) {
    var sections = [];

    var width = 0;
    for(var i = 0; i < arr.length; i++)
        if(arr[i]) {
            sections.push(width);
            width = 1;
        } else
            width++;
    
    sections.push(width);

    return sections;
}

_.getBoundaryFromMax = function(arr, half) {
    var start = 0, end = 0;
    
    var max = 0, sum = 0;
    for(var i = 0; i < arr.length && sum < half; i++) {
        if(arr[i] >= max) {
            max = arr[i];
            start = i;
        }
        sum += arr[i];
    }

    var max = 0, sum = 0;
    for(var i = arr.length - 1; i >= 0 && sum < half; i--) {
        if(arr[i] >= max) {
            max = arr[i];
            end = i;
        }
        sum += arr[i];
    }

    return {start: start, end: end};
}

//  0,  1,  2,  3,  4,  5,  6,  7,  8,  9
// 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
// 20, 21, 22, 23, 24, 25, 26, 27, 28, 29

// font-size =
// -
// 10, 10, 12, 14, 14, 16, 16, 18, 18, 20

// padding = 
//  0,  1,  2,  3,  4,  5,  6,  8,  8, 10
// 10, 10, 12, 14, 14, 15, 16, 18, 18, 20
// 20, 20, 22, 24, 24, 25, 26, 27, 28, 30

// height =
//  0,  1,  2,  3,  4,  5,  6,  8,  8, 10
// 10, 10, 12, 14, 14, 15, 16, 18, 18, 20
// 20, 20, 22, 24, 24, 25, 26, 27, 28, 30
_.approximate = function(number) {
    number = Math.round(number);

    if(number <= 10)
        return number;
    else if(!(number%5) || !(number%2))
        return number;
    else if(number%10 === 1)
        return number - 1;
    else
        return number + 1;
}

_.getEqualColors = function(colors, warning) {
    if(Color.areAllEqual(colors))
        return colors[0];
    else {
        warning && console.warn(warning + ' are not all equal!'); //, colors.join(', '));
        return Color.average(colors);
    }
}

module.exports = _;