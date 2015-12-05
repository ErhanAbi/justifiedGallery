var _ = require("lodash");
var utility_1 = require("./utility");
/**
 * GridRow computes the number of items that can fit in this row based on the given settings and images;
 *
 * Note that this will remove the used images from the received list
 *
 * @internally this class is used for computing the grid gallery
 */
var GridRow = (function () {
    function GridRow(settings, items) {
        this.targetHeight = settings.targetHeight || 200;
        this.containerWidth = settings.containerWidth;
        this.cumulatedWidth = 0;
        this.currentHeight = this.targetHeight;
        this.minHeight = settings.minHeight || 100;
        this.maxHeight = settings.maxHeight || Infinity;
        this.borderWidth = settings.borderWidth || 0;
        this.remainingItems = items;
        this.makeRow();
    }
    /**
     * canAccept() checks if the given image can fit this row, based on cumulated with;
     * It also takes into account the height of the row which is set by the previous items added
     * to this row;
     */
    GridRow.prototype.canAccept = function (candidateImage) {
        var hasSmallImage = this.currentHeight < this.targetHeight;
        var isEmptyRow = this.getItems().length === 0;
        if (hasSmallImage || isEmptyRow)
            return true;
        var imageHeight = candidateImage.targetSize.height;
        var imageWidth = candidateImage.targetSize.width + this.borderWidth;
        var currentHeight = this.currentHeight;
        var imageIsSmaller = imageHeight < currentHeight;
        if (imageIsSmaller) {
            this.recomputeRow(imageHeight);
        }
        if (this.cumulatedWidth + imageWidth <= this.containerWidth)
            return true;
        var minDelta = this.currentHeight - this.minHeight;
        var maxDelta = this.maxHeight - this.currentHeight;
        var acceptanceRatio = Math.min(1, maxDelta / minDelta);
        var remainingWidth = this.containerWidth - this.cumulatedWidth;
        var surplusDelta = imageWidth - remainingWidth;
        var surplusRatio = Math.min(1, surplusDelta / remainingWidth);
        if (imageIsSmaller)
            this.recomputeRow(currentHeight);
        return (imageWidth * acceptanceRatio * surplusRatio <= this.containerWidth - this.cumulatedWidth);
    };
    /**
     * recomputeRow() readjusts row's dimensions - cumulatedWidth and currentHeight -
     * based on currently added images or an optional height parameter
     */
    GridRow.prototype.recomputeRow = function (optHeight) {
        var _this = this;
        var heights = this.getItems().map(function (image) {
            return image.targetSize.height;
        }), minHeight = optHeight || Math.min.apply(Math, heights);
        this.getItems().forEach(function (image) {
            utility_1.setTargetSize(image, minHeight);
        });
        this.currentHeight = minHeight;
        this.cumulatedWidth = this.getItems().reduce(function (result, image) {
            result += image.targetSize.width + _this.borderWidth;
            return result;
        }, 0);
    };
    /**
     * makeRow() fills the row with images
     */
    GridRow.prototype.makeRow = function () {
        while (this.remainingItems.length > 0) {
            var candidateImage = this.remainingItems[0];
            // we're done
            if (this.cumulatedWidth >= this.containerWidth) {
                break;
            }
            // remove the image if it's not compatible with our image gallery settings
            if (candidateImage.targetSize.height < this.minHeight) {
                this.remainingItems.splice(0, 1);
                continue;
            }
            // check if we can add the image in this row
            if (this.canAccept(candidateImage)) {
                this.getItems().push(candidateImage);
                this.recomputeRow();
                this.remainingItems.splice(0, 1);
                continue;
            }
            break;
        }
        return this.setExactSizeOnItems();
    };
    /**
     * setExactSizeOnItems() will resize the images, after the row was filled, so that
     * the whole row width is filled
     */
    GridRow.prototype.setExactSizeOnItems = function () {
        var items = this.getItems();
        var cumulatedBorderWidth = items.length * this.borderWidth;
        var imagesTotalWidth = this.containerWidth - cumulatedBorderWidth;
        var imagesCumulatedWidth = this.cumulatedWidth - cumulatedBorderWidth;
        var widthDelta = imagesTotalWidth - imagesCumulatedWidth;
        var smallestImage = _.min(items, function (item) { return item.width; });
        items.forEach(function (item) {
            // let the original layout in this case
            if (widthDelta >= imagesCumulatedWidth) {
                item.resized = item.targetSize;
                return;
            }
            var newWidth = (item.targetSize.width / imagesCumulatedWidth) * imagesTotalWidth;
            item.resized = utility_1.resize(item, {
                width: newWidth
            });
        });
    };
    /**
     * changeContainerWidth changes the row's container width
     * use this with caution; this method is used internally for caching
     * the rows
     * @param  {Number} newContainerWidth new container's width
     */
    GridRow.prototype.changeContainerWidth = function (newContainerWidth) {
        this.containerWidth = newContainerWidth;
        this.setExactSizeOnItems();
    };
    GridRow.prototype.getItems = function () {
        return this.rowItems;
    };
    return GridRow;
})();
exports["default"] = GridRow;
