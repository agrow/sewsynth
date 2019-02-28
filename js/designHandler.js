
var DesignHandler = function(){
	this.designs = [];
	// DRASTIC DESIGN CHANGE:
	// "activeDesign" will now be an index for this.designs, not a seperate design
	this.activeDesign = null;
	this.scale = 2;
	
	//this.lastSelectedLineType = "path";
	this.lastSelectedLineType = "";
	// 121 is the default max distance a stitch can go.
	// However, if we aim to make a stitch approximately every 2.5 mm, that would be every 25 units?
	this.threshold = 121; // 121 is the default max distance a stitch can go.
	
	console.log("DesignHandler initialized");
	
	return this;
}; // DesignHandler

///////////////////////////////////////////////////
// DesignHander Functions
// Should include: 
	// creation & removal of design(s)
	// location of design(s), 
	// moving design(s)/scaling design(s), 
	// drawing design(s) to canvas, or at least holding functions, 
	// printing design(s) to fabric,
	// calling other operations on design(s),

DesignHandler.prototype.makeAndSetNewDesign = function(){
	this.designs.push(new Design());
	this.activeDesign = this.designs.length -1;
}; // makeAndSetNewDesign

DesignHandler.prototype.deleteLastDesign = function(){
	// remove the path
	// this path should be saved before deletion
	var deletedDesign = this.designs.pop();
	console.log("deleting design ", deletedDesign);
	this.activeDesign = this.designs.length -1;
}; // deleteLastDesign

DesignHandler.prototype.reactivateDesign = function(design){
	if(design == NaN){
		this.designs.push(design);
		this.activeDesign = this.designs.length -1;
		this.activeDesign.reactivate();
	} else {
		if(this.designs[i] !== undefined && this.designs[i] !== null){
			this.designs[i].reactivate();
		}
	}
	
};


DesignHandler.prototype.addPaperJSPath = function(path, newDesign){
	if(newDesign !== undefined && newDesign !== null && newDesign == true) {
		this.makeAndSetNewDesign();
	}
	
	if(this.designs[this.activeDesign] === null){
		console.log("Cannot add path to null activeDesign...", this.designs[this.activeDesign], path);
		global.mainErrorHandler.errorMsg("null activeDesign", this);
		return;
	}
	//console.log(this.designs);
	//console.log(this.activeDesign);
	this.designs[this.activeDesign].makeNewPath(path);
	try{
		// If these path parameters ever change, make sure to change them in regenerateAllDerivedPaths
		this.designs[this.activeDesign].regenerateAllDerivitivePaths({	
											//"path": path,
											tolerance: getValueOfSlider("lineSimplifierTolerance"),
											flatness: getValueOfSlider("lineFlatness"),
										    stitchLength: getValueOfSlider("edgeThreshold"),
										    generateSeedPath: "path"
										    // Add any generation settings here
										    });
		console.log("default path size ", path.segments.length);
		
	
		this.updatePathSelection(this.lastSelectedLineType);
		
		console.log("paperJSPath imported to activeDesign complete"); //, path);
	} catch (e) {
		global.mainErrorHandler.error(e);
	}
};

// Decores the index.html names for selection... for now. 
// Used by updatePathSelection
// designPath.js holds the formatting we're aiming for:
 /* params={
 * 	path: {sewn: false/true/"both"}
 *  simplifiedPath: {sewn: false/true/"both"}
 *  flattenedPath: {sewn: false/true/"both"}
 * }
 */
// TODO: Selecting sewnPaths of these options...
// 			There has to be a better way to do this...
DesignHandler.prototype.parsePathSelection = function(selected){
	var params = {};
	
	if(selected === "path-complex"){
		params.path = {sewn: false};
	} else if (selected === "path-simple"){
		params.simplifiedPath = {sewn: false};
	} else if (selected === "path-segmented"){
		params.flattenedPath = {sewn: false};
	} else if (selected === "path-generated-design"){
		params.generatedPath = {sewn: false};
	} else if (selected === "path-sew-segmented"){
		params.flattenedPath = {sewn: true};
	} else if (selected === "path-sew-generated"){
		params.generatedPath = {sewn: true};
	} else {
		// Haha! It's none of them!
		console.log("Called showAndSelectPath on a design with selected", selected);
	}
	console.log("parsed Params in designHandler", params);
	
	return params;
};

DesignHandler.prototype.updatePathSelection = function(selected){
	console.log("updating path to select ", selected);
	this.lastSelectedLineType = selected;
	parsedSelection = this.parsePathSelection(selected);
	console.log("updatePathSeletion ", parsedSelection);
	console.log("this.designs", this.designs);
	
	for(var i = 0; i < this.designs.length; i++){
		// Deselect all
		this.designs[i].hideAndDeselectAllPaths();
		this.designs[i].showAndSelectPath(parsedSelection);
	}
	
	// do it for the active design as well
	// Deselect...
	if(this.designs[this.activeDesign] !== null && this.designs[this.activeDesign] !== undefined){
		
		this.designs[this.activeDesign].hideAndDeselectAllPaths();
		this.designs[this.activeDesign].showAndSelectPath(parsedSelection);
	} else {
		console.log("Cannot update selection for a null/undefined activeDesign...");
	}
};

// "ref" should be either be "activePath" or an id number for those designs in this.designs
// "inputParams" should be a valid path spec: tolerance, flatness, stitchLength, generateSeedPath
DesignHandler.prototype.regenerateSpecificDesignPaths = function(ref, params){
	if(ref === undefined){
		global.mainErrorHandler.errorMsg("cannot regenerateSpecificDesignPaths with null ref", this, e);
		return null;
	}
	if(ref == "activeDesign"){
		if(this.designs[this.activeDesign] === null){
			global.mainErrorHandler.errorMsg("cannot regenerateSpecificDesignPaths with null activeDesign", this, e);
			return null;
		}
		try {
			this.designs[this.activeDesign].regenerateAllDerivitivePaths(params);
		} catch (e){
			global.mainErrorHandler.errorMsg("1 regenerateSpecificDesignPaths failed to generate with ref " + ref, this, e);
			return null;
		}
	} else if (!isNaN(ref)) {
		try {
			this.designs[ref].regenerateAllDerivitivePaths(params);
		} catch (e){
			global.mainErrorHandler.errorMsg("2 regenerateSpecificDesignPaths failed to generate with ref " + ref, this, e);
			return null;
		}
		
	} else {
		global.mainErrorHandler.errorMsg("3 regenerateSpecificDesignPaths failed to generate with ref " + ref, this, e);
		return null;
	}
};

DesignHandler.prototype.regenerateAllDerivedPaths = function(inputParams){
	var params = {};
	if(inputParams === undefined){
		// Grab the slider parts, regenerate and make from existing path
		// If these path parameters ever change, make sure to change them in addPaperJSPath
		params = {
			tolerance: getValueOfSlider("lineSimplifierTolerance"),
			flatness: getValueOfSlider("lineFlatness"),
			stitchLength: getValueOfSlider("edgeThreshold"),
			generateSeedPath: "path"
		};
	} else {
		// NOTE: This should only be called when generateAllDerivedPaths is called on the activeDesign
		// otherwise, it would possibly set the path of other designs, WHICH WOULD BE BAD!!!
		console.log("!! calling regenerateAllPaths with custom params !!");
		params = inputParams;
	}
	console.log("***** regenerateAllDerivedPaths with parameters", params);
	
	try{
		if(this.designs[this.activeDesign] !== null){
		// do it for the active design as well, if it's not null...
			this.regenerateSpecificDesignPaths("activeDesign", params);
		}
		console.log("2 designHandler: activeDesign", this.designs[this.activeDesign]);
		for(var i = 0; i < this.designs.length; i++){
			this.regenerateSpecificDesignPaths(i, params);
			//this.designs[i].prepForPrint(); // honestly should just be done when we're printing...
		}
		
		
	} catch (e) {
		global.mainErrorHandler.error(e);
	}
	// Then update their visability...
	this.updatePathSelection(this.lastSelectedLineType);
};

////////////////////////////////////////////////////////////////
////////////////// DESIGN EVENT MANAGEMENT /////////////////////
////////////////////////////////////////////////////////////////
//
// Most of this management is sending signals to its children designs
// on when and how to regenerate a new path specification or just delete
// them wholesale
//
// Includes:
// Creating a design (must come with a path)
// Editing a design (path(s))
// Deleting a design (paths(s))

// PARAMS EXPECTED:
// obj: a DesignHandler, the parent
// path: the starting path
DesignHandler.prototype.actionDesignCreate = function(params){
	// REMEMER: "this" will be the action, not DesignHandler
	// We send the params
	//console.log(params);
	//console.log(params.obj);
	//console.log(params.path);
	
	var action = new Action(
		// params
		params,
		// do
		function(){
			
			console.log("IN ACTIONDESIGNCREATE DO");
			console.log(this);
			console.log(this.params);
			//console.log(this.params.obj);
			//console.log(this.params.path);
			/*
			this.params.obj.designs.push(new Design());
			this.params.obj.activeDesign = this.params.obj.designs.length -1;
			*/
			try {
				
				this.params.obj.addPaperJSPath(this.params.path, true);
			} catch (e) {
				console.log(e);
				console.log("design doACTION problem!!!", action);
			}
		},
		// undo
		function(){
			
			console.log("IN ACTIONDESIGNCREATE UNDO");
			//console.log(this);
			console.log(this.params);
			/*
			 
			save this deleted design inside the action for redoing
			var deletedDesign = this.params.obj.designs.pop();
			
			*/
			this.params.deletedDesign = this.params.obj.designs[this.params.obj.designs.length-1];
			this.params.deletedDesign.deactivate();
			this.params.obj.deleteLastDesign();
		},
		//redo
		function(){
			console.log("IN ACTIONDESIGNCREATE REDO");
			//console.log(this);
			console.log(this.params);
			
			this.params.obj.reactivateDesign(this.params.deletedDesign);
		}
	);
	
	global.mainHistoryHandler.doAction(action);
};

// Includes movement, adding/subtracting points
DesignHandler.prototype.actionDesignEdit = function(params){
	
};

DesignHandler.prototype.actionDesignDelete = function(params){
	
};


////////////////////////////////////////////////////////////////
//////////// DESIGN OUTPUT/FILE MANAGEMENT /////////////////////
////////////////////////////////////////////////////////////////

// NOTE: Currently colors are not supported, so we send "true" to use auto-color
DesignHandler.prototype.saveAllDesignsToFile = function(){
	this.closeActiveDesign(); // So they are all on this.designs
	var stPattern = new Pattern();
	
	/*
	// JUMP to the first stitch of this.designs if it exists
	if(this.designs.length > 0 && this.designs[0].getFirstPoint() !== null){
		var firstStitch = this.designs[0].getFirstPoint();
		stPattern.addStitchAbs(firstStitch.x*this.scale, firstStitch.y*this.scale, stitchTypes.jump, true);
		//this.fillInStitchGapsAndAddStitchAbs(stPattern, this.scale, firstStitch.x, firstStitch.y, stitchTypes.jump, true, this.threshold);
	} else {
		// There are no points in the first design?! WTF?!
		// gotta add an anchor point,this will be at the upper left?
		stPattern.addStitchAbs(0, 0, stitchTypes.jump, true);
		console.err("FIRST DESIGN HAS NO STITCHES!!!");
	}*/
	
	// For each old design, in order, stitch them out jumping between each
	for(var i = 0; i < this.designs.length; i++){
		var pathPoints = this.designs[i].getPointsForPrinting();
		
		// For each point in this design, stitch to there!
		for(var j = 0; j < pathPoints.length; j++){
			var point = pathPoints[j];
			this.fillInStitchGapsAndAddStitchAbs(stPattern, this.scale, point.x, point.y, stitchTypes.normal, true, this.threshold);//, stitchTypes.normal);
		}
		// If there are more designs after this one...
		if(i < this.designs.length-1) {
			// JUMP from the last stitch of this design to the last stitch of the next
			var firstStitch = this.designs[i+1].getFirstPoint();
			this.fillInStitchGapsAndAddStitchAbs(stPattern, this.scale, firstStitch.x, firstStitch.y, stitchTypes.jump, true, this.threshold);//, stitchTypes.normal);
		}
	}
	
	// Now close down the pattern, adjust for printing, and send to file!
	stPattern.addStitchRel(0, 0, stitchTypes.end, true);
	console.log("pattern stitches!: " + stPattern.stringifyStitches());
	
	// Scale up // NOTE: Simple scaling does not work. Can too easily make a jump too long (>121)
	// This is why, when we place stitches, we use the scale to test how long the scale WILL extend stitches
	stPattern.scale(this.scale);
	
	// Flip them vertically, because the sewing will be read upside-down
	stPattern.invertPatternVertical();
	console.log("pattern post-invert!: " + stPattern.stringifyStitches());
	
	// Turn abs stitches into relative ones, as all DST stitches are relative movements
	stPattern.transformToRelStitches();
	
	// And print!
	var rando = Math.floor(Math.random() * 1000);
	var name = "draw_" + $.datepicker.formatDate('mm-dd-yy', new Date()) + "_" + rando + ".dst";
	dstWrite(name, stPattern); // dstformat.js
	
	console.log("Saved file to " + name);
};

DesignHandler.prototype.fillInStitchGapsAndAddStitchAbs = function(stPattern, scale, x, y, flags, color, threshold, gapFlag){
	var tempX = x;//*scale;
	var tempY = y;//*scale;
	
	//console.log("____ calling fillInStitchGraphAndAddStitchAbs: " + scale + ", " + x + ", " + y + ", " + flags + ", " + color);

	var lastStitch = stPattern.stitches[stPattern.stitches.length-1];
	var newX = 0;
	var newY = 0;
	
	// IF the next diff, at scale, would be too big... SHORTEN IT!
	var xDiff = (x - lastStitch.x)*scale;
	var yDiff = (y - lastStitch.y)*scale;
	var count = 0; // Just in case!
	
	//console.log("__Diffs: " + xDiff + ", " + yDiff);
	
	while((xDiff > threshold || xDiff < -threshold || yDiff > threshold || yDiff < -threshold) && count < 1000){
		
		if(xDiff > threshold){
			newX = threshold;
			xDiff -= threshold;
		} else if (xDiff < -threshold) { 
			newX = -threshold;
			xDiff += threshold;
		}
		
		if(yDiff > threshold){
			newY = threshold;
			yDiff -= threshold;
		} else if (yDiff < -threshold) { 
			newY = -threshold;
			yDiff += threshold;
		}
		
		//console.log("adding intermediate relative stitch +/-: " + newX + ", " + newY);
		stPattern.addStitchRel(newX/scale, newY/scale, stitchTypes.jump, color); 
		
		count++;
	}
	if(count > 0) console.log("last stitch is " + xDiff + ", " + yDiff + " away from the last stitch");

	stPattern.addStitchAbs(tempX, tempY, flags, color);
};

