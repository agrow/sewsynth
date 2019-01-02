var global = {
	mainErrorHandler: null,
	mainHistoryHandler: null,
	mainCanvasHandler: null,
	mainDesignHandler: null,
	mainDesignGenerator: null,
	calcHeight: 0,
	calcWidth: 0,
	designCount: 0,
	pointCount: 0,
	// GUIelements, not necessary to put them here, but helpful to know what's up
	design_options: {visible: false},
	view_options: {visible: false},
	image_options: {visible: false},
	
	keyMap: {},
	keyEventFired: {}
};

if (!window.FileReader) {
    message = '<p>The ' +
              '<a href="http://dev.w3.org/2006/webapi/FileAPI/" target="_blank">File API</a>s ' +
              'are not fully supported by this browser.</p>' +
              '<p>Upgrade your browser to the latest version.</p>';

    document.querySelector('body').innerHTML = message;
} else {
	document.getElementById('uploadImg').addEventListener('change', handleFileSelection, false);

}

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

var initDesignGenerator = function(){
	global.mainDesignGenerator = new DesignGenerator();
};

var initErrorHandler = function(){
	global.mainErrorHandler = new ErrorHandler();
};

var initHistoryHandler = function(){
	global.mainHistoryHandler = new HistoryHandler();
};

///////////////////////////////////////////////////////
/////////////// EVENT-BASED FUNCTIONS ////////////////
///////////////////////////////////////////////////////

// USED KEYS:
// 17, 90, 16, 88 (UNDO/REDO)
var initKeys = function() {
	global.keyMap[17] = false;
	global.keyMap[90] = false;
	global.keyMap[16] = false;
	global.keyMap[88] = false;
	
	global.keyEventFired.undo = false;
	global.keyEventFired.redo = false;
};

var updateKeyEvent = function(e){
    e = e || event; // to deal with IE
    global.keyMap[e.keyCode] = e.type == 'keydown';
    /* now ready to check conditionals */
};

window.onkeyup = function(e) {
	updateKeyEvent(e);
	//console.log(global.keyMap);
	// UNDO
	// code 17 = ctrl
	// code 90 = z
	if(global.keyMap[17] == false || global.keyMap[90] == false){
		global.keyEventFired.undo = false;
		//console.log("Setting undo fire to false");
	}
	// REDO
	// code 17 = ctrl
	// code 16 = shift
	// code 88 = x
	if(global.keyMap[17] == false || global.keyMap[16] == false ||
		global.keyMap[88] == false){
		global.keyEventFired.redo = false;
		//console.log("Setting redo fire to false");
	}
};

window.onkeydown = function(e) {
	var oldKeyMap = global.keyMap;
	updateKeyEvent(e);
		
	//console.log("OLD", oldKeyMap);
	//console.log("NEW", global.keyMap);
	
	if(global.mainHistoryHandler !== null){
		// the error handler is ready to hear its input
		// UNDO
		// code 17 = ctrl
		// code 90 = z
		if(global.keyMap[17] == true && global.keyMap[90] == true &&
			global.keyEventFired.undo == false){
				// trigger undo
				global.mainHistoryHandler.doUndo();
				console.log("UNDOOOOOO");
				global.keyEventFired.undo = true;
			}
			
		// REDO
		// code 17 = ctrl
		// code 16 = shift
		// code 88 = x
		if(global.keyMap[17] == true && global.keyMap[16] == true &&
			global.keyMap[88] == true && global.keyEventFired.redo == false){
				// trigger undo
				global.mainHistoryHandler.doRedo();
				console.log("REdooo");
				global.keyEventFired.redo = true;
		}
	}
};

// Handled by flex, but we may need to override that if it doesn't work with our drawing functions...

window.addEventListener("resize", function(){
	saveCalculatedDimensions();
	
	// resize canvas to CANVAS SIZE! aka main Div size!
	paper.view.viewSize.width = global.calcWidth;
	paper.view.viewSize.height = global.calcHeight;
	
	// move menus
	updateMenuPositions();
});


function handleFileSelection(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files;

    if (!files) {
      alert("<p>At least one selected file is invalid - do not select any folders.</p><p>Please reselect and try again.</p>");
      return;
    }

    for (var i = 0, file; file = files[i]; i++) {
      if (!file) {
            alert("Unable to access " + file.name); 
            continue;
      }
      if (file.size == 0) {
            alert("Skipping " + file.name.toUpperCase() + " because it is empty.");
            continue;
      }
      global.mainCanvasHandler.loadUserImage(file);
    }
}



function displayFileImg(filename, evt) {
    var view = new jDataView(evt.target.result, 0, evt.size);
 
}


$( document ).ready(function() {
	
	try {
		// Import the rest of the functions
		initErrorHandler();
		initHistoryHandler();
		initCanvas(); // also initializes canvasHandler
		initDesignGenerator();
		initDesignHandler();
		
		initilizeMenus(); // in guiHandler.js 
		// ^ !! NOTE !! Must be called after DesignHandler as it uses a function in the global.mainDesignHandler
		
		// Move the menus over... need to also update this on resize...
		updateMenuPositions();
		
		initKeys();
		
		console.log( "ready!" );
	} catch (e){
		alert("catastrophic failure -- initialization failed");
	}
	
});
