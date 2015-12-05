var _ = require("lodash");
var utility_1 = require("./utility");
var GridRow = (function () {
    function GridRow(settings, items) {
        this.rowItems = [];
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
    GridRow.prototype.makeRow = function () {
        while (this.remainingItems.length > 0) {
            var candidateImage = this.remainingItems[0];
            if (this.cumulatedWidth >= this.containerWidth) {
                break;
            }
            if (candidateImage.targetSize.height < this.minHeight) {
                this.remainingItems.splice(0, 1);
                continue;
            }
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
    GridRow.prototype.setExactSizeOnItems = function () {
        var items = this.getItems();
        var cumulatedBorderWidth = items.length * this.borderWidth;
        var imagesTotalWidth = this.containerWidth - cumulatedBorderWidth;
        var imagesCumulatedWidth = this.cumulatedWidth - cumulatedBorderWidth;
        var widthDelta = imagesTotalWidth - imagesCumulatedWidth;
        var smallestImage = _.min(items, function (item) { return item.width; });
        items.forEach(function (item) {
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
    GridRow.prototype.changeContainerWidth = function (newContainerWidth) {
        this.containerWidth = newContainerWidth;
        this.setExactSizeOnItems();
    };
    GridRow.prototype.getItems = function () {
        return this.rowItems;
    };
    return GridRow;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GridRow;
//# sourceMappingURL=GridRow.js.map