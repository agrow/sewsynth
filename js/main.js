var global = {
	mainCanvasHandler: null,
	mainDesignHandler: null,
	calcHeight: 0,
	calcWidth: 0,
	scale: 1, // May be modified to change zoom/scale of drawing designs
	designCount: 0,
	pointCount: 0,
	// GUIelements, not necessary to put them here, but helpful to know what's up
	design_options: {visible: false},
	view_options: {visible: false},
};

var saveCalculatedDimensions = function(){
	global.calcHeight = $("#mainDiv").height();
	global.calcWidth = $("#mainDiv").width();
	console.log("calculating height & width... " + global.calcHeight + ", " + global.calcWidth);
};

var initCanvas = function(){
	saveCalculatedDimensions(); // Needed to initialize new canvas at an actual decent size...
	global.mainCanvasHandler = new CanvasHandler("canvas");
};

var initDesignHandler = function(){
	global.mainDesignHandler = new DesignHandler();
};


///////////////////////////////////////////////////////
/////////////// EVENT-BASED FUNCTIONS ////////////////
///////////////////////////////////////////////////////

// Handled by flex, but we may need to override that if it doesn't work with our drawing functions...

window.addEventListener("resize", function(){
	saveCalculatedDimensions();
	
	// resize canvas to CANVAS SIZE! aka main Div size!
	paper.view.viewSize.width = global.calcWidth;
	paper.view.viewSize.height = global.calcHeight;
	
	// move menus
	updateMenuPositions();
});

$( document ).ready(function() {
	// Import the rest of the functions
	initCanvas(); // also initializes canvasHandler
	initDesignHandler();
	initilizeMenus(); // in guiHandler.js 
	// ^ !! NOTE !! Must be called after DesignHandler as it uses a function in the global.mainDesignHandler
	
	// Move the menus over... need to also update this on resize...
	updateMenuPositions();
	
	console.log( "ready!" );
});
