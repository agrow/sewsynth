

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

