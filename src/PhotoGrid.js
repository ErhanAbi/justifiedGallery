/// <reference path="./defs.d.ts"/>
var _ = require("lodash");
var utility_1 = require("./utility");
var GridRow_1 = require("./GridRow");
/**
 * PhotoGrid class is used on determining the rows that should be displayed in a justified gallery grid;
 *
 * Given a range of heights, determine how many images should be included in each row, with each image's
 * dimensions in order to fit
 *
 * @example
 *   let images = []; // a list of images
 *   var photoGrid = new PhotoGrid({
 *     // mandatory, in px
 *     minHeight: 150,
 *     maxHeight: 350,
 *     // mandatory, this function must return an object
 *     // having width and height properties
 *     getImageMeta: function(image) {
 *       image.width = image.originalDimensions.width;
 *       image.height = image.originalDimensions.height;
 *       return image;
 *     },
 *     // optional, in px
 *     borderWidth: 2
 *   }, images);
 *
 *   // container width mandatory, in pixels
 *   let rows = photoGrid.getRows(1200);
 *   let row0 = rows[0];
 *   let row0Items = row0.getItems();
 */
var PhotoGrid = (function () {
    function PhotoGrid(settings, items) {
        var _this = this;
        this.settings = settings;
        // compute the targetHeight value
        this.settings.targetHeight = (this.settings.minHeight + this.settings.maxHeight) / 2;
        this.getImageMeta = settings.getImageMeta;
        this.filesGetter = settings.filesGetter;
        this.rows = [];
        this.originalItems = _.cloneDeep(items).map(function (item) {
            return _this.normalizeImage(item);
        });
    }
    /**
     * normalizeImage() sets the targetSize property on the given image based on the computed
     * row target height;
     */
    PhotoGrid.prototype.normalizeImage = function (image) {
        return utility_1.setTargetSize(this.getImageMeta(image), this.settings.targetHeight);
    };
    /**
     * setBestFiles() will set the best file that must be used for displaying the image in grid
     */
    PhotoGrid.prototype.setBestFiles = function () {
        var filesGetter = this.filesGetter;
        if (typeof filesGetter !== 'function')
            return this;
        this.rows.forEach(function (gridRow) {
            gridRow.getItems().forEach(function (item) {
                var files = filesGetter(item);
                var itemSize = item.resized, availableSizes = _.sortBy(_.pluck(files, 'width')), bestWidth, bestFile;
                bestWidth = _.find(availableSizes, function (size) {
                    return size >= itemSize.width;
                });
                if (bestWidth) {
                    bestFile = _.find(files, {
                        width: bestWidth
                    });
                }
                else {
                    bestFile = _.find(files, {
                        width: availableSizes[availableSizes.length - 1]
                    });
                }
                itemSize.bestFile = bestFile;
            });
        });
        return this;
    };
    /**
     * getRows() computes the rows that will form the grid and return it
     */
    PhotoGrid.prototype.getRows = function (width) {
        var lastWidth = this.lastWidth;
        if (lastWidth === width)
            return this.rows;
        this.settings.containerWidth = width || this.settings.containerWidth;
        this.items = _.cloneDeep(this.originalItems);
        // clean the rows
        this.rows.splice(0);
        while (this.items.length > 0) {
            this.rows.push(new GridRow_1["default"](this.settings, this.items));
        }
        this.lastWidth = width;
        this.setBestFiles();
        return this.rows;
    };
    return PhotoGrid;
})();
exports.PhotoGrid = PhotoGrid;
