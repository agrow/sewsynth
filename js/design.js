// !!!!!! TODO: Most of this should be moved to designPath.js
// !!!!!!  So we can easily have multiple paths in one design...

var Design = function() {
	this.verbose = false;
	this.id = global.designCount++;
	this.pointCount = 0;
	this.dimensions = {smallX: 999999, bigX: -999999, 
					   smallY: 999999, bigY: -999999, 
					   width: -1, height: -1};
					
	// list of DesignPaths   
	this.paths = [];
	
	this.currentAnchor = null;
	
	return this;
}; // Design


////////////////////////////////////////////////////////////////////////
/////// ACCESSORS //////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
/////// GENERATE PATHS WITH DESIGNPATH.JS //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// Round PATHPOINTS positions to their next whole number...
Design.prototype.roundPathPoints = function(){
	// Loop through all DesignPaths to round their points (and possibly points of all derived paths? Only derived paths?)
};

// Should be called on defaultPath as a stepping stone to flattenedPath, uses params.tolerance
Design.prototype.generateSimplifiedPath = function(params){
	// Loop through all DesignPaths to generate their simplified paths
};

// Should be called on simplifiedPath, uses params.flatten
Design.prototype.generateFlattenedPath = function(params){	
	// Loop through all DesignPaths to generate their flattenedPath
};

Design.prototype.generateSewnPath = function(params){
	// plots sewn paths for specific input paths in params
};

// Make sure to update/set visability after calling this function!
Design.prototype.regenerateAllDerivitivePaths = function(){
	// Loops through all DesignPaths
	// re-generates all flattened & simplified derivitive paths
	// all paths should be clean & designPath should be ready to be overwritten
	
	/* Old:
	 * // By this point, the default path has been set one way or another, or we forgot to set it ;)
	this.generateSimplifiedPath(params);
	this.generateFlattenedPath(params);
	this.generateSewnFlattenedPath(params);
	this.testRelativeDesign();
	this.generateSewnDesignPath(params);
	
	//this.testAbsSinDesign(0.3, 4);
	 */
};

///////////////////////////////////////////////////////////////////////////////////////
//////////// Helpers for Path Translation /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

// Returns: a new list of points that are based on the input path, with points placed
// the sewn distance by pixels apart as a max goal. May be shortened in order to
// conserve endpoints on the segments (every point on the path is a sewn position)
// TODO: relaxation settings should allow us to round off points based on an allowance
// 		Doesn't Paper.js do this? Should this be just done on the design path directly?
// 
/*
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
}*/

///////////////////////////////////////////////////////////////////////////////////////
//////////// UI on the Paths //////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

Design.prototype.hideAndDeselectAllPaths = function(){
	// For each designPath, hide and deselect them
};

// These strings are set in INDEX.HTML WHAT?!
Design.prototype.showAndSelectPath = function(selected){
	// Find which paths in which designPaths need to be shown
	// based on the strings sent from index.html
	
	/*if(selected === "path-complex"){
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
	}*/
};

/*
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
*/
/*
Design.prototype.generatePathPoints = function(path){
	this.parsePathToPoints(path);
	this.roundPathPoints();
	
};*/

////////////////////////////////////////////////////////////////////////
/////// DESIGN DIMENSIONS //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// TO DO: BASED ON OTHER POINTS
Design.prototype.calcDimensionsBasedOnPathPoints = function(){
	/*
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
	this.dimensions.height = this.dimensions.bigY - this.dimensions.smallY;*/
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
