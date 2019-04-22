

var CustomTool = function(name, type, drawingSettings, generationSettings){
	
	this.name = name;
	this.type = type;
	
	// The settings in this object should directly correspond to paperjs.Path
	// ie, path.strokeColor = drawomgSettomgs.strokeColor
	this.drawingSettings = drawingSettings;
	
	
	//this.path = null;
	// TODO: cavas handler tool settings, if needed
	if(type !== undefined && type == "drawing"){
		//this.setupDrawingTool(name);
	}
	// TODO: Design settings -- how many paths?
	
	// TODO: Design Path & Generation Settings for each path
	this.generationSettings = generationSettings;
	
	// TODO: Name of graphical file to display as the icon
	
	//this.deactivate();
	return this;
};

CustomTool.prototype.setCanvasToolProperties = function(event, canvasPath){
	// defaults
	
	// TODO: Figure out how to set these from the tools.js
	//canvasTool.minDistance = 4;
	//canvasTool.maxDistance = 10;
	
	canvasPath.opacity = 0.5;
	
	// custom
	if(this.drawingSettings !== null && this.drawingSettings !== undefined){
		for (var key in this.drawingSettings) {
		    // skip loop if the property is from prototype
			if (!this.drawingSettings.hasOwnProperty(key)) continue;
			
			// Hopefully this works!!!
			if(canvasPath[key] !== undefined){
				canvasPath[key] = this.drawingSettings[key];
				console.log("setting canvasTool key with value ", key, this.drawingSettings[key]);
			} else {
				console.log("OOOPS NO CANVAS TOOL WITH KEY ", key);
			}
		}
	}
	
	return canvasPath;
};

/*
// TODO: min/max/settings
CustomTool.prototype.setupDrawingTool =  function(name){
	this.paperTool.parent = this;
	this.paperTool.name = name;
	this.paperTool.minDistance = 4;
	this.paperTool.maxDistance = 10;

	
	this.paperTool.onMouseDown = function(event){
		//global.CanvasHandler.activePath = new Path();
		console.log(this);
		console.log("mouseDown on tool " + this.name);
		this.parent.path = new Path();
		this.parent.path.strokeColor = 'black';
		this.parent.path.add(event.point);
		this.parent.path.selected = true;
		this.parent.path.opacity = 0.5;
	};
	
	this.paperTool.onMouseDrag = function(event){
		console.log(this);
		console.log("mouseDrag on tool " + this.name);
		this.parent.path.add(event.point);
	};
	
	this.paperTool.onMouseUp = function(event){
		console.log(this);
		console.log("mouseUp on tool " + this.name);
		//console.log("mouseup", path);
		this.parent.path.selected = false;
		try{
			//global.mainDesignHandler.addPaperJSPath(path, true);
			global.mainDesignHandler.actionDesignCreate({
				"obj" : global.mainDesignHandler,
				"path" : this.parent.path
				// design must be true for actionDesignCreate
			});
		} catch (e){
			global.mainErrorHandler.error(e);
		}
		
		//console.log("deselected", path);
	};
};

CustomTool.prototype.setupEditingTool =  function(){
	// on mouse events should be based on picking existing paths
};
*/
////////////////////////////////////////////////////////
// The GUI handler deactivates the current tool and activates the right one
// based on the buttons that the user presses
CustomTool.prototype.activate = function(){
	//this.paperTool.activate(); // add to paper js scope
	
	global.selectedTool = this.name;
	console.log("activating tool " + this.name);
};

// This SHOULD turn off the tool, I hope
// If not, we have to turn off/remove the events that setup__Tool adds
CustomTool.prototype.deactivate = function(){
	//this.paperTool.remove(); // take sit off the paper js scope
	//this.paperTool.deactivate(); // NOT A FUNCTION
	console.log("removing/deactivating tool " + this.name);
};

////////////////////////////////////////////////////
///////// Initializing Tool Library ///////////////
///////////////////////////////////////////////////

// NOTE: THESE CONNECT DIRECTLY TO designGenerator.js
// if you edit their names here, you must adjust the switch statement
// in parseToolParams

var toolLibrary = {
	//////////////////////////////
	//////// DRAWING //////////
	//////////////////////////////
	plainLine: new CustomTool(
		"plainLine","drawing",
		// Drawing settings for the line. These override the defaults
		{
			strokeColor:'black'
		}
		// canvas handler tool just needs a min
		// Design settings needs 1 path
		// No generation settings
	),
	sketchNoise: new CustomTool(
		"sketchNoise", "drawing",
		// Drawing settings for the line. These override the defaults
		{
			strokeColor:'red'
		},
		// "generationSettings"
		{
			num_iterations: 1, 
			persistence: .5,
			freq: .007, 
			// normal noise is 0-1, remember this is pixels
			// 10 gives us at least a solid number. with a distance away from the original point 
			low: -20, 
			high: 20
		}
		// canvas handler tool needs min & small max lines
		// Design settings needs 1 path
		// Generation settings need loooow frequency, low iterations, low
	),
	sketchHighNoise: new CustomTool(
		"sketchHighNoise", "drawing",
		// Drawing settings for the line. These override the defaults
		{
			strokeColor:'green'
		},
		// "generationSettings"
		{
			num_iterations: 7, 
			persistence: .5,
			freq: .5, 
			// normal noise is 0-1, remember this is pixels
			// 10 gives us at least a solid number. with a distance away from the original point 
			low: -30, 
			high: 30
		}
		// canvas handler tool needs min and small max lines
		// Design settings needs 1 paths
		// Generation settings need high frequency and an angle
	),
	graffitiNoise: new CustomTool(
		"graffitiNoise", "drawing",
		// Drawing settings for the line. These override the defaults
		{
			strokeColor:'blue'
		},
		// "generationSettings"
		{
			num_iterations: 1, 
			persistence: .5,
			freq: .05, 
			// normal noise is 0-1, remember this is pixels
			// 10 gives us at least a solid number. with a distance away from the original point 
			low: -40, 
			high: 40
		}
		// canvas handler tool needs min and small max lines
		// Design settings needs 1 paths
		// Generation settings need high frequency and an angle
	),
	swingNoise: new CustomTool(
		"swingNoise", "drawing",
		// Drawing settings for the line. These override the defaults
		{
			strokeColor:'orange'
		},
		// "generationSettings"
		{
			// keeping these the same for ease's sake
			num_iterations: 7, 
			persistence: .5,
			freq: .5, 
			// normal noise is 0-1, remember this is pixels
			// 10 gives us at least a solid number. with a distance away from the original point 
			low: -30, 
			high: 30,
			// Noise setting 2
			freq2: .05, 
			// normal noise is 0-1, remember this is pixels
			// 10 gives us at least a solid number. with a distance away from the original point 
			low2: -10, 
			high2: 10,
			// how many points between swapping between noise setting 1 and 2
			swapRate:10
		}
		// canvas handler tool needs min & small max lines
		// Design settings needs 1 path
		// Generation settings needs 2 sets of generation settings
		// (or a high/low on frequency)
		// and an interval range on when the swap between low and high freq
	),
	////////////////////
	speedyDrawing: new CustomTool(
		"speedyDrawing", "drawing",
		// Drawing settings for the line. These override the defaults
		{
			strokeColor:'yellow'
		}
		// canvas handler tool needs min & max
		// Design settings needs 2 paths
		// Generation settings need density (if none, draw outlines)
	),
	speedyEvenDrawing: new CustomTool(
		"speedyEvenDrawing", "drawing",
		// Drawing settings for the line. These override the defaults
		{
			strokeColor:'blue'
		}
		// canvas handler tool needs min & max to be the same
		// Design settings needs 2 paths
		// Generation settings need density (if none, draw outlines)
	),
	///////////////////
	echoExact: new CustomTool(
		"echoExact", "drawing",
		// Drawing settings for the line. These override the defaults
		{
			strokeColor:'lime'
		},
		// "generationSettings"
		{
			angle: 45,
			high: 20
		}
		// canvas handler tool min
		// Design settings needs 1 path
		// no generation settings
	),
	echoTangent: new CustomTool(
		"echoTangent", "drawing",
		// Drawing settings for the line. These override the defaults
		{
			strokeColor:'cyan'
		},
		// "generationSettings"
		{
			angle: 90,
			high: 40
		}
		// canvas handler tool needs min
		// Design settings needs 1 path
		// no generation settings
	),
	//////////////////////////////
	//////// EDITING //////////
	//////////////////////////////
	/////////////////
	// NOTE: We should be able to echo a generated line
	// with either of these above methods, and then EDIT it with 
	// new generation settings
	//////////////
	/////////////////////
	plainSatin: new CustomTool(
		"plainSatin", "editing"
		// canvas handler tool is a picker
		// Design settings needs 2 paths
		// Generation settings need density
	),
}; global.toolLibrary = toolLibrary;


