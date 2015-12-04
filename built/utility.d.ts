import { IImageDimensions, INormalizedImage } from "types";
declare function setTargetSize(item: INormalizedImage, targetHeight: number): INormalizedImage;
declare function resize(item: IImageDimensions, newSize: {
    width?: number;
    height?: number;
}): INormalizedImage;
export { setTargetSize, resize };
