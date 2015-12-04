import { INormalizedImage, IResizedImage, ISettings } from "./types";
declare class GridRow {
    private containerWidth;
    private cumulatedWidth;
    private borderWidth;
    private currentHeight;
    private targetHeight;
    private minHeight;
    private maxHeight;
    private remainingItems;
    private rowItems;
    constructor(settings: ISettings<INormalizedImage>, items: Array<INormalizedImage>);
    private canAccept(candidateImage);
    private recomputeRow(optHeight?);
    private makeRow();
    private setExactSizeOnItems();
    changeContainerWidth(newContainerWidth: any): void;
    getItems(): Array<IResizedImage>;
}
export default GridRow;
