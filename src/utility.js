function setTargetSize(item, targetHeight) {
    var w = item.width, h = item.height;
    var targetSize = {
        height: Math.min(targetHeight, h)
    };
    item.targetSize = resize(item, targetSize);
    return item;
}
exports.setTargetSize = setTargetSize;
;
function resize(item, newSize) {
    var newWidth = newSize.width, newHeight = newSize.height, itemHeight = item.height, itemWidth = item.width;
    var resizedDimensions = {};
    if (newWidth) {
        resizedDimensions.width = newWidth;
        resizedDimensions.height = newWidth * itemHeight / itemWidth;
    }
    if (newHeight) {
        resizedDimensions.height = newHeight;
        resizedDimensions.width = itemWidth * newHeight / itemHeight;
    }
    return resizedDimensions;
}
exports.resize = resize;
