var scale = 1;

var canvasHandler = function(canvasID){
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
	var path;
	
	this.drawingTool.onMouseDown = function(event){
		//global.canvasHandler.activePath = new Path();
		path = new Path();
		path.strokeColor = 'black';
		path.add(event.point);
	};
	
	this.drawingTool.onMouseDrag = function(event){
		path.add(event.point);
	};
	
	
	/*
	var path = new Path();
	path.strokeColor = 'black';
	var start = new Point(100,100);
	path.moveTo(start);
	path.lineTo(start.add([200, -50]));
	view.draw();
	*/
	
	console.log("canvasHandler initialized with id " + canvasID);
	
}; // canvasHandler

// Add functions to the canvasHandler prototype here
// Note: Will load and be part of the above object, so can be called upon later
// ie: when the new canvasHandler is made when the website loads

/// Sizing //////////////
canvasHandler.prototype.setCanvasDimensions = function(width, height){

};

/// !! Clear all contents !! //////////////
canvasHandler.prototype.clear = function(width, height){

};
////////////////////////////////////////////
//////// DRAWING EVENTS ////////////////////
////////////////////////////////////////////
canvasHandler.prototype.onDrawMouseDown = function(evt){
	
};

