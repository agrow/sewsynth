

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
		var filtered = Filters.sobel(handler.uploadImageRaster.getImageData());
		
		/* = Filters.filterImage(Filters.convolute, handler.uploadImageRaster.getImageData(),
			  [  0, -1,  0,
			    -1,  5, -1,
			     0, -1,  0 ]
			);*/
		console.log(filtered);
		handler.uploadImageRaster.setImageData(filtered);
	};
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
Filters.sobel = function(px) {
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
      id.data[i] = v;
      var h = Math.abs(horizontal.data[i]);
      id.data[i+1] = h;
      id.data[i+2] = (v+h)/4;
      id.data[i+3] = 255;
    }
    return id;
};
