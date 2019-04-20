var DesignGenerator = function(){
	this.verbose = false;
	
	// generation things sometimes require some seeds. We should save these where necessary
	this.noiseSeeds = [];
	for(var i = 0; i < 5; i++){
		this.noiseSeeds.push(Math.random());
	}
	/*
	this.defaultNoiseSettings = {
		num_iterations: 5, 
		persistence: .7,
		freq: .007, 
		// normal noise is 0-1, remember this is pixels
		// 10 gives us at least a solid number. with a distance away from the original point 
		low: -30, 
		high: 30
	};
	*/
	return this;
}; // DesignGenerator

////////////////////////////////////////////////////////////////////////
/////// INPUT/INTERFACE //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

DesignGenerator.prototype.generate = function(params){
	if(params === undefined || params === null){
		console.log("CANNOT generate anything without some grounding using params");
		return null;
	}
	
	if(params.path === undefined || params.path === null || params.type === undefined || params.type === null){
		console.log("CANNOT generate anything without some grounding using a 'path' and a type", params);
		return null;
	}
	
	global.mainCanvasHandler.clearDebugLines();
	return this.parseToolParams(params);
};

// Input: params:{
//		path:   	 
//		type: (toolLibrary names) 	 
//		noiseSettings: (num_iterations, persistence, freq, low, high) // there are defaults for all of these  	 
//		path:  	 
//		path:  	 
//		path:  	 
// }
// 
// Output: a list of newly points
//

// NOTE: these directly relate to the tools.js library
// ie global.toolLibrary[name] will have GLOBAL/DEFAULT properties for these tools
// however, paths might hold their own settings later...
// It should use the key name for the tool and look up the settings
DesignGenerator.prototype.parseToolParams =  function(params){
	// Each of these options should return a newPath
	// TODO: in the future, this generator will return multiple paths
	// FOR NOW, plainLine will just return a clone of the original path
	// we technically don't have to "generate" anything, however it means
	// that we can call upon the 'generated path' in any instance of any tool
	// and come back with the appropriate path(s)
	// ... unless this causes a problem
	var newPath = null;
	
	try{
	
		switch(params.type) {
		    case "plainLine":
		        // For now we'll just return the relative break-down? Or should we just clone it?
		        newPath = params.path.clone();
		        
		        //var relativeNewPoints = this.scaleYPointPosition( [new Point(.33, 1), new Point(.66, -1)], 50);
				//var points = this.getPathPointsOfPaperJSPath(params.path);
				//newPath = new Path(this.generatePathRelativeToDesignLines(points, relativeNewPoints));
		        
		        break;
		        // currently there is no difference between relative and absolute
		        // maybe if we find a meaningful difference I can be bothered to add those settings
		    //case "absolute": // vs "relative"
		    //    
		    //    break;
		    case "sketchNoise":
		        newPath = this.applyNoiseToPath(params.path, this.fetchDefaultToolNoiseSettings(params.type));
		        
		        break;
		    case "sketchHighNoise":
		    	newPath = this.apply1DNoiseToPath(params.path, this.fetchDefaultToolNoiseSettings(params.type));
		        
		        break;
		    case "graffitiNoise":
		    	newPath = this.applyNoiseToPath(params.path, this.fetchDefaultToolNoiseSettings(params.type));
		        
		        break;
		    case "swingNoise":
		        
		        break;
		    case "speedyDrawing":
		        
		        break;
		    case "speedyEvenDrawing":
		        
		        break;
		    case "echoExact":
		        
		        break;
		    case "echoTangent":
		        
		        break;
		    case "plainSatin":
		        
		        break;
		    
		    default:
		    	console.log("No case for parsing tool params.type", params);
		        break;
		}
	} catch (e) {
		console.log("PROBLEM WITH NEWPATH", newPath);
		console.log(e);
	}
	
	return newPath;
};

DesignGenerator.prototype.fetchDefaultToolNoiseSettings = function(type){
	return global.toolLibrary[type].noiseSettings;
};

////////////////////////////////////////////////////////////////////////
/////// HELPER FUNCTIONS //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// args: a Paper.js path
// pre: path !== null
// returns: new array of Paper.js points made off of the path's segments
DesignGenerator.prototype.getPathPointsOfPaperJSPath = function(path){
	if(path == null){
		console.log("no path specified, BAD BAD BAD");
		return [];
	};
	
	var points = [];
	
	for(var i = 0; i < path.segments.length; i++){
		points.push(path.segments[i].point.clone());
	}
	return points;
};

// Plan to make this a slider, so we gotta have a function apply it here...
// Takes relative points (0-1 on x, any size on y). Y gets multiplied by scale
DesignGenerator.prototype.scaleYPointPosition = function(pts, scale){
	var newPoints = [];
	for(var i = 0; i < pts.length; i++){
		var pt = pts[i].clone();
		pt.y = pt.y * scale;
		newPoints.push(pt);
	}
	return newPoints;
};

// TODO: integrate angles into any paths off the main path
DesignGenerator.prototype.applyAngle = function(originPath, generatedPath, radius, angle){
	// for each point on generatedPath,
		// Find closest point on originPath
		// Make conceptual circle with originPoint as the origin and generatedPoint at edge
		// Find angle of line between originPoint & generated point as differentiated by 
			// a standard 0 is to the direct right
		// Make newPoint at new radius between originPoint and generatedPoint
		// move newPoint by angle along the circle of input radius with center at originPath
};


////////////////////////////////////////////////////////////////////////
/////// GENERATION //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
/////// NOISE //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

/*
 * this.defaultNoiseSettings = {
		num_iterations: 5, 
		persistence: .7,
		freq: .007, 
		low: -1, 
		high: 1,
	}
 */


// TODO: noise.seed(Math.random()); for the generator's appropriate seed
// TODO: Neatly compine the overlapping code with noise1D version
DesignGenerator.prototype.applyNoiseToPath = function(path, params){
	var iterations = null;
	var persistence = null;
	var freq = null;
	var low = null;
	var high = null;
	
	if(params !== undefined && params !== null){
		//console.log("NoiseToPath using some new settings", params);
		
		if(params.num_iterations !== undefined && params.num_iterations !== null){
			iterations = params.num_iterations;
		}
		if(params.persistence !== undefined && params.persistence !== null){
			persistence = params.persistence;
		}
		if(params.freq !== undefined && params.freq !== null){
			freq = params.freq;
		}
		if(params.low !== undefined && params.low !== null){
			low = params.low;
		}
		if(params.high !== undefined && params.high !== null){
			high = params.high;
		}
	} else {
		console.log("NoiseToPath using default noise settings", this.defaultNoiseSettings);
		iterations = this.defaultNoiseSettings.num_iterations;
		persistence = this.defaultNoiseSettings.persistence;
		freq = this.defaultNoiseSettings.freq;
		low = this.defaultNoiseSettings.low;
		high = this.defaultNoiseSettings.high;
	}
	// TODO: noise.seed(Math.random()); for the generator's appropriate seed
	var newPath = path.clone();
	for(var i = 0; i < newPath.segments.length; i++){
		var xvalue = this.sumOcatave(iterations, newPath.segments[i].point.x, newPath.segments[i].point.y, persistence, freq, low, high);
		var yvalue = this.sumOcatave(iterations, xvalue, newPath.segments[i].point.y/2, persistence, freq, low, high);
		
		//console.log("noise values for i ", i, xvalue, yvalue);
		newPath.segments[i].point.x += xvalue;
		
		newPath.segments[i].point.y += yvalue;
	}
	return newPath;
	
};

// num_iterations is how many ocataves of noise we average
// x and y are the locations
// persistence is the scale factor for each iteration, 
//		<0 makes amp decrease over time, >0 makes amp increase over time
// freq is the frequency
// low/high are the range of values we are getting in return
// https://cmaher.github.io/posts/working-with-simplex-noise/

DesignGenerator.prototype.sumOcatave = function(num_iterations, x, y, persistence, freq, low, high){
	
	var noiseVal = this.sumOcataveUnscaled(num_iterations, x, y, persistence, freq);
	// normalize the result
	noiseVal = noiseVal * (high - low)/2 + (high + low)/2;
	
	return noiseVal;
	
};

DesignGenerator.prototype.sumOcataveUnscaled = function(num_iterations, x, y, persistence, freq){
	var maxAmp = 0;
	var amp = 1;
	var noiseVal = 0;
	
	// add successively smaller, higher-frequency terms
	for(var i = 0; i < num_iterations; i++){
		noiseVal += noise.simplex2(x * freq, y * freq) * amp;
		maxAmp += amp;
		amp *= persistence;
		freq *= 2;
	}
	
	// take the average value of the iterations
	noiseVal /= maxAmp;
	
	return noiseVal;
	
};
// TODO: Neatly compine the overlapping code with regular noise version
DesignGenerator.prototype.apply1DNoiseToPath = function(path, params){
	var iterations = null;
	var persistence = null;
	var freq = null;
	var low = null;
	var high = null;
	
	if(params !== undefined && params !== null){
		//console.log("NoiseToPath using some new settings", params);
		
		if(params.num_iterations !== undefined && params.num_iterations !== null){
			iterations = params.num_iterations;
		}
		if(params.persistence !== undefined && params.persistence !== null){
			persistence = params.persistence;
		}
		if(params.freq !== undefined && params.freq !== null){
			freq = params.freq;
		}
		if(params.low !== undefined && params.low !== null){
			low = params.low;
		}
		if(params.high !== undefined && params.high !== null){
			high = params.high;
		}
	} else {
		console.log("NoiseToPath using default noise settings", this.defaultNoiseSettings);
		iterations = this.defaultNoiseSettings.num_iterations;
		persistence = this.defaultNoiseSettings.persistence;
		freq = this.defaultNoiseSettings.freq;
		low = this.defaultNoiseSettings.low;
		high = this.defaultNoiseSettings.high;
	}
	
	var newPath = path.clone();
	for(var i = 0; i < newPath.segments.length; i++){
		var value = this.sumOcataveUnscaled(iterations, newPath.segments[i].point.x/10, newPath.segments[i].point.y/10, persistence, freq);
		//value = value * (Math.abs(high) + Math.abs(low));
		value = Math.abs(value * (high - low)/2);
		
		// If we are not the endpoints, find the tangent between
		// the last and next points
		var movementVector = null;
		if(i > 0 && i < newPath.segments.length-1){
			//movementVector = this.getRelTangentVector(path.segments[i-1].point, path.segments[i].point, path.segments[i+1].point);
			movementVector = this.getRelVectorWithAngle(path.segments[i-1].point, path.segments[i].point, path.segments[i+1].point, 90);
			
			
			// if odd, make the vector all negative so we move down
			if(i % 2 == 1){
				//movementVector.x = -movementVector.x;
				//movementVector.y = -movementVector.y;
				movementVector = movementVector.rotate(180);
			} 
			
			//var temp = newPath.segments[i].point.clone();
			//temp.x += 20*movementVector.x;
			//temp.y += 20*movementVector.y;
			
			//global.mainCanvasHandler.drawDebugLine([newPath.segments[i].point,temp], 'red');
			//console.log("scale value on vector", movementVector, value);
			
			//console.log("final movement vector ", movementVector);
			
			newPath.segments[i].point.x += value*movementVector.x;//20 * movementVector.x;
			newPath.segments[i].point.y += value*movementVector.y;//20 * movementVector.y;
		} else {
			//newPath.segments[i].point.x += value;
			//newPath.segments[i].point.y += value;
		}
		//console.log("noise values for i ", i, xvalue, yvalue);
		//console.log("new point", newPath.segments[i].point);
		
	}
	return newPath;
	
};

////////////////////////////////////////////////////////////////////////

DesignGenerator.prototype.bounceBetweenPaths = function(path1, path2){
	var path = new Path();
	for(var i = 0; i < path1.segments.length; i++){
		path.add(path1.segments[i].point.clone());
		if(i < path2.segments.length){
			path.add(path2.segments[i].point.clone());
		}
	}
	return path;
};


//////////////////////////////////////////////////////////////////////////////
//////////////// RELATIVE... /////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

DesignGenerator.prototype.getRelVectorWithAngle = function(prevPoint, point, nextPoint, angle){
	
	var vect = this.getRelTangentVector(prevPoint, point, nextPoint).rotate(angle);

	return vect;
	
};

DesignGenerator.prototype.getRelTangentVector = function(prevPoint, point, nextPoint){
	var prevVector = new Point(prevPoint.x - point.x, prevPoint.y - point.y);
	var nextVector = new Point(point.x - nextPoint.x, point.y - nextPoint.y);
	
	//global.mainCanvasHandler.drawDebugLine([point,prevPoint], 'red');
	//global.mainCanvasHandler.drawDebugLine([point,nextPoint], 'blue');
	
	prevVector = prevVector.normalize();
	nextVector = nextVector.normalize();
	
	var avgInverse = new Point((prevVector.x + nextVector.x)/2, (prevVector.y + nextVector.y)/2);
	avgInverse = avgInverse.normalize();
	
	if(avgInverse.x == 0 && avgInverse.y == 0){
		avgInverse.x = prevVector.y;
		avgInverse.y = prevVector.x;
	} 
	//console.log("normal with value adjustment", avgInverse);
	
	//var temp = new Point((avgInverse.x * 20) + point.x, (avgInverse.y * 20) + point.y);
	
	//global.mainCanvasHandler.drawDebugLine([point,temp], 'black');
	
	return avgInverse;
};



DesignGenerator.prototype.testRelativeDesign = function(){
	//this.generatePathPoints(this.flattenedPath); // Resets this.pathPoints to the recentPath.
	
	//this.generatePathRelativeToDesignLines(this.scaleYPointPosition( [new Point(.33, 1), new Point(.66, -1)], 50));
};
/*
DesignGenerator.prototype.testAbsSinDesign = function(inputPath, sinSample, pointsDensity){
	//this.generatePathPoints(this.flattenedPath); // Resets this.pathPoints to the recentPath. Need to do this to get the right distance.
	
	var totalDistance = this.calcDistanceOfPathPoints();
	var points = [];
	
	for(var i = 0; i <= totalDistance; i+= pointsDensity){
		if(this.verbose) console.log("Generating point at " + i + ", " + Math.sin(sinSample*i));
		points.push(new Point(i, Math.sin(sinSample*i)));
	}
	
	this.generatePathAbsoluteToDesignLines(this.scaleYPointPosition(points, 10));
};
*/

// INPUT: path points, not a Path
// OUTPUT: path points, not a Path
DesignGenerator.prototype.generatePathRelativeToDesignLines = function(inputPathPoints, newPoints){
	console.log("generatePathRelativeToDesignLines " + newPoints);
	var generatedPathPoints = []; // hopefully we don't need to clean this out!
	
	console.log("inputPathPoints", inputPathPoints);
	console.log("newPoints", newPoints);
	
	// < length -1 because we are always dealing with i and i+1
	for(var i = 0; i < inputPathPoints.length - 1; i++){
		if(i === 0)
			generatedPathPoints = generatedPathPoints.concat(this.segmentToDesignLineRelative(inputPathPoints[i], inputPathPoints[i+1], newPoints, true, false));
		else
			generatedPathPoints = generatedPathPoints.concat(this.segmentToDesignLineRelative(inputPathPoints[i], inputPathPoints[i+1], newPoints, false, false));
	
		console.log("generatedPathPoints of i " + i, generatedPathPoints);
	}
	
	//if(this.verbose) console.log("generatedPathPoints!", generatedPathPoints);
	
	/*
	// Remove any previous lines that have been made/drawn...
	if(this.designPath !== null) {
		this.designPath.remove();
		this.designPath = null;
	}
	this.designPath = new Path(this.generatedPathPoints); // an array of segments
	this.designPath.strokeColor = 'blue';
	this.designPath.opacity = 1;
	
	*/
	console.log("this.designPath complete! ", generatedPathPoints);
	return generatedPathPoints;
};


/////////////////////////////////////////////////////////////////////////
////////////////// ABS Functions ///////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/*

DesignGenerator.prototype.generatePathAbsoluteToDesignLines = function(newPoints){	
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
*/

/////////////////////////////////////////////////////////////////////////
///////////////// Works for both...
////////////////////////////////////////////////////////////////////////////

DesignGenerator.prototype.segmentToDesignLineRelative = function(pt1, pt2, newPoints, incPt1, incPt2){
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
DesignGenerator.prototype.segmentToDesignLineUsingRotation = function(pt1, pt2, newPoints, incPt1, incPt2, absolute){
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

