
var DesignHandler = function(){
	this.designs = [];
	this.activeDesign = null;
	this.scale = 2;
	
	this.lastSelectedLineType = "path-segmented";
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

// Call on mouseDown? Or after the path has been completed if doing batch method
// Safely cleans up the old designs and starts a new one. Meant to be called by outside functions...
// Post: this.activeDesign == empty new design
DesignHandler.prototype.makeAndSetNewDesign = function(){
	this.closeActiveDesign(); // Does nothing if active design is already null
	this.activeDesign = new Design();
}; // makeAndSetNewDesign

// called on mouseDown & mouseDrag? Or just on loop when parsing paper.js path
DesignHandler.prototype.addPointToActiveDesign = function(xPos, yPos){
	if(this.activeDesign === null){
		console.err("Cannot add point to active design because it is null", this.activeDesign);
		return;
	}
	
	var newPoint = this.activeDesign.addNewPoint(xPos, yPos);
	
}; // addPointToActiveDesign

// called on mouseUp to trigger next mouseDown to make new design
// Pre: 
// Post: this.activeDesign == null
DesignHandler.prototype.closeActiveDesign = function(xPos, yPos){
	// If we are closing it AT a point, add that point as a closure
	// Note that addPoint will fail if the active design is null
	if(xPos !== undefined && xPos !== null && yPos !== undefined && yPos !== null){
		this.addPointToActiveDesign(xPos, yPos);
	}
	
	// If the activeDesign is not null, save it and set it to null
	if(this.activeDesign !== null){
		this.designs.push(this.activeDesign);
		this.activeDesign = null;
	}
	
}; // closeActiveDesign

DesignHandler.prototype.addPaperJSPath = function(path){
	if(this.activeDesign === null){
		console.err("Cannot add path to null activeDesign...", this.activeDesign, path);
		return;
	}
	this.activeDesign.makeNewPath(path);
	this.activeDesign.regenerateAllDerivitivePaths({	
										//"path": path,
										tolerance: getValueOfSlider("lineSimplifierTolerance"),
										flatness: getValueOfSlider("lineFlatness"),
									    stitchLength: getValueOfSlider("edgeThreshold"),
									    generateSeedPath: "flattenedPath"
									    // Add any generation settings here
									    });
	console.log("default path size ", path.segments.length);
	
	// Now simplify the simplified path
	//this.activeDesign.simplifiedPath.simplify(getValueOfSlider("lineSimplifierTolerance"));

	//console.log("simplified segment count ", this.activeDesign.simplifiedPath.segments.length);
	
	// Then translate it to our design line
	//this.activeDesign.pathPoints = parsePaperPathToPoints(this.activeDesign.simplifiedPath);
	
	//this.activeDesign.flattenedPath = this.activeDesign.simplifiedPath.clone();
	//this.activeDesign.flattenedPath.flatten(1);
	// Then apply some design xform
	
	//this.activeDesign.parsePathToPoints(this.activeDesign.flattenedPath);
	//console.log("pathPoints from flattened path ", this.activeDesign.pathPoints.length);
	
	// Prep to print
	//this.activeDesign.roundPathPoints(); // Makes printing and sewing clearer/easier. BW was always in integers
	//this.activeDesign.calcDimensionsBasedOnPathPoints();
	// SHOULD BE DONE OUT OF HERE
	//this.saveAllDesignsToFile();
	// added to save button .click()
	this.updatePathSelection(this.lastSelectedLineType);
	
	console.log("paperJSPath imported to activeDesign complete"); //, path);
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
		params.path = {sewn: false}
	} else if (selected === "path-simple"){
		params.simplifiedPath = {sewn: false}
	} else if (selected === "path-segmented"){
		params.flattenedPath = {sewn: false}
	} else if (selected === "path-generated-design"){
		params.generatedPath = {sewn: false}
	} else if (selected === "path-sew-segmented"){
		params.flattenedPath = {sewn: true}
	} else if (selected === "path-sew-generated"){
		params.generatedPath = {sewn: true}
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
	console.log("this.activeDesign", this.activeDesign);
	
	for(var i = 0; i < this.designs.length; i++){
		// Deselect all
		this.designs[i].hideAndDeselectAllPaths();
		this.designs[i].showAndSelectPath(parsedSelection);
	}
	
	// do it for the active design as well
	// Deselect...
	if(this.activeDesign !== null){
		
		this.activeDesign.hideAndDeselectAllPaths();
		this.activeDesign.showAndSelectPath(parsedSelection);
	} else {
		console.log("Cannot update selection for a null activeDesign...");
	}
};

DesignHandler.prototype.regenerateAllDerivedPaths = function(inputParams){
	var params = {};
	if(inputParams === undefined){
		// Grab the slider parts, regenerate and make from existing path
		params = {
			tolerance: getValueOfSlider("lineSimplifierTolerance"),
			flatness: getValueOfSlider("lineFlatness"),
			stitchLength: getValueOfSlider("edgeThreshold")
		};
	} else {
		// NOTE: This should only be called when generateAllDerivedPaths is called on the activeDesign
		// otherwise, it would possibly set the path of other designs, WHICH WOULD BE BAD!!!
		console.log("!! Dangerous, calling regenerateAllPaths with params !!");
		params = inputParams;
	}
	console.log("regenerateAllDerivedPaths with new parameters", params);
	
	for(var i = 0; i < this.designs.length; i++){
		this.designs[i].regeneratePaths(params);
		//this.designs[i].prepForPrint(); // honestly should just be done when we're printing...
	}
	
	if(this.activeDesign !== null){
	// do it for the active design as well, if it's not null...
		this.activeDesign.regeneratePaths(params);
	}
	// Then update their visability...
	this.updatePathSelection(this.lastSelectedLineType);
};


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
			this.fillInStitchGapsAndAddStitchAbs(stPattern, this.scale, firstStitch.x, firstStitch.y, stitchTypes.jump, true, this.threshold)//, stitchTypes.normal);
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

