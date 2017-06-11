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
	image_options: {visible: false},
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
	// Import the rest of the functions
	initCanvas(); // also initializes canvasHandler
	initDesignHandler();
	initilizeMenus(); // in guiHandler.js 
	// ^ !! NOTE !! Must be called after DesignHandler as it uses a function in the global.mainDesignHandler
	
	// Move the menus over... need to also update this on resize...
	updateMenuPositions();
	
	console.log( "ready!" );
});
