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
	
	// NOTE: this may break on multiple instances of an svg canvas...
	this.canvas = d3.selectAll("svg");
	
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
	var svgElement = d3.selectAll("svg");
};
////////////////////////////////////////////
//////// DRAWING EVENTS ////////////////////
////////////////////////////////////////////
canvasHandler.prototype.onDrawMouseDown = function(evt){
	
};

