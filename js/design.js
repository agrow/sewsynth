var Design = function() {
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
	
	// For drawing/canvas vis
	this.defaultPath = null;
	this.simplifiedPath = null;
	this.flattenedPath = null;
	this.designPath = null;
	
	// JANK-FAST PRINTING
	this.pathPoints = [];
	this.generatedPathPoints = [];
	
	return this;
}; // Design

////////////////////////////////////////////////////////////////////////
/////// ACCESSORS //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
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
		this.simplifiedPath.simplify();
	} else {
		this.simplifiedPath.simplify(params.tolerance);
	}
};

// Should be called on simplifiedPath, uses params.flatten
Design.prototype.generateFlattenedPath = function(params){	
	if(this.defaultPath === null){
		console.err("Should not be calling generateFlattenedPath without a defaultPath");
		return;
	}
	
	if(this.simplifiedPath === null){
		console.err("Should not be calling generateFlattenedPath without a simplifiedPath");
		return;
	}
	
	if(this.flattenedPath !== null){
		this.flattenedPath.remove();
		this.flattenedPath = null;
	}
	
	this.flattenedPath = this.simplifiedPath.clone();
	
	if(params === undefined || params.flatness === undefined){
		console.log("using default path settings in generateFlattenedPath");
		this.flattenedPath.flatten(); // default is 2.5, maximum error
	} else {
		this.flattenedPath.flatten(params.flatness);
	}
};

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
	//this.testRelativeDesign();
	this.testAbsSinDesign(0.3, 4);
};

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
};

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
	
	console.log("Total distance calculated ", totalDist);
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
	
	this.generatePathRelativeToDesignLines(this.scaleYPointPosition( [new Point(.33, 1), new Point(.66, -1)], 10));
};

Design.prototype.testAbsSinDesign = function(sinSample, pointsDensity){
	this.generatePathPoints(this.flattenedPath); // Resets this.pathPoints to the recentPath. Need to do this to get the right distance.
	
	var totalDistance = this.calcDistanceOfPathPoints();
	var points = [];
	
	for(var i = 0; i <= totalDistance; i+= pointsDensity){
		console.log("Generating point at " + i + ", " + Math.sin(sinSample*i));
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
			this.generatedPathPoints = this.generatedPathPoints.concat(this.segmentToDesignLine(this.pathPoints[i], this.pathPoints[i+1], newPoints, true, false, false));
		else
			this.generatedPathPoints = this.generatedPathPoints.concat(this.segmentToDesignLine(this.pathPoints[i], this.pathPoints[i+1], newPoints, false, false, false));
	}
	console.log("generatedPathPoints!", this.generatedPathPoints);
	
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
	console.log("generatedPathPoints!", this.generatedPathPoints);
	
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

// pt1 and pt2 are the start/end points of 1 straight line segment
// newPoints is a list of new y values
// incPt1 and Pt2: flags to use the start and endpoints. Default is true !!! may cause duplicate stitches !!!
// absolute: a flag on whether the x in newPoints goes from 0-1, or whether it's an abs distance
// returns: a list of points (newPoints) strung along the line between pt1 and pt2 (0-1? Or abs?) x: 0 to 1, y: abs? 0 to -1 * scale?
Design.prototype.segmentToDesignLine = function(pt1, pt2, newPoints, incPt1, incPt2, absolute){
	var lineVect = pt2.subtract(pt1);
	console.log("pt2 - pt1", lineVect);
	var lineVectNormal = lineVect.normalize();
	
	var perp = new Point();
	perp.x = lineVect.y;
	perp.y = -lineVect.x;
	// .normalize function not working, doing my own...
	var dist = Math.sqrt((lineVect.y * lineVect.y) + (lineVect.x * lineVect.x));
	
	if(dist < 1){
		console.log("segmentToDesignLine has a segment of length TOO SMALL: " + dist);
		return [];
	}

	var slope = (pt2.y - pt1.y)/(pt2.x - pt1.x);
	if(pt2.x === pt1.x) slope = null;
	
	var b = pt1.y - (slope * pt1.x);
	if(slope === null) b = pt1.y;
	//console.log("slope 1 / slope 2, " + (pt2.y-pt1.y) + " / " + (pt2.x-pt1.x));
	
	var output = [];
	var drawer = null;
	
	if(incPt1 === undefined || incPt1 === true){
		output.push(pt1.clone());
	}
	
	for(var i = 0; i < newPoints.length; i++){
		// move drawer from pt1 to newPoints[i] by the slope along lineVect
		drawer = pt1.clone();
		//console.log(i + " pt1: " + drawer.x + ", " + drawer.y);
		
		//console.log("slope and b ", slope.toString(), b);
		if(absolute === true){
			drawer.x = drawer.x + (lineVectNormal.x * newPoints[i].x);
			drawer.y = drawer.y + (lineVectNormal.y * newPoints[i].y); 
			// Ugh, this is going to need to be adjusted on the y too, huh?
		} else {
			drawer.x = drawer.x + (lineVect.x * newPoints[i].x); // scaled to length...
		}
		
		drawer.y = (slope * drawer.x) + b;
		if(slope === null) {
			drawer.y = b;
			console.log("slope === null; drawer.y = b instead " + b);
		}
		
		//console.log(i + " drawer @ pt on line?: " + drawer.x + ", " + drawer.y);
		
		// This gets us where we would be on the line
		// Now we use the offset in newPoints to go up/down along the perpendicular vector
		// .normalize function not working, doing my own...
		perp.x = lineVect.y/dist;
		perp.y = -lineVect.x/dist;
		perp = perp.multiply(newPoints[i].y); // scale
		console.log(i + " perp, scaled: " + perp + " by " + newPoints[i].y);
		
		drawer = drawer.add(perp); // offset on x and y based on scaled perp

		//console.log(i + " drawer: " + drawer.x + ", " + drawer.y);
		output.push(drawer.clone()); // save the point in our stack
		//console.log("--------------------------");
	}
	
	// Also should/could check if first/last newPoints's x is 0 or 1.
	if(incPt2 === undefined || incPt2 === true){
		output.push(pt2.clone());
	}
	
	console.log("new points..." + output);
	
	return output;
};

// pt1 and pt2 are the start/end points of 1 straight line segment
// newPoints is a list of new y values
// incPt1 and Pt2: flags to use the start and endpoints. Default is true !!! may cause duplicate stitches !!!
// absolute: a flag on whether the x in newPoints goes from 0-1, or whether it's an abs distance
// returns: a list of points (newPoints) strung along the line between pt1 and pt2 (0-1? Or abs?) x: 0 to 1, y: abs? 0 to -1 * scale?
Design.prototype.segmentToDesignLineUsingRotation = function(pt1, pt2, newPoints, incPt1, incPt2, absolute){
	var lineVect = pt2.subtract(pt1);
	console.log("pt2 - pt1", lineVect);
	var lineVectNormal = lineVect.normalize();
	console.log("normal " + lineVectNormal);
	
	var angleOfRotation = Math.atan2(lineVectNormal.y, lineVectNormal.x);//Math.acos(lineVectNormal.dot(flatLine));
	console.log("segmentToDesignLineUsingRotation angle of Rotation: " + angleOfRotation);
	
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
	
	console.log("Output before rotation " + output);
	
	// Now we need to translate/rotate all these points to our line...
	for(var i = 0; i < output.length; i++){
		// Rotation, since we start relative to 0, 0 we don't need to move...
		var oldX = output[i].x; // NEED TO SAVE so that calc of y is right
		output[i].x = oldX * Math.cos(angleOfRotation) - output[i].y * Math.sin(angleOfRotation);
		output[i].y = oldX * Math.sin(angleOfRotation) + output[i].y * Math.cos(angleOfRotation);
		
		
	}
	
	console.log("Output after rotation " + output);
	console.log("Translating.... " + pt1);
	
	for(var i = 0; i < output.length; i++){
		
		// Move to our first point now that we have rotated around the origin as it if was our first point
		output[i] = output[i].add(pt1);
	}
	console.log("Output after translation " + output);
	
	console.log("new points..." + output);
	
	return output;
};
