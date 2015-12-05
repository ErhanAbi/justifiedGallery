/// <reference path="../src/defs.d.ts" />
import { IImageDimensions, ISettings } from "./types";
import GridRow from "./GridRow";
declare class PhotoGrid {
    settings: ISettings<IImageDimensions>;
    private getImageMeta;
    private filesGetter;
    private items;
    private originalItems;
    private rows;
    private lastWidth;
    constructor(settings: ISettings<IImageDimensions>, items: Array<IImageDimensions>);
    private normalizeImage(image);
    private setBestFiles();
    getRows(width: number): Array<GridRow>;
}
export { PhotoGrid };
