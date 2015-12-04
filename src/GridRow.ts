
import * as _ from "lodash";
import {resize, setTargetSize} from "./utility";
import {ReadImageMeta, ReadImageFiles, IImageDimensions, IComputedImge, INormalizedImage, IResizedImage, ISettings} from "types";


/**
 * GridRow computes the number of items that can fit in this row based on the given settings and images;
 * 
 * Note that this will remove the used images from the received list
 * 
 * @internally this class is used for computing the grid gallery
 */
class GridRow {
  
  // container's width we need to put the images into
  private containerWidth: number
  
  // indicates the width cumulated
  private cumulatedWidth: number

  // optional border value
  private borderWidth: number

  // the calculated height so that the images in this row will fit the
  // container's width
  private currentHeight: number
  
  // the base height value we are targeting to have for this row;
  // ideally, the row's currentHeight will be the same value with targetHeight
  private targetHeight: number
  
  // accepted minimum height; images having a smaller height will be removed
  private minHeight: number

  // accepted maximum height; more images will get into this row if height it's
  // bigger than this value  
  private maxHeight: number

  // remaining items to use when filling the row
  private remainingItems: Array<INormalizedImage>
  
  // list of items within this row
  private rowItems: Array<IResizedImage>

  constructor(settings: ISettings<INormalizedImage>, items: Array<INormalizedImage>) {
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
  private canAccept(candidateImage: INormalizedImage): boolean {
    const hasSmallImage = this.currentHeight < this.targetHeight;
    const isEmptyRow = this.getItems().length === 0;

    if (hasSmallImage || isEmptyRow) return true;

    const imageHeight = candidateImage.targetSize.height;
    const imageWidth = candidateImage.targetSize.width + this.borderWidth;
    const currentHeight = this.currentHeight;
    const imageIsSmaller = imageHeight < currentHeight;

    if (imageIsSmaller) {
      this.recomputeRow(imageHeight);
    }

    if (this.cumulatedWidth + imageWidth <= this.containerWidth) return true;

    const minDelta = this.currentHeight - this.minHeight;
    const maxDelta = this.maxHeight - this.currentHeight;
    const acceptanceRatio = Math.min(1, maxDelta / minDelta);

    const remainingWidth = this.containerWidth - this.cumulatedWidth;
    const surplusDelta = imageWidth - remainingWidth;
    const surplusRatio = Math.min(1, surplusDelta / remainingWidth);

    if (imageIsSmaller) this.recomputeRow(currentHeight);

    return (imageWidth * acceptanceRatio * surplusRatio <= this.containerWidth - this.cumulatedWidth);
  }

  /**
   * recomputeRow() readjusts row's dimensions - cumulatedWidth and currentHeight - 
   * based on currently added images or an optional height parameter
   */
  private recomputeRow(optHeight?: number): void {
    const heights = this.getItems().map((image) => {
      return image.targetSize.height;
    }),
      minHeight = optHeight || Math.min(...heights);

    this.getItems().forEach((image) => {
      setTargetSize(image, minHeight);
    });
    this.currentHeight = minHeight;
    this.cumulatedWidth = this.getItems().reduce((result, image) => {
      result += image.targetSize.width + this.borderWidth;
      return result;
    }, 0);
  }

  /**
   * makeRow() fills the row with images
   */
  private makeRow(): void {
    while (this.remainingItems.length > 0) {
      let candidateImage = this.remainingItems[0];

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
  }

  /**
   * setExactSizeOnItems() will resize the images, after the row was filled, so that
   * the whole row width is filled
   */
  private setExactSizeOnItems(): void {
    let items = this.getItems();
    const cumulatedBorderWidth = items.length * this.borderWidth;
    const imagesTotalWidth = this.containerWidth - cumulatedBorderWidth;
    const imagesCumulatedWidth = this.cumulatedWidth - cumulatedBorderWidth;

    const widthDelta = imagesTotalWidth - imagesCumulatedWidth;
    const smallestImage = _.min(items, (item) => item.width);

    items.forEach((item) => {

      // let the original layout in this case
      if (widthDelta >= imagesCumulatedWidth) {
        item.resized = item.targetSize
        return;
      }

      let newWidth = (item.targetSize.width / imagesCumulatedWidth) * imagesTotalWidth;

      item.resized = resize(item, {
        width: newWidth
      });
    });
  }

  /**
   * changeContainerWidth changes the row's container width
   * use this with caution; this method is used internally for caching
   * the rows
   * @param  {Number} newContainerWidth new container's width
   */
  public changeContainerWidth(newContainerWidth) {
    this.containerWidth = newContainerWidth;
    this.setExactSizeOnItems();
  }

  public getItems(): Array<IResizedImage> {
    return this.rowItems;
  }
}

export default GridRow;
