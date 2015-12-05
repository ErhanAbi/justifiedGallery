var _ = require("lodash");
var utility_1 = require("./utility");
var GridRow_1 = require("./GridRow");
var PhotoGrid = (function () {
    function PhotoGrid(settings, items) {
        var _this = this;
        this.settings = settings;
        this.settings.targetHeight = (this.settings.minHeight + this.settings.maxHeight) / 2;
        this.getImageMeta = settings.getImageMeta;
        this.filesGetter = settings.filesGetter;
        this.rows = [];
        this.originalItems = _.cloneDeep(items).map(function (item) {
            return _this.normalizeImage(item);
        });
    }
    PhotoGrid.prototype.normalizeImage = function (image) {
        return utility_1.setTargetSize(this.getImageMeta(image), this.settings.targetHeight);
    };
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
    PhotoGrid.prototype.getRows = function (width) {
        var lastWidth = this.lastWidth;
        if (lastWidth === width)
            return this.rows;
        this.settings.containerWidth = width || this.settings.containerWidth;
        this.items = _.cloneDeep(this.originalItems);
        this.rows.splice(0);
        while (this.items.length > 0) {
            this.rows.push(new GridRow_1.default(this.settings, this.items));
        }
        this.lastWidth = width;
        this.setBestFiles();
        return this.rows;
    };
    return PhotoGrid;
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PhotoGrid;
//# sourceMappingURL=PhotoGrid.js.map