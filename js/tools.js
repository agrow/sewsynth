

var CustomTool = function(name, type){
	
	this.paperTool = new paper.Tool();
	
	
	//this.path = null;
	// TODO: cavas handler tool settings, if needed
	if(type !== undefined && type == "drawing"){
		this.setupDrawingTool(name);
	}
	// TODO: Design settings -- how many paths?
	
	// TODO: Design Path & Generation Settings for each path
	
	// TODO: Name of graphical file to display as the icon
	
	//this.deactivate();
	return this;
};

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

CustomTool.prototype.activate = function(){
	this.paperTool.activate(); // add to paper js scope
	console.log("activating tool " + this.paperTool.name, this.paperTool)
};

// This SHOULD turn off the tool, I hope
// If not, we have to turn off/remove the events that setup__Tool adds
CustomTool.prototype.deactivate = function(){
	this.paperTool.remove(); // take sit off the paper js scope
	console.log("removing/deactivating tool " + this.paperTool.name, this.paperTool)
};

////////////////////////////////////////////////////
///////// Initializing Tool Library ///////////////
///////////////////////////////////////////////////

var toolLibrary = {
	//////////////////////////////
	//////// DRAWING //////////
	//////////////////////////////
	plainLine: new CustomTool(
		"plainLine","drawing",
		// canvas handler tool just needs a min
		// Design settings needs 1 path
		// No generation settings
	),
	sketchNoise: new CustomTool(
		"sketchNoise", "drawing",
		// canvas handler tool needs min & small max lines
		// Design settings needs 1 path
		// Generation settings need loooow frequency, low iterations, low
	),
	sketchNoiseDouble: new CustomTool(
		"sketchNoiseDouble", "drawing",
		// canvas handler tool needs min & small max lines
		// Design settings needs 2 paths
		// Generation settings need loooow frequency, low iterations, low
	),
	sketchHighNoise: new CustomTool(
		"sketchHighNoise", "drawing",
		// canvas handler tool needs min and small max lines
		// Design settings needs 1 paths
		// Generation settings need high frequency and an angle
	),
	swingNoise: new CustomTool(
		"swingNoise", "drawing",
		// canvas handler tool needs min & small max lines
		// Design settings needs 1 path
		// Generation settings needs 2 sets of generation settings
		// (or a high/low on frequency)
		// and an interval range on when the swap between low and high freq
	),
	////////////////////
	speedyDrawing: new CustomTool(
		"speedyDrawing", "drawing",
		// canvas handler tool needs min & max
		// Design settings needs 2 paths
		// Generation settings need density (if none, draw outlines)
	),
	///////////////////
	echoExact: new CustomTool(
		"echoExact", "drawing",
		// canvas handler tool min
		// Design settings needs 1 path
		// no generation settings
	),
	echoTangent: new CustomTool(
		"echoTangent", "drawing",
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
		"plainSatin", "editing",
		// canvas handler tool is a picker
		// Design settings needs 2 paths
		// Generation settings need density
	),
};


