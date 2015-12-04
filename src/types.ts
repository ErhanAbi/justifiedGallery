
declare module 'types' {
  interface ReadImageMeta<T> {
    (image: T): INormalizedImage
  }

  interface ReadImageFiles<T> {
    (image: T): {[k: string]: IImageDimensions} | Array<IImageDimensions>
  }

  interface IImageDimensions {
    width: number
    height: number
  }

  interface IComputedImge extends IImageDimensions {
    bestFile?: IImageDimensions
  }

  interface INormalizedImage extends IImageDimensions {
    targetSize?: IImageDimensions
    files?: Array<IImageDimensions>
  }

  interface IResizedImage extends INormalizedImage {
    resized?: IComputedImge
  }

  interface ISettings<T> {
    targetHeight?: number
    containerWidth: number
    minHeight: number
    maxHeight: number
    borderWidth: number
    getImageMeta: ReadImageMeta<T>
    filesGetter?: ReadImageFiles<T>
  }
}
