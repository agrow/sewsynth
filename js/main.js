var global = {
	mainCanvasHandler: null,
	calcHeight: 0,
	calcWidth: 0
};

var saveCalculatedDimensions = function(){
	global.calcHeight = $("#mainDiv").height();
	global.calcWidth = $("#mainDiv").width();
	console.log("calculating height & width... " + global.calcHeight + ", " + global.calcWidth);
};

// Handled by flex, but we may need to override that if it doesn't work with our drawing functions...
var resizeCanvasEvent = function(){
	//console.log($(document).width());
	//$("#svg_canvas").width($(document).width() - 160);
	//$("#svg_canvas").height($(document).height() - 140);
};

var setGUIFunctions = function(){
	// Put button/UI functions here, to be loaded when document is ready!
};

var initCanvas = function(){
	saveCalculatedDimensions(); // Needed to initialize new canvas at an actual decent size...
	global.mainCanvasHandler = new canvasHandler("canvas");
};
///////////////////////////////////////////////////////
/////////////// EVENT-BASED FUNCTIONS ////////////////
///////////////////////////////////////////////////////
window.addEventListener("resize", function(){
	saveCalculatedDimensions();
	if(global.mainCanvasHandler !== null){
		global.mainCanvasHandler.setCanvasDimensions(global.calcWidth, global.calcHeight);
	}
});

$( document ).ready(function() {
	// Import the rest of the functions
	initCanvas();
	console.log( "ready!" );
});
