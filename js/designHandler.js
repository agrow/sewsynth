// Input: Paperjs Path
// Output: [points]
// Options: distance of points, how exact those points should be
//// path.flatten([maximum error, default 0.25]);
var parsePaperPathToPoints = function(path, options){
	var localPath = path.clone();//{insert:false});
	//localPath.selected = false;
	//localPath.opacity = 0;
	console.log(localPath);
	localPath.flatten(1); // ToDo: slider
	var points = [];
	for (var i = 0; i < localPath.segments.length; i++){
		points.push(localPath.segments[i].point.clone());
	}
	
	console.log(points);
	return points;
};

var DesignHandler = function(){
	this.designs = [];
	this.activeDesign = null;
	this.scale = 2;
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
	
	this.activeDesign.defaultPath = path.clone(); // does not add to scene
	this.activeDesign.simplifiedPath = path.clone();
	console.log("default path size ", path.segments.length)
	
	// Now simplify the simplified path
	this.activeDesign.simplifiedPath.simplify(getValueOfSlider("lineSimplifierTolerance"));
	//this.activeDesign.simplifiedPath.selected = true;
	this.activeDesign.simplifiedPath.opacity = 1;
	console.log("simplified segment count ", this.activeDesign.simplifiedPath.segments.length);
	
	// Then translate it to our design line
	this.activeDesign.pathPoints = parsePaperPathToPoints(this.activeDesign.simplifiedPath);
	console.log("pathPoints from simplified path ", this.activeDesign.pathPoints.length);
	this.activeDesign.flattenedPath = this.activeDesign.simplifiedPath.clone();
	this.activeDesign.flattenedPath.flatten(1);
	// Then apply some design xform
	
	// Prep to print
	this.activeDesign.roundPathPoints(); // Makes printing and sewing clearer/easier. BW was always in integers
	this.activeDesign.calcDimensionsBasedOnPathPoints();
	// SHOULD BE DONE OUT OF HERE
	//this.saveAllDesignsToFile();
	// added to save button .click()
	this.updatePathSelection("path-segmented");
	
	console.log("paperJSPath imported to activeDesign complete"); //, path);
};

DesignHandler.prototype.updatePathSelection = function(selected){
	console.log("updating path to select ", selected);
	for(var i = 0; i < this.designs.length; i++){
		// Deselect all
		this.designs[i].defaultPath.selected = false;
		this.designs[i].simplifiedPath.selected = false;
		this.designs[i].flattenedPath.selected = false;
		// Then select only the right ones
		if(selected === "path-complex"){
			this.designs[i].defaultPath.selected = true;
		} else if (selected === "path-simple"){
			this.designs[i].simplifiedPath.selected = true;
		} else if (selected === "path-segmented"){
			this.designs[i].flattenedPath.selected = true;
		} else {
			// Haha! It's none of them!
		}
	}
	
	// do it for the active design as well
	// Deselect...
	this.activeDesign.defaultPath.selected = false;
	this.activeDesign.simplifiedPath.selected = false;
	this.activeDesign.flattenedPath.selected = false;
	// Then select the right ones
	if(selected === "path-complex"){
		this.activeDesign.defaultPath.selected = true;
	} else if (selected === "path-simple"){
		this.activeDesign.simplifiedPath.selected = true;
	} else if (selected === "path-segmented"){
		this.activeDesign.flattenedPath.selected = true;
	} else {
		// Haha! It's none of them!
	}
	
};


// NOTE: Currently colors are not supported, so we send "true" to use auto-color
DesignHandler.prototype.saveAllDesignsToFile = function(){
	this.closeActiveDesign(); // So they are all on this.designs
	var stPattern = new Pattern();
	
	
	
	// JUMP to the first stitch of this.designs if it exists
	if(this.designs.length > 0 && this.designs[0].pathPoints.length > 0){
		var firstStitch = this.designs[0].pathPoints[0];
		stPattern.addStitchAbs(firstStitch.x*this.scale, firstStitch.y*this.scale, stitchTypes.jump, true);
		//this.fillInStitchGapsAndAddStitchAbs(stPattern, this.scale, firstStitch.x, firstStitch.y, stitchTypes.jump, true, this.threshold);
	} else {
		// There are no points in the first design?! WTF?!
		// gotta add an anchor point,this will be at the upper left?
		stPattern.addStitchAbs(0, 0, stitchTypes.jump, true);
	}
	
	// For each old design, in order, stitch them out jumping between each
	for(var i = 0; i < this.designs.length; i++){
		// For each point in this design, stitch to there!
		for(var j = 0; j < this.designs[i].pathPoints.length; j++){
			var point = this.designs[i].pathPoints[j];
			this.fillInStitchGapsAndAddStitchAbs(stPattern, this.scale, point.x, point.y, stitchTypes.normal, true, this.threshold);
		}
		// If there are more designs after this one...
		if(i < this.designs.length-1) {
			// JUMP from the last stitch of this design to the last stitch of the next
			var firstStitch = this.designs[i+1].pathPoints[0];
			this.fillInStitchGapsAndAddStitchAbs(stPattern, this.scale, firstStitch.x, firstStitch.y, stitchTypes.jump, true, this.threshold);
		}
	}
	
	// Now close down the pattern, adjust for printing, and send to file!
	stPattern.addStitchRel(0, 0, stitchTypes.end, true);
	console.log("pattern stitches!: " + stPattern.stringifyStitches());
	
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

DesignHandler.prototype.fillInStitchGapsAndAddStitchAbs = function(stPattern, scale, x, y, flags, color, threshold = 121){
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

