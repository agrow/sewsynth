// !!!!!! TODO: Most of this should be moved to designPath.js
// !!!!!!  So we can easily have multiple paths in one design...

var Design = function() {
	this.verbose = false;
	this.id = global.designCount++;
	this.pointCount = 0;
	this.dimensions = {smallX: 999999, bigX: -999999, 
					   smallY: 999999, bigY: -999999, 
					   width: -1, height: -1};
	
	this.head = null;
	this.tail = null;
	
	this.currentAnchor = null;
	
	// In order of creation
	this.pointsStack = [];
	// By ID
	this.pointsMap = [];
	
	// By Location // TO DO LATER, IF IT'S USEFUL //
	//this.pointsMapByLocation = [];

		// TO DO: USE THIS INSTEAAAAD!
	this.paths = {
		"defaultPath": null,
		"simplifiedPath": null,
		"flatteenedPath": null,
		"designPath": null,
		"sewnFlattenedPath": null,
		"sewnDesignPath": null, 
	}

	// Used to determine which paths should be made dirty when a change gets made higher up the dependency chain
	// use recusion to hit all children down the tree
	this.pathDependents = {
		"defaultPath" : ["simplifiedPath"],
		"simplifiedPath" : ["flattenedPath"],
		"flattenedPath": ["designPath","sewnFlattenedPath" ],
		"designPath": ["sewnDesignPath"],
		"sewnFlattenedPath": [],
		"sewnDesignPath": [], 
	};
	// TO DO: USE THIS (correspends with path item #) to detect when to re-generate paths 
	// further down the chain when they are needed
	this.dirty = [true, true, true, true, true, true];
	
	// For drawing/canvas vis
	this.defaultPath = null;
	this.simplifiedPath = null;
	this.flattenedPath = null; // aka "segmentedPath" in the GUI
	this.designPath = null;
	this.sewnFlattenedPath = null;
	this.sewnDesignPath = null;

	this.stitchLengthMM = 2;
	this.pixelsPerMM = 10;
	// this is a MAX length. any uneven length is distributed between the ceiling of the division
	this.stitchLengthPixels = undefined;
	this.setSewnStitchLength(this.stitchLengthMM, this.pixelsPerMM);
	
	// JANK-FAST PRINTING!! The Path sent from the canvas is directly fed into the default path and beyond
	this.pathPoints = [];
	this.generatedPathPoints = [];
	
	return this;
}; // Design

// stitchLength is in mm
// pixelsPerMM is the screen -> stitchLength scale conversion
// pixelsPerMM should always be a number >1 (otherwise jesus how tiny is this path/screen? Oh, but that's an idea....)
Design.prototype.setSewnStitchLength = function(stitchLengthMM, pixelsPerMM){
	this.stitchLengthMM = stitchLengthMM;
	this.pixelsPerMM = pixelsPerMM;

	this.stitchLengthPixels = stitchLengthMM * pixelsPerMM; 

	console.log("Stitch Length Properties Set: " + this.stitchLengthMM + " * " + this.pixelsPerMM + " = " + this.stitchLengthPixels);
}

////////////////////////////////////////////////////////////////////////
/////// ACCESSORS //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
///// TODO: Instead of having different functions for each, use the this.paths

Design.prototype.getFirstPoint = function(){
	if(this.generatedPathPoints.length > 0)
		return this.generatedPathPoints[0];
	else 
		return null;
};

Design.prototype.getPointsForPrinting = function(){
	this.roundPathPoints();
	this.calcDimensionsBasedOnPathPoints();
	
	return this.generatedPathPoints;
};

Design.prototype.getSewnFlattenedPath = function(){
	// Make sure the flattened path is ready
	return this.sewnFlattenedPath;
};

Design.prototype.getSewnDesignPath = function(){
	// Make sure the designPath has been translated
	return this.sewnDesignPath;
};


////////////////////////////////////////////////////////////////////////
/////// DESIGN PATHS WITH PAPERJS //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// Round PATHPOINTS positions to their next whole number...
Design.prototype.roundPathPoints = function(){
	for(var i = 0; i < this.pathPoints.length; i++){
		this.pathPoints[i].x = Math.round(this.pathPoints[i].x);
		this.pathPoints[i].y = Math.round(this.pathPoints[i].y);
	}
	for(var i = 0; i < this.generatedPathPoints.length; i++){
		this.generatedPathPoints[i].x = Math.round(this.generatedPathPoints[i].x);
		this.generatedPathPoints[i].y = Math.round(this.generatedPathPoints[i].y);
	}
};

// Should be called on defaultPath as a stepping stone to flattenedPath, uses params.tolerance
Design.prototype.generateSimplifiedPath = function(params){
	if(this.defaultPath === null){
		console.err("Should not be calling generateSimplifiedPath without a defaultPath");
		return;
	}
	if(this.simplifiedPath !== null){
		this.simplifiedPath.remove();
		this.simplifiedPath = null;
	}
	
	this.simplifiedPath = this.defaultPath.clone();
	
	if(params === undefined || params.tolerance === undefined){
		console.log("using default path settings in generateSimplifidPath", params);
		// Part of Paper.js
		this.simplifiedPath.simplify();
	} else {
		this.simplifiedPath.simplify(params.tolerance);
	}
};

// Should be called on simplifiedPath, uses params.flatten
Design.prototype.generateFlattenedPath = function(params){	
	// Check dependencies
	if(this.defaultPath === null){
		console.err("Should not be calling generateFlattenedPath without a defaultPath");
		return;
	}
	
	if(this.simplifiedPath === null){
		console.err("Should not be calling generateFlattenedPath without a simplifiedPath");
		return;
	}
	
	// clean up old, dirty path
	if(this.flattenedPath !== null){
		this.flattenedPath.remove();
		this.flattenedPath = null;
	}
	
	this.flattenedPath = this.simplifiedPath.clone();
	
	if(params === undefined || params.flatness === undefined){
		console.log("using default path settings in generateFlattenedPath");
		//  Part of Paper.js
		this.flattenedPath.flatten(); // default is 2.5, maximum error
	} else {
		this.flattenedPath.flatten(params.flatness);
	}
};

// Should be called after generatedFlattenedPath
// Plots points stitchLength in pixels, preserving the start and end points especially
Design.prototype.generateSewnFlattenedPath = function(params){
	// Check dependencies (should be programmatic)
	if(this.defaultPath === null){
		console.err("Should not be calling generateSewnFlattenedPath without a defaultPath");
		return;
	}
	
	if(this.simplifiedPath === null){
		console.err("Should not be calling generateSewnFlattenedPath without a simplifiedPath");
		return;
	}

	if(this.flattenedPath === null){
		console.err("Should not be calling generateSewnFlattenedPath without a flattenedPath");
		return;
	}

	// Clean up old, dirty path (should be programmatic)
	if(this.sewnFlattenedPath !== null){
		this.sewnFlattenedPath.remove();
		this.sewnFlattenedPath = null;
	}

	this.sewnFlattenedPath = new Path(this.plotPathPointsOnDistance(this.flattenedPath));
	this.sewnFlattenedPath.strokeColor = 'blue';
	this.sewnFlattenedPath.opacity = 1;
	console.log("generatedToSewnFlattenedPath complete with length " + this.sewnFlattenedPath.segments.length);
};


Design.prototype.generateSewnDesignPath = function(params){
	// Check dependencies (should be programmatic)
	if(this.defaultPath === null){
		console.err("Should not be calling generateSewnFlattenedPath without a defaultPath");
		return;
	}
	
	if(this.simplifiedPath === null){
		console.err("Should not be calling generateSewnFlattenedPath without a simplifiedPath");
		return;
	}

	if(this.designPath === null){
		console.err("Should not be calling generateSewnFlattenedPath without a flattenedPath");
		return;
	}

	// Clean up old, dirty path (should be programmatic)
	if(this.sewnDesignPath !== null){
		this.sewnDesignPath.remove();
		this.sewnDesignPath = null;
	}

	this.sewnDesignPath = new Path(this.plotPathPointsOnDistance(this.designPath));
	this.sewnDesignPath.strokeColor = 'blue';
	this.sewnDesignPath.opacity = 1;
	console.log("generatedToSewnDesignPath complete with length " + this.sewnDesignPath.segments.length);
};

///////////////////////////////////////////////////////////////////////////////////////
//////////// Helpers for Path Translation /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

// Make sure to update/set visability after calling this function!
Design.prototype.regeneratePaths = function(params){
	if(params === undefined){
		if(this.defaultPath === null){
			console.err("Cannot regenerate a path from no params and no defaultPath");
			return;
		} 
	} else {
		if(params.path !== undefined){
			// Clean up our canvas!
			if(this.defaultPath !== null) this.defaultPath.remove();
			this.defaultPath = params.path.clone();
	
		} else {
			// Params.path is null, just assume we already have one saved and go on...
		}
	}
	// By this point, the default path has been set one way or another, or we forgot to set it ;)
	this.generateSimplifiedPath(params);
	this.generateFlattenedPath(params);
	this.generateSewnFlattenedPath(params);
	this.testRelativeDesign();
	this.generateSewnDesignPath(params);
	
	//this.testAbsSinDesign(0.3, 4);
};

// Returns: a new list of points that are based on the input path, with points placed
// the sewn distance by pixels apart as a max goal. May be shortened in order to
// conserve endpoints on the segments (every point on the path is a sewn position)
// TODO: relaxation settings should allow us to round off points based on an allowance
// 		Doesn't Paper.js do this? Should this be just done on the design path directly?
// 
Design.prototype.plotPathPointsOnDistance = function(path){
	if(path == null){
		console.err("Cannot plotPathPointsOnDistance for a null path");
		return;
	}
	if(path.length <= 1){
		console.err("Cannot plotPathPointsOnDistance for a path of 0 or 1 points", path);
		return;
	}
	var plottedPoints = [];
	console.log("plotting", path);
	console.log("Path length // this.stitchLengthPixels", path.length, this.stitchLengthPixels);
	var numPoints = Math.ceil(path.length/this.stitchLengthPixels); // Makes sure all is <= stitchLengthPixels
	console.log("fits # of points (without endpoint)", numPoints);

	// loops for numPoints+1 for the endpoint, which should be at offset = path.length (i and numPoints cancel each other out)
	for(var i = 0; i <= numPoints; i++){
		var offset = (path.length/numPoints) * i;
		var point = path.getPointAt(offset);
		console.log("Plotted point 1 by offset", i, offset, point);
		plottedPoints.push(point);
	}

	
	console.log("plotted sewn points on disance", plottedPoints);
	return plottedPoints;
}

///////////////////////////////////////////////////////////////////////////////////////
//////////// UI on the Paths //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

Design.prototype.hideAndDeselectAllPaths = function(){
	if(this.defaultPath !== null){
		this.defaultPath.selected = false;
		this.defaultPath.visible = false;
	}
	if(this.simplifiedPath !== null){
		this.simplifiedPath.selected = false;
		this.simplifiedPath.visible = false;
	}
	if(this.flattenedPath !== null){
		this.flattenedPath.selected = false;
		this.flattenedPath.visible = false;
	}
	if(this.designPath !== null){
		this.designPath.selected = false;
		this.designPath.visible = false;
	}
	if(this.sewnDesignPath !== null){
		this.sewnDesignPath.selected = false;
		this.sewnDesignPath.visible = false;
	}
	if(this.sewnFlattenedPath !== null){
		this.sewnFlattenedPath.selected = false;
		this.sewnFlattenedPath.visible = false;
	}
};

// These strings are set in INDEX.HTML WHAT?!
Design.prototype.showAndSelectPath = function(selected){
	if(selected === "path-complex"){
		this.defaultPath.selected = true;
		this.defaultPath.visible = true;
	} else if (selected === "path-simple"){
		this.simplifiedPath.selected = true;
		this.simplifiedPath.visible = true;
	} else if (selected === "path-segmented"){
		this.flattenedPath.selected = true;
		this.flattenedPath.visible = true;
	} else if (selected === "path-design"){
		this.designPath.selected = true;
		this.designPath.visible = true;
	} else if (selected === "path-sew-segmented"){
		this.sewnFlattenedPath.selected = true
		this.sewnFlattenedPath.visible = true;
	} else if (selected === "path-sew-generated"){
		this.sewnDesignPath.selected = true;
		this.sewnDesignPath.visible = true;
	} else {
		// Haha! It's none of them!
		console.log("Called showAndSelectPath on a design with selected", selected);
	}
};

// Can be done of any paperjs path
// NOTE: THIS DESTROYS ANY PREVIOUS PATH POINTS!!
Design.prototype.parsePathToPoints = function(path){
	if(this.pathPoints.length > 0) console.log("Deleting current path points, count: " + this.pathPoints.length);
	
	// Hopefully I don't need to clean up any previous pathPoints?
	this.pathPoints = [];
	for (var i = 0; i < path.segments.length; i++){
		this.pathPoints.push(path.segments[i].point.clone());
	}
	
	// DIRTY!!!! EVERYTHING IS DIRTY!
	console.log(this.pathPoints);
};

Design.prototype.generatePathPoints = function(path){
	this.parsePathToPoints(path);
	this.roundPathPoints();
	
};

////////////////////////////////////////////////////////////////////////
/////// DESIGN DIMENSIONS //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// TO DO: BASED ON OTHER POINTS
Design.prototype.calcDimensionsBasedOnPathPoints = function(){
	this.dimensions = {smallX: 999999, bigX: -999999, 
					   smallY: 999999, bigY: -999999, 
					   width: -1, height: -1};
	
	for(var i = 0; i < this.pathPoints.length; i++){
		if(this.pathPoints.x < this.dimensions.smallX) this.dimensions.smallX = this.pathPoints.x;
		if(this.pathPoints.y < this.dimensions.smallY) this.dimensions.smallY = this.pathPoints.y;
		if(this.pathPoints.x > this.dimensions.bigX) this.dimensions.bigX = this.pathPoints.x;
		if(this.pathPoints.y > this.dimensions.bigY) this.dimensions.bigY = this.pathPoints.y;
	}
	
	this.dimensions.width = this.dimensions.bigX - this.dimensions.smallX;
	this.dimensions.height = this.dimensions.bigY - this.dimensions.smallY;
};

Design.prototype.calcDistanceOfPathPoints = function(){
	var totalDist = 0;
	
	// i < length -1 for i to i+1 distance...
	for(var i = 0; i < this.pathPoints.length-1; i++){
		totalDist += this.pathPoints[i].getDistance(this.pathPoints[i+1]);
	}
	
	if(this.verbose) console.log("Total distance calculated ", totalDist);
	return totalDist;
};


////////////////////////////////////////////////////////////////////////
/////// DESIGN GENERATION //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// Density: how closely stitches are made, resulting in something akin to satin or scribbles. 0-1
// maxWidth: how wide from the origional design line we are allowed to go. pixels?
// rateOfChange: How quickly the design runs through the func's changes
// func: function of change, in this case noise, so func would likely be a random seed fed into perlinNoise
Design.prototype.add1DNoise = function(density, maxWidth, rateOfChange, func){
	
};

Design.prototype.add2DNoise = function(density, maxWidth, rateOfChange, variation, func1, func2){
	
};

Design.prototype.testRelativeDesign = function(){
	this.generatePathPoints(this.flattenedPath); // Resets this.pathPoints to the recentPath.
	
	this.generatePathRelativeToDesignLines(this.scaleYPointPosition( [new Point(.33, 1), new Point(.66, -1)], 50));
};

Design.prototype.testAbsSinDesign = function(sinSample, pointsDensity){
	this.generatePathPoints(this.flattenedPath); // Resets this.pathPoints to the recentPath. Need to do this to get the right distance.
	
	var totalDistance = this.calcDistanceOfPathPoints();
	var points = [];
	
	for(var i = 0; i <= totalDistance; i+= pointsDensity){
		if(this.verbose) console.log("Generating point at " + i + ", " + Math.sin(sinSample*i));
		points.push(new Point(i, Math.sin(sinSample*i)));
	}
	
	this.generatePathAbsoluteToDesignLines(this.scaleYPointPosition(points, 10));
};

Design.prototype.testAbsNoiseDesign = function(pointsDensity){
	
};

// Plan to make this a slider, so we gotta have a function apply it here...
Design.prototype.scaleYPointPosition = function(pts, scale){
	var newPoints = [];
	for(var i = 0; i < pts.length; i++){
		var pt = pts[i].clone();
		pt.y = pt.y * scale;
		newPoints.push(pt);
	}
	return newPoints;
};

//////////////////////////////////////////////////////////////////////////////
//////////////// RELATIVE... /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

Design.prototype.generatePathRelativeToDesignLines = function(newPoints){
	console.log("generatePathRelativeToDesignLines " + newPoints);
	this.generatedPathPoints = []; // hopefully we don't need to clean this out!
	
	// < length -1 because we are always dealing with i and i+1
	for(var i = 0; i < this.pathPoints.length-1; i++){
		if(i === 0)
			this.generatedPathPoints = this.generatedPathPoints.concat(this.segmentToDesignLineRelative(this.pathPoints[i], this.pathPoints[i+1], newPoints, true, false));
		else
			this.generatedPathPoints = this.generatedPathPoints.concat(this.segmentToDesignLineRelative(this.pathPoints[i], this.pathPoints[i+1], newPoints, false, false));
	}
	if(this.verbose) console.log("generatedPathPoints!", this.generatedPathPoints);
	
	// Remove any previous lines that have been made/drawn...
	if(this.designPath !== null) {
		this.designPath.remove();
		this.designPath = null;
	}
	this.designPath = new Path(this.generatedPathPoints); // an array of segments
	this.designPath.strokeColor = 'blue';
	this.designPath.opacity = 1;
	console.log("this.designPath complete! " + this.designPath);
	
};


/////////////////////////////////////////////////////////////////////////
////////////////// ABS Functions ///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

Design.prototype.generatePathAbsoluteToDesignLines = function(newPoints){	
	this.generatedPathPoints = []; // hopefully we don't need to clean this out!
	
	var distOnX = 0; // need to keep track so we know how far to progress each point
	
	// < length -1 because we are always dealing with i and i+1
	for(var i = 0; i < this.pathPoints.length-1; i++){
		var pointsToSend = [];
		var distOfThisLineSegment = this.pathPoints[i].getDistance(this.pathPoints[i+1]);
		// Grab all points between our current distOnX and the distance of this line segment + distOnX
		for(var j = 0; j < newPoints.length; j++){
			if(newPoints[j].x > distOnX && newPoints[j].x <= (distOnX+distOfThisLineSegment)){
				console.log("Point within distance requirements...[" + j + "] " + newPoints[j]);
				pointsToSend.push(newPoints[j]);
			}
		}
		
		// At this point, pointsToSend should have a list of points using abs distance.
		// Now, subtract the distance we've already traveled so we have only the distance needed for this segment...
		for(var j = 0; j < pointsToSend.length; j++){
			pointsToSend[j].x = pointsToSend[j].x - distOnX; // We know this will be > 0 because x had to be > distOnX before
		}
		
		// NOW WE ARE READY FOR ABSOLUTE PLACEMENT OF POINTS ON THE LINE!!!
		if(i === 0)
			this.generatedPathPoints = this.generatedPathPoints.concat(this.segmentToDesignLineUsingRotation(this.pathPoints[i], this.pathPoints[i+1], pointsToSend, true, false, true));
		else
			this.generatedPathPoints = this.generatedPathPoints.concat(this.segmentToDesignLineUsingRotation(this.pathPoints[i], this.pathPoints[i+1], pointsToSend, false, false, true));
			
			
		// And finally, update distOnX for this segment so we can move on to the next...
		distOnX += distOfThisLineSegment;
	}
	if(this.verbose) console.log("generatedPathPoints!", this.generatedPathPoints);
	
	// Remove any previous lines that have been made/drawn...
	if(this.designPath !== null) {
		this.designPath.remove();
		this.designPath = null;
	}
	this.designPath = new Path(this.generatedPathPoints); // an array of segments
	this.designPath.strokeColor = 'blue';
	this.designPath.opacity = 1;
	console.log("this.designPath complete! " + this.designPath);
	
};


/////////////////////////////////////////////////////////////////////////
///////////////// Works for both...
////////////////////////////////////////////////////////////////////////////

Design.prototype.segmentToDesignLineRelative = function(pt1, pt2, newPoints, incPt1, incPt2){
	// Convert relative to absolute
	var lineVect = pt2.subtract(pt1);
	var dist = Math.sqrt((lineVect.y * lineVect.y) + (lineVect.x * lineVect.x));
	var output = [];
	
	for(var i = 0; i < newPoints.length; i++){
		var newX = dist * newPoints[i].x;
		output.push(new Point(newX, newPoints[i].y));
	}
	
	return this.segmentToDesignLineUsingRotation(pt1, pt2, output, incPt1, incPt2);
};

// pt1 and pt2 are the start/end points of 1 straight line segment
// newPoints is a list of new y values
// incPt1 and Pt2: flags to use the start and endpoints. Default is true !!! may cause duplicate stitches !!!
// absolute: a flag on whether the x in newPoints goes from 0-1, or whether it's an abs distance
// returns: a list of points (newPoints) strung along the line between pt1 and pt2 (0-1? Or abs?) x: 0 to 1, y: abs? 0 to -1 * scale?
Design.prototype.segmentToDesignLineUsingRotation = function(pt1, pt2, newPoints, incPt1, incPt2, absolute){
	var lineVect = pt2.subtract(pt1);
	if(this.verbose) console.log("pt2 - pt1", lineVect);
	var lineVectNormal = lineVect.normalize();
	if(this.verbose) console.log("normal " + lineVectNormal);
	
	var angleOfRotation = Math.atan2(lineVectNormal.y, lineVectNormal.x);//Math.acos(lineVectNormal.dot(flatLine));
	if(this.verbose) console.log("segmentToDesignLineUsingRotation angle of Rotation: " + angleOfRotation);
	
	var dist = Math.sqrt((lineVect.y * lineVect.y) + (lineVect.x * lineVect.x));
	
	if(dist < 1){
		console.log("segmentToDesignLine has a segment of length TOO SMALL: " + dist);
		return [];
	}

	var output = [];
	
	if(incPt1 === undefined || incPt1 === true){
		output.push(new Point(0,0));
	}
	
	for(var i = 0; i < newPoints.length; i++){
		output.push(newPoints[i].clone());
	}
	
	if(incPt2 === undefined || incPt2 === true){
		output.push(new Point(dist, 0));
	}
	
	if(this.verbose) console.log("Output before rotation " + output);
	
	// Now we need to translate/rotate all these points to our line...
	for(var i = 0; i < output.length; i++){
		// Rotation, since we start relative to 0, 0 we don't need to move...
		var oldX = output[i].x; // NEED TO SAVE so that calc of y is right
		output[i].x = oldX * Math.cos(angleOfRotation) - output[i].y * Math.sin(angleOfRotation);
		output[i].y = oldX * Math.sin(angleOfRotation) + output[i].y * Math.cos(angleOfRotation);
		
		
	}
	
	if(this.verbose) console.log("Output after rotation " + output);
	if(this.verbose) console.log("Translating.... " + pt1);
	
	for(var i = 0; i < output.length; i++){
		
		// Move to our first point now that we have rotated around the origin as it if was our first point
		output[i] = output[i].add(pt1);
	}
	if(this.verbose) console.log("Output after translation " + output);
	
	if(this.verbose) console.log("new points..." + output);
	
	return output;
};
