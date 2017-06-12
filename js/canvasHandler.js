

var CanvasHandler = function(canvasID){
  	// canvas id is "canvas"
	// Initialize local variables here
	/* ///FABRIC.JS STUFF
	this.canvas = new fabric.Canvas(canvasID, {
    	isDrawingMode: true
  	});
	this.setCanvasDimensions(global.calcWidth, global.calcHeight);
	*/
	
	// TESTING PAPERJS
	paper.install(window);
	
	this.canvas = document.getElementById(canvasID);
	paper.setup(this.canvas);
	
	//TESTING
	this.drawingTool = new Tool();
	this.drawingTool.minDistance = 3;
	//this.activePath = null;
	var path = null;
	
	this.drawingTool.onMouseDown = function(event){
		//global.CanvasHandler.activePath = new Path();
		path = new Path();
		path.strokeColor = 'black';
		path.add(event.point);
		path.selected = true;
		path.opacity = 0.5;
	};
	
	this.drawingTool.onMouseDrag = function(event){
		path.add(event.point);
	};
	
	this.drawingTool.onMouseUp = function(event){
		//console.log("mouseup", path);
		path.selected = false;
		global.mainDesignHandler.makeAndSetNewDesign();
		global.mainDesignHandler.addPaperJSPath(path);
		
		
		//console.log("deselected", path);
	};
	
	/*
	var path = new Path();
	path.strokeColor = 'black';
	var start = new Point(100,100);
	path.moveTo(start);
	path.lineTo(start.add([200, -50]));
	view.draw();
	*/
	
	this.uploadImageRaster = null; // This is for re-loading stuff if threshold changes...
	this.savedOriginalImage = null; // This is for reloading stuff! So we work off the original data...
	
	console.log("CanvasHandler initialized with id " + canvasID);
	
	return this;
}; // CanvasHandler

// Add functions to the CanvasHandler prototype here
// Note: Will load and be part of the above object, so can be called upon later
// ie: when the new CanvasHandler is made when the website loads

/// Sizing //////////////
CanvasHandler.prototype.setCanvasDimensions = function(width, height){

};

/// !! Clear all contents !! //////////////
CanvasHandler.prototype.clear = function(width, height){

};
////////////////////////////////////////////
//////// DRAWING EVENTS ////////////////////
////////////////////////////////////////////
CanvasHandler.prototype.onDrawMouseDown = function(evt){
	
};

CanvasHandler.prototype.loadUserImage = function(fileObject){
	var img = new Image();
	var url = window.URL || window.webkitURL;
	var src = url.createObjectURL(fileObject);
	var handler = this;
	
	this.uploadImageRaster = new Raster(src);
	this.uploadImageRaster.onLoad = function(){
		handler.uploadImageRaster.position = view.center;
		handler.savedOriginalImage = handler.uploadImageRaster.getImageData();
		handler.reloadImage("canny", getValueOfSlider("edgeThreshold"));
		//var filtered = Filters.sobel(handler.uploadImageRaster.getImageData());
		
		/* = Filters.filterImage(Filters.convolute, handler.uploadImageRaster.getImageData(),
			  [  0, -1,  0,
			    -1,  5, -1,
			     0, -1,  0 ]
			);*/
		//console.log(filtered);
		//handler.uploadImageRaster.setImageData(filtered);
	};
};

// NOTE: To compound filters, we need a different function
// This explicitly uses a cached version of the image so we RE-apply filters to the original...
CanvasHandler.prototype.reloadImage = function(filter, threshold){
	if(this.uploadImageRaster === null){
		console.log("Cannot reupload an image that has not been uploaded... ");
		return;
	}
	
	var filtered;
	
	// NOTE: THIS USES THE CACHED ORIGINAL IMAGE!!
	if(filter === "sobel") {
		filtered = Filters.sobel(this.savedOriginalImage, threshold);
	} else if (filter === "canny"){
		// grayscale
		filtered = Filters.grayscale(this.savedOriginalImage);
		// smooth?
		filtered = Filters.blur3x3(filtered);
		// sobel, prewitts, cross, ??
		filtered = Filters.sobel(filtered, threshold);
		// thin?
		// remove weak/false edges?
	}
	
	console.log(filtered);
	this.uploadImageRaster.setImageData(filtered);
};

CanvasHandler.prototype.reloadImageFromGUI = function(){
	var filter = "canny"; // to get from selector...
	var threshold = getValueOfSlider("edgeThreshold");
	
	this.reloadImage(filter, threshold);
};

////////////////////////////////////////////////////////////////////////
///////////// Image filters for the canvas processing... ////////////
////////////////////////////////////////////////////////////////////////
Filters = {};
Filters.filterImage = function(filter, imageData, var_args) {
  var args = [imageData];
  for (var i=2; i<arguments.length; i++) {
    args.push(arguments[i]);
  }
  return filter.apply(null, args);
};

Filters.grayscale = function(pixels, args) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    // CIE luminance for the RGB
    var v = 0.2126*r + 0.7152*g + 0.0722*b;
    d[i] = d[i+1] = d[i+2] = v;
  }
  return pixels;
};

Filters.brightness = function(pixels, adjustment) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    d[i] += adjustment;
    d[i+1] += adjustment;
    d[i+2] += adjustment;
  }
  return pixels;
};

Filters.threshold = function(pixels, threshold) {
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
    d[i] = d[i+1] = d[i+2] = v;
  }
  return pixels;
};

Filters.tmpCanvas = document.createElement('canvas');
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

Filters.createImageData = function(w,h) {
  return this.tmpCtx.createImageData(w,h);
};

Filters.convolute = function(pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side/2);

  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;
  //console.log("pixels", pixels);

  var w = sw;
  var h = sh;
  //console.log("w, h", w, h);
  var output = Filters.createImageData(w, h);
  var dst = output.data;

  var alphaFac = opaque ? 1 : 0;

  for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y*w+x)*4;
      var r=0, g=0, b=0, a=0;
      for (var cy=0; cy<side; cy++) {
        for (var cx=0; cx<side; cx++) {
          var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
          var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
          var srcOff = (scy*sw+scx)*4;
          var wt = weights[cy*side+cx];
          r += src[srcOff] * wt;
          g += src[srcOff+1] * wt;
          b += src[srcOff+2] * wt;
          a += src[srcOff+3] * wt;
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  return output;
};

// "Type" should be dilate or shrink
Filters.morphologicalGradient = function(pixels, weights, type){
	var side = Math.round(Math.sqrt(weights.length));
	var halfSide = Math.floor(side/2);

	var src = pixels.data;
	var sw = pixels.width;
	var sh = pixels.height;
  //console.log("pixels", pixels);

	var w = sw;
 	var h = sh;
  //console.log("w, h", w, h);
	var output = Filters.createImageData(w, h);
	var dst = output.data;
	
	for (var y=0; y<h; y++) {
	    for (var x=0; x<w; x++) {
	      var sy = y;
	      var sx = x;
	      var dstOff = (y*w+x)*4;
	      var r=0, g=0, b=0, a=0;
	      for (var cy=0; cy<side; cy++) {
	        for (var cx=0; cx<side; cx++) {
	          var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
	          var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
	          var srcOff = (scy*sw+scx)*4;
	          var wt = weights[cy*side+cx];
	          r += src[srcOff] * wt;
	          g += src[srcOff+1] * wt;
	          b += src[srcOff+2] * wt;
	          a += src[srcOff+3] * wt;
	        }
	      }
	      dst[dstOff] = r;
	      dst[dstOff+1] = g;
	      dst[dstOff+2] = b;
	      dst[dstOff+3] = 255;
	    }
  	}
  	return output;
};

if (!window.Float32Array)
  Float32Array = Array;

Filters.convoluteFloat32 = function(pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side/2);

  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;

  var w = sw;
  var h = sh;
  var output = {
    width: w, height: h, data: new Float32Array(w*h*4)
  };
  var dst = output.data;

  var alphaFac = opaque ? 1 : 0;

  for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y*w+x)*4;
      var r=0, g=0, b=0, a=0;
      for (var cy=0; cy<side; cy++) {
        for (var cx=0; cx<side; cx++) {
          var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
          var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
          var srcOff = (scy*sw+scx)*4;
          var wt = weights[cy*side+cx];
          r += src[srcOff] * wt;
          g += src[srcOff+1] * wt;
          b += src[srcOff+2] * wt;
          a += src[srcOff+3] * wt;
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  return output;
};

//
Filters.sobel = function(px, threshold) {
    px = Filters.grayscale(px);
    var vertical = Filters.convoluteFloat32(px,
      [-1,-2,-1,
        0, 0, 0,
        1, 2, 1]);
    var horizontal = Filters.convoluteFloat32(px,
      [-1,0,1,
       -2,0,2,
       -1,0,1]);
    var id = Filters.createImageData(vertical.width, vertical.height);
    for (var i=0; i<id.data.length; i+=4) {
      var v = Math.abs(vertical.data[i]);
      var h = Math.abs(horizontal.data[i]);
      // If we are using a threshold, pixels above it are black. Others are white
      if(threshold !== undefined){
      		if((v+h)/2 > threshold){
      			id.data[i] = 0; //  r
			    id.data[i+1] = 0; //  g
			    id.data[i+2] = 0; //  b
			    id.data[i+3] = 255; //  a
      		} else {
	      		id.data[i] = 255; //  r
			    id.data[i+1] = 255; //  g
			    id.data[i+2] = 255; //  b
			    id.data[i+3] = 255; //  a
      		}
      //console.log("v, h", v, h);
      
      } else {
      	  id.data[i] = (v+h)/2; //v; //  r
	      id.data[i+1] = (v+h)/2; //h; //  g
	      id.data[i+2] = (v+h)/2; //(v+h)/4; //  b
	      id.data[i+3] = 255; //  a
      }
    }
    return id;
};

Filters.blur3x3 = function(px){
	return Filters.convoluteFloat32(px,
		[1/9,1/9,1/9,
		 1/9,1/9,1/9,
		 1/9,1/9,1/9]);
};
