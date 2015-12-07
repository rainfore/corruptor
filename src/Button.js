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
    // this.boolCorruptXImageData = this.imageData.distanceLaplaceX().boolCorruptX(this.options.laplaceThreshold);
    // this.boolCorruptYImageData = this.imageData.distanceLaplaceY().boolCorruptY(this.options.laplaceThreshold);
    this.gradientBoolXImageData = this.imageData.gradientX().bool(this.options.gradientThreshold);
    this.gradientBoolYImageData = this.imageData.gradientY().bool(this.options.gradientThreshold);

    // 获取双向bool值
    var xOrBools = this.gradientBoolXImageData.getXOrBools();
    var yOrBools = this.gradientBoolYImageData.getYOrBools();
    var radiusInnerBoundary = {};
    var radiusInnerXBoundary = _.getBoundaryOfBools(xOrBools);
    var radiusInnerYBoundary = _.getBoundaryOfBools(yOrBools);
    radiusInnerBoundary.left = radiusInnerXBoundary.start;
    radiusInnerBoundary.right = radiusInnerXBoundary.end;
    radiusInnerBoundary.top = radiusInnerYBoundary.start;
    radiusInnerBoundary.bottom = radiusInnerYBoundary.end;
    xOrBools = this.gradientBoolXImageData.getXOrBools(radiusInnerBoundary.top, radiusInnerBoundary.bottom);
    yOrBools = this.gradientBoolYImageData.getYOrBools(radiusInnerBoundary.left, radiusInnerBoundary.right);

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

    var borderBoundary = {};
    borderBoundary.left = xSections[0];
    borderBoundary.right = xOrBools.length - xSections[xSections.length - 1] - 1;
    borderBoundary.top = ySections[0];
    borderBoundary.bottom = yOrBools.length - ySections[ySections.length - 1] - 1;

    // 判断特性
    // box-sizing: border-box;
    // width & height
    this.features['width'] = borderBoundary.right - borderBoundary.left + 1;
    this.features['height'] = borderBoundary.bottom - borderBoundary.top + 1;    

    if(xSections.length === 2) {
    } else if(xSections.length >= 3) {
        // border
        if(xSections[1] > this.options.maxBorder && xSections[xSections.length - 2] >= this.options.maxBorder) {
        } else {
            this.features['border-left-width'] = xSections[1];
            this.features['border-left-color'] = _.getEqualColors(
                this.imageData.getColors(null, borderBoundary.left, radiusInnerBoundary.top + 1, this.features['border-left-width'], radiusInnerBoundary.bottom - radiusInnerBoundary.top - 1),
                this.options.warning >= 2 && 'border-left-colors'
            );
            this.features['border-right-width'] = xSections[xSections.length - 2];
            this.features['border-right-color'] = _.getEqualColors(
                this.imageData.getColors(null, xSections.slice(0, xSections.length - 2).sum(), radiusInnerBoundary.top + 1, this.features['border-right-width'], radiusInnerBoundary.bottom - radiusInnerBoundary.top - 1),
                this.options.warning >= 2 && 'border-right-colors'
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
        if(ySections[1] > this.options.maxBorder && ySections[ySections.length - 2] >= this.options.maxBorder) {
        } else {
            this.features['border-top-width'] = ySections[1];
            this.features['border-top-color'] = _.getEqualColors(
                this.imageData.getColors(null, radiusInnerBoundary.left + 1, borderBoundary.top, radiusInnerBoundary.right - radiusInnerBoundary.left - 1, this.features['border-top-width']),
                this.options.warning >= 2 && 'border-top-colors'
            );
            this.features['border-bottom-width'] = ySections[ySections.length - 2];
            this.features['border-bottom-color'] = _.getEqualColors(
                this.imageData.getColors(null, radiusInnerBoundary.left + 1, ySections.slice(0, ySections.length - 2).sum(), radiusInnerBoundary.right - radiusInnerBoundary.left - 1, this.features['border-bottom-width']),
                this.options.warning >= 2 && 'border-bottom-colors'
            );
        }
    }

    // border-radius
    // - 目前只考虑四个圆角相等的情况
    var borderRadiuses = [
        radiusInnerBoundary.left - borderBoundary.left + 1 - (this.features['border-left-width'] || 0),
        borderBoundary.right - radiusInnerBoundary.right + 1 - (this.features['border-right-width'] || 0),
        radiusInnerBoundary.top - borderBoundary.top + 1 - (this.features['border-top-width'] || 0),
        borderBoundary.bottom - radiusInnerBoundary.bottom + 1 - (this.features['border-bottom-width'] || 0)
    ];

    console.log(borderBoundary, radiusInnerBoundary, borderRadiuses);

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
            this.options.warning >= 1 && console.warn('borders are not all equal!', borderWidths, borderColors.join(', '));
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
        if(paddingXs[0] === paddingXs[1])
            this.ruleset['padding'] = '0 ' + (this.options.approximate ? _.approximate(paddingXs[0]) : paddingXs[0]) + 'px';
        else {
            if(this.options.smart) {
                var paddingX = (paddingXs[0] + paddingXs[1])/2>>0;
                this.ruleset['padding'] = '0 ' + (this.options.approximate ? _.approximate(paddingX) : paddingX) + 'px';
            } else {
                this.options.warning >= 1 && console.warn('padding-xs are not equal!', paddingXs[0], paddingXs[1]);
                this.ruleset['padding-left'] = paddingXs[0];
                this.ruleset['padding-right'] = paddingXs[1];
            }
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