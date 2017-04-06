
// 10 units in the machine is ~ 1 mm
// The Brother SE-400's space is ~ 100 x 100 mm or 3.9 x 3.9 inches
// The system also has a limit of 32,000 stitches

// 100 x 100 mm = 1000 x 1000 file units
// The 9 file unit test stitches were very small. I am going to set the default to 20 units per stitch
// means 50 stitches

var hoop = {
	//// Grid drawing info
	x:0,
	y:0,
	width:0, // my hoop is a square, so width and height should be the same...
	height:0,
	centerX:0,
	centerY:0,
	
	//// Hoop and starter scale
	unitsPerStitch:30, // 20 units / stitch
	maxNumStitchWidth:0, // Will be calculated to 50
	maxNumStitchHeight:0, // Will be calculated to 50
	fileUnitsWidth: 1000,
	fileUnitsHeight: 1000,
};

var printDesign;

var stPattern;

var findMaxNumHoopStitches = function(){
	hoop.maxNumStitchHeight = hoop.fileUnitsHeight/hoop.unitsPerStitch;
	hoop.maxNumStitchWidth = hoop.fileUnitsWidth/hoop.unitsPerStitch;
};

// The unitsPerStitch may change, resulting in a new hoop dimension to be calculated
// The centerX/centerY may change, resulting in a new set of hoop location calculations
var generateHoopDimensions = function(gridPixelSize){
	findMaxNumHoopStitches();
	
	hoop.width = hoop.maxNumStitchWidth * gridPixelSize;
	hoop.height = hoop.maxNumStitchHeight * gridPixelSize;
	
	hoop.x = hoop.centerX - hoop.width/2;
	hoop.y = hoop.centerY - hoop.height/2;
};

var generatePrintPattern = function(design, gridSpacing){
	/* // Should be replaced by grid.gatherPrintableStitches
	// Remove all lines that would be outside the hoop
	console.log("design starting out with # lines: " + design.lines.length);
	for(var i = 0; i < design.lines.length; i++){
		var line = design.lines[i];
		
		if( line.point1.position.x * gridSpacing < hoop.x || line.point1.position.x * gridSpacing > hoop.x + hoop.width || 
			line.point2.position.x * gridSpacing < hoop.x || line.point2.position.x * gridSpacing > hoop.x + hoop.width || 
			line.point1.position.y * gridSpacing < hoop.y || line.point1.position.x * gridSpacing > hoop.y + hoop.height || 
			line.point2.position.y * gridSpacing < hoop.y || line.point2.position.x * gridSpacing > hoop.y + hoop.height){
				console.log("trying to remove line " + line.id);
				design.removeLine(line.id); 
		}
	}
	
	console.log("design AFTER TRIM # lines: " + design.lines.length);
	//console.log(design.lines);
	*/
	
	// ALRIGHT. Now to turn it into a pattern...
	// We have a bunch of widely offset stitches with unscaled units...
	// Translate them so that the zero is in the center of the design, instead of the upper left canvas corner
	design.updateDimensions();
	console.log("design dimensions", design.smallestX, design.smallestY, design.width, design.height);

	var centerX = design.smallestX + Math.floor(design.width/2);
	var centerY = design.smallestY + Math.floor(design.height/2);
	design.translateTheseLines(-centerX, -centerY);
	design.updateDimensions();
	
	console.log("new design dimensions", design.smallestX, design.smallestY, design.width, design.height);
	
	// We need to do a DFS of the pattern (looking for shallow depths first, if that is possible...?)
	var processedPoints = design.findDFSPoints();
	console.log("processedPoints", processedPoints);
	// Add the stitches sequentially to the pattern with new units
	stPattern = new Pattern();
	var openPoints = [];
	var pop = false;
	var flags = stitchTypes.normal;
	
	for(var i = 0; i < processedPoints.length; i++){
		var item = processedPoints[i];
		if(item.id){
			// This is a vertex. add it after doing possible past computation
			if(pop === true){
				// This vertex could be connected to any previous openPoints. 
				// We need to find which one and backtrack to it
				// Then cut all the popped points out of openPoints
				var results = findPathToSharedParent(item, openPoints);
				// Backtrack
				flags = stitchTypes.normal;
				console.log("stitching pop path of length " + results.path.length);
				for(var j = 0; j < results.path.length; j++){	
					fillInStitchGapsAndAddStitchAbs(hoop.unitsPerStitch, results.path[j].position.x, results.path[j].position.y, flags, true);
					console.log("      pop.making stitch... " + results.path[j].position.x + ", " + results.path[j].position.y);
				}
				// Pop the COMPLETELY FINISHED (yay) openPoints
				//console.log("old openPoints had # " + openPoints.length);
				openPoints = openPoints.slice(0, -results.numToPop);
				//console.log("new openPoints has # " + openPoints.length);
				pop = false;
			}
			// Previous data may have set the flags to jump/trim
			if(flags === stitchTypes.trim) {
				console.log("   ..trimming");
				stPattern.addStitchRel(0, 0, flags, true);
			}
			
			flags = stitchTypes.normal;
			fillInStitchGapsAndAddStitchAbs(hoop.unitsPerStitch, item.position.x, item.position.y, flags, true);
			console.log("      making stitch... " + item.position.x + ", " + item.position.y);
			openPoints.push(item);
			flags = 0;
		} else {
			// This is a string telling us some valuable info!
			// Either: loop:#->#, pop.noConnections:#, pop.alreadyVisitedVertex:#, or jump
			var tokens = item.split(":");
			if(tokens[0] === "jump"){
				// Do I want to trim? Or Jump? I dunno, let's try trim for now.
				flags = stitchTypes.trim;
				
				// Clear out pending pops and open points, we're not going to need them anymore
				// now that we're onto a new section of the design
				// (jumps should always come after pops, because we finish stitching a connected graph)
				// So this overrides the backtracking flags
				openPoints = [];
				pop = false;
			} else if (tokens[0] === "loop") {
				var loopSts = tokens[1].split("->");
				var tar, ret;
				// Find the stitches... although the return stitch should be the last one in the openPoints,
				// The target could be anywhere
				for(var j = 0; j < openPoints.length; j++){
					if(openPoints[j].id === loopSts[0]) ret = openPoints[j];
					if(openPoints[j].id === loopSts[1]) tar = openPoints[j];
				}
				console.log("processing loop:" + tokens[1]);
				// Make a normal stitch to the loop target, then back to its origin
				flags = 0; 
				flags |= stitchTypes.normal;
				fillInStitchGapsAndAddStitchAbs(hoop.unitsPerStitch, tar.position.x, tar.position.y, flags, true);
				console.log("      tar.making stitch... " + tar.position.x + ", " + tar.position.y);
				
				// DO A LOOK-AHEAD
				// If there is a jump before another stitch, or no other stitch, do not backtrack
				var seenStitch = false;
				var seenJump = false;
				for(var j = i+1; j < processedPoints.length; j++){
					if(!seenStitch && !seenJump){
						// If we see a stitch, we're not done. No need to check anything else
						if(processedPoints[j].id){
							console.log("we have seen another stitch after the loop");
							seenStitch = true;
						// If we see a jump, we're done with this section. No need to backtrack.
						} else if(processedPoints[j].indexOf("jump") > 0) {
							console.log("we have seen a jump after the loop");
							seenJump = true;
						}
					}
				}
				// If we have not seen a jump and seen another stitch, we may backtrack our stitch in preparation
				if(!seenJump && seenStitch){
					console.log("NO jump and SEEN STITCH, so we will backtrack our loop");
					fillInStitchGapsAndAddStitchAbs(hoop.unitsPerStitch, ret.position.x, ret.position.y, flags, true);
					console.log("      ret.making stitch... " + ret.position.x + ", " + ret.position.y);
				} else {
					console.log("We have seen a jump or no further stitches. No return will be attempted");
				}
				
				
			} else if (tokens[0] === "pop.noConnections" || tokens[0] === "pop.alreadyVisitedVertex"){
				pop = true;
				// The next stitch will figure out how to go backwards IF it's necessary
			} else {
				console.log("ERROR: something wrong in the design? " + tokens[0]);
			}
		}
	}
	
	//if(stPattern.stitches.length > 0){
	//	var lastStitch = stPattern.stitches[stPattern.stitches.length-1];
	//	stPattern.addStitchRel(lastStitch.x, lastStitch.y, stitchTypes.end, true);
	//} else {
		stPattern.addStitchRel(0, 0, stitchTypes.end, true);
	//}

	console.log("pattern stitches!: " + stPattern.stringifyStitches());
	
	// Scale up // NOTE: Simple scaling does not work. Can too easily make a jump too long (>121)
	stPattern.scale(hoop.unitsPerStitch);
	console.log("pattern post-scale!: " + stPattern.stringifyStitches());
	
	// Flip them vertically, because the sewing will be upside-down
	stPattern.invertPatternVertical();
	console.log("pattern post-invert!: " + stPattern.stringifyStitches());
	
	// Turn abs stitches into relative ones
	stPattern.transformToRelStitches();
	
	
	// And print!
	var rando = Math.floor(Math.random() * 100000);
	console.log(rando);
	dstWrite("bw" + rando + ".dst", stPattern);
	
	console.log("Saved file to bw" + rando + ".dst");
	
	// LET THE MANGLING COMENCE
	// transform the pattern back
	stPattern.stitches = [];
	for(var i = 0; i < stPattern.oldAbsStitches.length; i++){
		stPattern.stitches.push(stPattern.oldAbsStitches[i]);	
	}
	console.log("reviving old stitches" + stPattern.stringifyStitches());
	stPattern.invertPatternVertical();
	console.log("inverting" + stPattern.stringifyStitches());
	
	//stPattern.translate(hoop.centerX, hoop.centerY);
	console.log("translating? " + hoop.centerX + ", " + hoop.centerY);
	console.log(stPattern.stitches);
	
};

var findPathToSharedParent = function(nextPt, openPoints){
	// nextPt is the point we're looking for that has a shared parent
	// openPoints are the points we've previously stitched.
	// the LAST point in openPoints is where we are. (currPt)
	// We need to return a path from that last point to the point where nextPt
	// has a shared parent
	
	var results = {
		path: [],
		numToPop: 0
	};
	
	var currPt = openPoints[openPoints.length-1];
	
	for(var i = openPoints.length -2; i >= 0; i--){
		if(openPoints[i].id === currPt.DFSParent){
			// We have found one step up the ladder! Yay!
			results.path.push(openPoints[i]);
			results.numToPop++;
			// Pop up to that point
			currPt = openPoints[i];
			// Have we found the end? If so, stop!
			if(currPt.id === nextPt.DFSParent) {
				console.log("found shared parent, backtracking complete", results);
				return results;
			}
			// If not, keep popping until you find it
		} else {
			console.log("uh... found a point not on the path? I guess pop it and keep looking? " + openPoints[i].id + " at i " + i);
			results.numToPop++;
		}
	}
		
	console.log(" WE SHOULD HAVE RETURNED BY NOW! SOMETHING IS WRONG!!! ", results);
	return results;
};

// Note: 121 is the magic limit on the range of DST stitches
// That's why this math is for generateDST
var fillInStitchGapsAndAddStitchAbs = function(scale, x, y, flags, color){
	var tempX = x;//*scale;
	var tempY = y;//*scale;
	
	console.log("____ calling fillInStitchGraphAndAddStitchAbs: " + scale + ", " + x + ", " + y + ", " + flags + ", " + color);
	
	if(stPattern.stitches.length === 0){
		stPattern.addStitchAbs(0, 0, stitchTypes.jump, color);
		fillInStitchGapsAndAddStitchAbs(scale, x, y, stitchTypes.jump, color);
	} 

	var lastStitch = stPattern.stitches[stPattern.stitches.length-1];
	var newX = 0;
	var newY = 0;
	
	var xDiff = (x - lastStitch.x)*scale;
	var yDiff = (y - lastStitch.y)*scale;
	var count = 0; // Just in case!
	
	console.log("__Diffs: " + xDiff + ", " + yDiff);
	
	while((xDiff > 121 || xDiff < -121 || yDiff > 121 || yDiff < -121) && count < 1000){
		
		if(xDiff > 121){
			newX = 121;
			xDiff -= 121;
		} else if (xDiff < -121) { 
			newX = -121;
			xDiff += 121;
		}
		
		if(yDiff > 121){
			newY = 121;
			yDiff -= 121;
		} else if (yDiff < -121) { 
			newY = -121;
			yDiff += 121;
		}
		
		console.log("adding intermediate relative stitch +/-: " + newX + ", " + newY);
		stPattern.addStitchRel(newX/scale, newY/scale, stitchTypes.jump, color); 
		
		count++;
	}
	if(count > 0) console.log("last stitch is " + xDiff + ", " + yDiff + " away from the last stitch");

	stPattern.addStitchAbs(tempX, tempY, flags, color);
};


