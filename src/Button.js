require('./ImageData.js');
var Color = require('./Color.js');
var _ = require('./util.js');

function Button(corruptor) {
    this.corruptor = corruptor;
    this.options = corruptor.options;
    this.imageData = corruptor.imageData;

    this.features = {};
    this.ruleset = {};
}


// - 小圆角
// - 垂直线性渐变
// - 简单外阴影
// - 大padding
// - 小边框
Button.prototype.parse = function() {
    this.outerColor = this.imageData.getOuterColor();
    this.imageData = this.imageData.trim(null, 2);    // trim保留2像素边框
    // this.laplaceBoolXImageData = this.imageData.distanceLaplaceX().bool(this.options.laplaceThreshold);
    // this.laplaceBoolYImageData = this.imageData.distanceLaplaceY().bool(this.options.laplaceThreshold);
    this.gradientBoolXImageData = this.imageData.gradientX().bool(this.options.gradientThreshold);
    this.gradientBoolYImageData = this.imageData.gradientY().bool(this.options.gradientThreshold);
    // this.gradientBoolHighXImageData = this.imageData.gradientX().bool(this.options.gradientHighThreshold);
    // this.gradientBoolHighYImageData = this.imageData.gradientY().bool(this.options.gradientHighThreshold);

    // 获取双向bool值
    var xOrBools = this.gradientBoolXImageData.getXOrBools();
    var yOrBools = this.gradientBoolYImageData.getYOrBools();

    // 纯内边距
    var innerBoundary = {};
    var innerXBoundary = _.getBoundaryOfBools(xOrBools);
    var innerYBoundary = _.getBoundaryOfBools(yOrBools);
    innerBoundary.left = innerXBoundary.start;
    innerBoundary.right = innerXBoundary.end;
    innerBoundary.top = innerYBoundary.start;
    innerBoundary.bottom = innerYBoundary.end;
    xOrBools = this.gradientBoolXImageData.getXOrBools(innerBoundary.top, innerBoundary.bottom);
    yOrBools = this.gradientBoolYImageData.getYOrBools(innerBoundary.left, innerBoundary.right);

    // 获取双向sections
    var xSections = _.getSections(xOrBools);
    var ySections = _.getSections(yOrBools);

    // @TODO: 大阴影、大边框问题
    var xSectionsBoundary = _.getBoundaryFromMax(xSections, xOrBools.length/2);
    var ySectionsBoundary = _.getBoundaryFromMax(ySections, yOrBools.length/2);

    if(xSectionsBoundary.start !== xSectionsBoundary.end) {
        var xSectionsMiddles = xSections.splice(xSectionsBoundary.start + 1, xSectionsBoundary.end - xSectionsBoundary.start - 1);
        xSections.splice(xSectionsBoundary.start + 1, 0, xSectionsMiddles.sum());
        xSectionsBoundary.end -= xSectionsMiddles.length - 1;
    }

    if(ySectionsBoundary.start !== ySectionsBoundary.end) {
        var ySectionsMiddles = ySections.splice(ySectionsBoundary.start + 1, ySectionsBoundary.end - ySectionsBoundary.start - 1)
        ySectionsBoundary.start !== ySectionsBoundary.end && ySections.splice(ySectionsBoundary.start + 1, 0, ySectionsMiddles.sum());
        ySectionsBoundary.end -= ySectionsMiddles.length - 1;
    }

    // 外边距
    var borderBoundary = {};
    borderBoundary.left = xSections[0];
    borderBoundary.right = this.imageData.width - xSections[xSections.length - 1] - 1;
    borderBoundary.top = ySections[0];
    borderBoundary.bottom = this.imageData.height - ySections[ySections.length - 1] - 1;

    // 判断特性
    // box-sizing: border-box;
    // width & height
    this.features['width'] = borderBoundary.right - borderBoundary.left + 1;
    this.features['height'] = borderBoundary.bottom - borderBoundary.top + 1;    

    if(xSections.length === 2) {
    } else if(xSections.length >= 3) {
        // border
        // 去除边缘1px误差
        if(xSections[1] > this.options.maxBorder && xSections[xSections.length - 2] >= this.options.maxBorder) {
        } else {
            this.features['border-left-width'] = xSections[1];
            this.features['border-left-color'] = _.getEqualColors(
                this.imageData.getColors(null, borderBoundary.left, innerBoundary.top + 1, this.features['border-left-width'], innerBoundary.bottom - innerBoundary.top - 1),
                this.options.warning > 1 && 'border-left-colors'
            );
            this.features['border-right-width'] = xSections[xSections.length - 2];
            this.features['border-right-color'] = _.getEqualColors(
                this.imageData.getColors(null, xSections.slice(0, xSections.length - 2).sum(), innerBoundary.top + 1, this.features['border-right-width'], innerBoundary.bottom - innerBoundary.top - 1),
                this.options.warning > 1 && 'border-right-colors'
            );
        }

        // padding
        if(xSectionsBoundary.start === xSectionsBoundary.end)
            this.features['padding-left'] = this.features['padding-right'] = (xSections[xSectionsBoundary.start]/40>>0)*10;
        else {
            this.features['padding-left'] = xSections[xSectionsBoundary.start];
            this.features['padding-right'] = xSections[xSectionsBoundary.end];
        }
    }

    if(ySections.length === 2) {
    } else if(ySections.length >= 3) {
        // border
        // 去除边缘1px误差
        if(ySections[1] > this.options.maxBorder && ySections[ySections.length - 2] >= this.options.maxBorder) {
        } else {
            this.features['border-top-width'] = ySections[1];
            this.features['border-top-color'] = _.getEqualColors(
                this.imageData.getColors(null, innerBoundary.left + 1, borderBoundary.top, innerBoundary.right - innerBoundary.left - 1, this.features['border-top-width']),
                this.options.warning > 1 && 'border-top-colors'
            );
            this.features['border-bottom-width'] = ySections[ySections.length - 2];
            this.features['border-bottom-color'] = _.getEqualColors(
                this.imageData.getColors(null, innerBoundary.left + 1, ySections.slice(0, ySections.length - 2).sum(), innerBoundary.right - innerBoundary.left - 1, this.features['border-bottom-width']),
                this.options.warning > 1 && 'border-bottom-colors'
            );
        }
    }

    // 圆角边距
    // border-radius
    // - 目前只考虑四个圆角相等的情况
    // var borderRadiuses = [
    //     innerBoundary.left - borderBoundary.left + 1 - (this.features['border-left-width'] || 0),
    //     borderBoundary.right - innerBoundary.right + 1 - (this.features['border-right-width'] || 0),
    //     innerBoundary.top - borderBoundary.top + 1 - (this.features['border-top-width'] || 0),
    //     borderBoundary.bottom - innerBoundary.bottom + 1 - (this.features['border-bottom-width'] || 0)
    // ];

    this.features['border-top-left-radius'] = [];
    this.features['border-top-right-radius'] = [];
    this.features['border-bottom-left-radius'] = [];
    this.features['border-bottom-right-radius'] = [];
    // console.log(borderBoundary, innerBoundary, borderRadiuses);
    for(var i = 0; i < this.features['height']; i++)
        if(Color.diffDistancePercent(this.outerColor, this.imageData.getColor(borderBoundary.left, borderBoundary.top + i), this.imageData.getColor(borderBoundary.left, innerBoundary.top + 1)) > this.options.diffPercent) {
            this.features['border-top-left-radius'].push(i ? i + 1 : 0);
            break;
        }
    for(var i = 0; i < this.features['width']; i++)
        if(Color.diffDistancePercent(this.outerColor, this.imageData.getColor(borderBoundary.left + i, borderBoundary.top), this.imageData.getColor(innerBoundary.left + 1, borderBoundary.top)) > this.options.diffPercent) {
            this.features['border-top-left-radius'].push(i ? i + 1 : 0);
            break;
        }
    for(var i = 0; i < this.features['height']; i++)
        if(Color.diffDistancePercent(this.outerColor, this.imageData.getColor(borderBoundary.right, borderBoundary.top + i), this.imageData.getColor(borderBoundary.right, innerBoundary.top + 1)) > this.options.diffPercent) {
            this.features['border-top-right-radius'].push(i ? i + 1 : 0);
            break;
        }
    for(var i = 0; i < this.features['width']; i++)
        if(Color.diffDistancePercent(this.outerColor, this.imageData.getColor(borderBoundary.right - i, borderBoundary.top), this.imageData.getColor(innerBoundary.right - 1, borderBoundary.top)) > this.options.diffPercent) {
            this.features['border-top-right-radius'].push(i ? i + 1 : 0);
            break;
        }
    for(var i = 0; i < this.features['height']; i++)
        if(Color.diffDistancePercent(this.outerColor, this.imageData.getColor(borderBoundary.left, borderBoundary.bottom - i), this.imageData.getColor(borderBoundary.left, innerBoundary.bottom - 1)) > this.options.diffPercent) {
            this.features['border-bottom-left-radius'].push(i ? i + 1 : 0);
            break;
        }
    for(var i = 0; i < this.features['width']; i++)
        if(Color.diffDistancePercent(this.outerColor, this.imageData.getColor(borderBoundary.left + i, borderBoundary.bottom), this.imageData.getColor(innerBoundary.left + 1, borderBoundary.bottom)) > this.options.diffPercent) {
            this.features['border-bottom-left-radius'].push(i ? i + 1 : 0);
            break;
        }
    for(var i = 0; i < this.features['height']; i++)
        if(Color.diffDistancePercent(this.outerColor, this.imageData.getColor(borderBoundary.right, borderBoundary.bottom - i), this.imageData.getColor(borderBoundary.right, innerBoundary.bottom - 1)) > this.options.diffPercent) {
            this.features['border-bottom-right-radius'].push(i ? i + 1 : 0);
            break;
        }
    for(var i = 0; i < this.features['width']; i++)
        if(Color.diffDistancePercent(this.outerColor, this.imageData.getColor(borderBoundary.right - i, borderBoundary.bottom), this.imageData.getColor(innerBoundary.right - 1, borderBoundary.bottom)) > this.options.diffPercent) {
            this.features['border-bottom-right-radius'].push(i ? i + 1 : 0);
            break;
        }

    if(!_.areAllEqual(this.features['border-top-left-radius']))
        this.options.warning > 1 && console.log('border-top-left-radiuses are not equal', this.features['border-top-left-radius']);
    this.features['border-top-left-radius'] = this.features['border-top-left-radius'].average()>>0;
    if(!_.areAllEqual(this.features['border-top-right-radius']))
        this.options.warning > 1 && console.log('border-top-right-radiuses are not equal', this.features['border-top-right-radius']);
    this.features['border-top-right-radius'] = this.features['border-top-right-radius'].average()>>0;
    if(!_.areAllEqual(this.features['border-bottom-left-radius']))
        this.options.warning > 1 && console.log('border-bottom-left-radiuses are not equal', this.features['border-bottom-left-radius']);
    this.features['border-bottom-left-radius'] = this.features['border-bottom-left-radius'].average()>>0;
    if(!_.areAllEqual(this.features['border-bottom-right-radius']))
        this.options.warning > 1 && console.log('border-bottom-right-radiuses are not equal', this.features['border-bottom-right-radius']);
    this.features['border-bottom-right-radius'] = this.features['border-bottom-right-radius'].average()>>0;

    return this.features;
}

Button.prototype.interpret = function() {
    // $line-height
    this.ruleset['$line-height'] = (this.options.approximate ? _.approximate(this.features['height']) : this.features['height']) + 'px';

    // border
    var borderWidths = [
        this.features['border-left-width'],
        this.features['border-right-width'],
        this.features['border-top-width'],
        this.features['border-bottom-width']
    ];

    var borderColors = [
        this.features['border-left-color'],
        this.features['border-right-color'],
        this.features['border-top-color'],
        this.features['border-bottom-color']
    ];

    if(_.areAllExists(borderWidths) && _.areAllExists(borderColors)) {
        if(_.areAllEqual(borderWidths) && Color.areAllEqual(borderColors))
            this.ruleset['border'] = this.features['border-left-width'] + 'px solid ' + this.features['border-left-color'].toRGBHex();
        else {
            this.options.warning > 0 && console.warn('borders are not all equal!', borderWidths, borderColors.join(', '));
            this.ruleset['border-left'] = this.features['border-left-width'] + 'px solid ' + this.features['border-left-color'].toRGBHex();
            this.ruleset['border-right'] = this.features['border-right-width'] + 'px solid ' + this.features['border-right-color'].toRGBHex();
            this.ruleset['border-top'] = this.features['border-top-width'] + 'px solid ' + this.features['border-top-color'].toRGBHex();
            this.ruleset['border-bottom'] = this.features['border-bottom-width'] + 'px solid ' + this.features['border-bottom-color'].toRGBHex();
        }
    }

    // padding-x
    var paddingXs = [
        this.features['padding-left'],
        this.features['padding-right']
    ];
    if(_.areAllExists(paddingXs)) {
        if(_.areAllEqual(paddingXs))
            this.ruleset['padding'] = '0 ' + (this.options.approximate ? _.approximate(paddingXs[0]) : paddingXs[0]) + 'px';
        else {
            if(this.options.smart) {
                var paddingX = (paddingXs[0] + paddingXs[1])/2>>0;
                this.ruleset['padding'] = '0 ' + (this.options.approximate ? _.approximate(paddingX) : paddingX) + 'px';
            } else {
                this.options.warning > 0 && console.warn('padding-xs are not equal!', paddingXs[0], paddingXs[1]);
                this.ruleset['padding-left'] = paddingXs[0];
                this.ruleset['padding-right'] = paddingXs[1];
            }
        }
    }

    // border-radius
    var borderRadiuses = [
        this.features['border-top-left-radius'],
        this.features['border-top-right-radius'],
        this.features['border-bottom-left-radius'],
        this.features['border-bottom-right-radius']
    ];

    if(_.areAllExists(borderRadiuses)) {
        if(_.areAllEqual(borderRadiuses))
            if(this.features['border-top-left-radius'])
                this.ruleset['$border-radius'] = this.features['border-top-left-radius'] + 'px';
        else {
            this.options.warning > 0 && console.warn('border-radiuses are not all equal!', borderRadiuses.join(', '));
        }
    }
}

Button.prototype.corrupt = function() {
    this.parse();
    this.interpret();
    console.log(this.features);
    // console.log(this.ruleset);

    return this.ruleset;
}

module.exports = Button;