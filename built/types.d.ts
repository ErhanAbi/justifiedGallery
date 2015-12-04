export interface ReadImageMeta<T> {
    (image: T): INormalizedImage;
}
export interface ReadImageFiles<T> {
    (image: T): {
        [k: string]: IImageDimensions;
    } | Array<IImageDimensions>;
}
export interface IImageDimensions {
    width: number;
    height: number;
}
export interface IComputedImge extends IImageDimensions {
    bestFile?: IImageDimensions;
}
export interface INormalizedImage extends IImageDimensions {
    targetSize?: IImageDimensions;
    files?: Array<IImageDimensions>;
}
export interface IResizedImage extends INormalizedImage {
    resized?: IComputedImge;
}
export interface ISettings<T> {
    targetHeight?: number;
    containerWidth: number;
    minHeight: number;
    maxHeight: number;
    borderWidth: number;
    getImageMeta: ReadImageMeta<T>;
    filesGetter?: ReadImageFiles<T>;
}
