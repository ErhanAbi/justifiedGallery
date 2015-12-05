import { IImageDimensions, INormalizedImage, IResizedImage } from "./types";
declare function setTargetSize(item: INormalizedImage, targetHeight: number): IResizedImage;
declare function resize(item: IImageDimensions, newSize: {
    width?: number;
    height?: number;
}): IImageDimensions;
export { setTargetSize, resize };
