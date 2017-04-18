var global = {
	mainCanvasHandler: null,
	mainDesignHandler: null,
	calcHeight: 0,
	calcWidth: 0,
	scale: 1, // May be modified to change zoom/scale of drawing designs
	designCount: 0,
	pointCount: 0,
};

var saveCalculatedDimensions = function(){
	global.calcHeight = $("#mainDiv").height();
	global.calcWidth = $("#mainDiv").width();
	console.log("calculating height & width... " + global.calcHeight + ", " + global.calcWidth);
};

var initCanvas = function(){
	saveCalculatedDimensions(); // Needed to initialize new canvas at an actual decent size...
	global.mainCanvasHandler = new CanvasHandler("canvas");
	global.mainDesignHandler = new DesignHandler();
};
///////////////////////////////////////////////////////
/////////////// EVENT-BASED FUNCTIONS ////////////////
///////////////////////////////////////////////////////

// Handled by flex, but we may need to override that if it doesn't work with our drawing functions...

window.addEventListener("resize", function(){
	saveCalculatedDimensions();
	
	//if(global.mainCanvasHandler !== null){
	//	global.mainCanvasHandler.setCanvasDimensions(global.calcWidth, global.calcHeight);
	//}
});

$( document ).ready(function() {
	// Import the rest of the functions
	initCanvas();
	console.log( "ready!" );
});
