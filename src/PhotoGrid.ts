/// <reference path="./defs.d.ts"/>

import * as _ from "lodash";
import {ReadImageMeta, ReadImageFiles, IImageDimensions, IComputedImge, INormalizedImage, IResizedImage, ISettings} from "./types";
import {resize, setTargetSize} from "./utility";
import GridRow from "./GridRow";

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
class PhotoGrid {

  private getImageMeta: ReadImageMeta<IImageDimensions>
  private filesGetter: ReadImageFiles<IImageDimensions>

  // list of images that will be used for creating rows of images
  private items: Array<INormalizedImage>
  // copy of the original received list of images
  private originalItems: Array<INormalizedImage>

  private rows: Array<GridRow>

  private lastWidth: number

  constructor(public settings: ISettings<IImageDimensions>, items: Array<IImageDimensions>) {
    // compute the targetHeight value
    this.settings.targetHeight = (this.settings.minHeight + this.settings.maxHeight) / 2;
    this.getImageMeta = settings.getImageMeta;
    this.filesGetter = settings.filesGetter;
    this.rows = [];

    this.originalItems = _.cloneDeep(items).map((item) => {
      return this.normalizeImage(item);
    });
  }

  /**
   * normalizeImage() sets the targetSize property on the given image based on the computed
   * row target height;
   */
  private normalizeImage(image: IImageDimensions): INormalizedImage {
    return setTargetSize(this.getImageMeta(image), this.settings.targetHeight);
  }

  /**
   * setBestFiles() will set the best file that must be used for displaying the image in grid
   */
  private setBestFiles() {
    const filesGetter = this.filesGetter;

    if (typeof filesGetter !== 'function') return this;

    this.rows.forEach((gridRow) => {
      gridRow.getItems().forEach((item) => {
        const files = filesGetter(item);
        let itemSize= item.resized,
          availableSizes: Array<number> = _.sortBy(_.pluck(files, 'width')),
          bestWidth: number, bestFile: IImageDimensions;

        bestWidth = _.find(availableSizes, (size) => {
          return size >= itemSize.width;
        });

        if (bestWidth) {
          bestFile = _.find(files, {
            width: bestWidth
          });
        } else {
          bestFile = _.find(files, {
            width: availableSizes[availableSizes.length - 1]
          });
        }

        itemSize.bestFile = bestFile;
      });
    });

    return this;
  }

  /**
   * getRows() computes the rows that will form the grid and return it
   */
  public getRows(width: number): Array<GridRow> {
    const lastWidth = this.lastWidth;

    if (lastWidth === width) return this.rows;

    this.settings.containerWidth = width || this.settings.containerWidth;
    this.items = _.cloneDeep(this.originalItems);

    // clean the rows
    this.rows.splice(0);

    while (this.items.length > 0) {
      this.rows.push(new GridRow(this.settings, this.items));
    }

    this.lastWidth = width;

    this.setBestFiles();

    return this.rows;
  }
}

export {PhotoGrid};