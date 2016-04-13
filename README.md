# JustifiedGallery

JustifiedGallery is the algorithm part needed to compute a grid of images a la flickr [explore page](https://www.flickr.com/explore).

## Demo
You can check a plain vanilla javascript demo [here](http://j.mp/justifiedGrid)

## Instalation

In your project

`npm install justifiedgallery --save`

Since it's an npm module, use it with [webpack](https://webpack.github.io/) or [browserify](http://browserify.org/)

## Usage

```javascript
import PhotoGrid from 'justifiedgallery';

let images = [imgMeta1, imgMeta2];
let grid = new PhotoGrid({
  // mandatory, in px
  minHeight: 150,
  maxHeight: 350,
  
  // optional, in px
  borderWidth: 2,
  
  // mandatory, this function must return an object
  // having width and height properties
  getImageMeta: (image) => {
    image.width = image.originalDimensions.width;
    image.height = image.originalDimensions.height;
    return image;
  },
  
  // optional, determine which available version of the original image fits best
  filesGetter: (image) => {
    // resized images should either be an array of objects having width and height properties
    // or a hashmap: {[k: string] : {width: number, height: number}}
    // e.g. [{width: 220, height: 100}, {width: 640, height: 480}]
    // or {lowQ: {width: 220, height: 100}, medQ: {width: 640, height: 480}}
    let resizedImages = image.resizedImages;
    return resizedImages;
  }
 }, images);
 
 // get grid container width
 let containerWidth = document.getElementById("myGridContainer").clientHeight;
 
 // compute rows for the given container width
 // rows will be a list of GridRow instances
 let rows = grid.getRows(containerWidth);
 
 let row0 = rows[0];
 let imagesToShowOnFirstRow = row0.getItems();
 ```
 
 So the component should be used with any view framework -> e.g. jQuery, jsx, vanilla js and so on.
 
