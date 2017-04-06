var createPosition = function(){
	var position = {
		x: 1,
		y: 1
	};
	return position;
};

var copyPosition = function(position){
	var newPosition = createPosition();
	newPosition.x = position.x;
	newPosition.y = position.y;
	return newPosition;
};

var createPoint = function(){
	var point = {
		id: null,
		findID: function(){
			var id = "";
			id += point.position.x;
			id += point.position.y;
			point.id = id;
		},
		update: function(){
			point.findID();
		},
		parent: null,
		position: createPosition(),
		// Point and Line connections
		//0: null, // Up
		//1: null, // Up-right
		//2: null, // Right
		//3: null, // Down-right
		//4: null, // Down
		//5: null, // Down-left
		//6: null, // Left
		//7: null, // Up-left
		// Reflexive Pairs: 0-4, 1-5, 2-6, 3-7
		adjLines: [null, null, null, null, null, null, null, null],
		adjPoints: [null, null, null, null, null, null, null, null],
		foundBalance: [false, false, false, false, false, false, false, false],
		
		// unordered
		lines: [],
		points: [],
		
		// Scoring for grammar! 0-1 scale.
		densityScore:-1,
		balanceScore:-1,
		// There are 4 directions of balance, 12 major types of recombinations
				// 4 line-based (across) --
				// 12 pairs that skip an adj number >
				// 12 triplets that are the previous 12 with a stem that bisects them ->
				// 12 triplets that are the same as the last with the bisect that stretches outward >-
				
		// NOT on a scale of 0-1.
		// Instead of finding every combination of lines, we count instances of pair or triplet balance found
			// This does multi-count, for example > amd >- are separate counts. This is the only metric that captures it.
		detailedBalanceScore: -1, 
		balanceTypes:[], // The line of reflection in the balance: vert, hori, pDiag, nDiag. Same values as line direction.
		scorePointBalance: function(){
			// The score here determines "How many of the point's lines participate in some form of balance"
			// Each line found is 1/8
			point.balanceScore = 0;
			point.detailedBalanceScore = 0;
			point.balanceTypes = []; // Empty out previous balance types if they exist
			point.foundBalance = [false, false, false, false, false, false, false, false];
			//console.log("~~~ Checking balance of point " + point.id + " ~~~");
			
			// Check that there is more than 1 line to test for balance.
			if(point.lines.length > 1){
				// Check for the simplest: -- | / \ directly across
				for(var i = 0; i < 4; i++){
					//console.log(i + " what is my across ID? " + (i+4));
					//console.log(point.adjLines[i]);
					//console.log(point.adjLines[i+4]);
					if(point.adjLines[i] !== null && point.adjLines[i+4] !== null){
						// We found a pair! Its direction is either of the two points
						//console.log("We found a straight pair! " + i + ", " + (i+4));
						point.foundBalance[i] = true;
						point.foundBalance[i+4] = true;
						point.detailedBalanceScore++;
						if(!$.inArray(point.adjLines[i].direction, point.balanceTypes)) {
							point.balanceTypes.push(point.adjLines[i].direction);
							//console.log("Found balance for point " + point.id + " of direction " + point.adjLines[i].direction);
						}
					}
				}
				
				// Look at every line. Work clockwise so that we don't get repeats.
				for(var i = 0; i < 8; i++){
					var pair90 = (i+2)%8;
					//console.log(i + " what is my pair90 ID?: " + pair90);
					//console.log(point.adjLines);
					//console.log(point.adjLines[i]);
					//console.log(point.adjLines[pair90]);
					
					if(point.adjLines[i] !== null && point.adjLines[pair90] !== null){
						//console.log("Found a 90Degree balance " + i + ", " + pair90);
						point.foundBalance[i] = true;
						point.foundBalance[pair90] = true;
						point.detailedBalanceScore++;
						var balanceType = "";
						if(point.adjLines[i].direction === "hori") balanceType = "nDiag";
						else if(point.adjLines[i].direction === "nDiag") balanceType = "vert";
						else if(point.adjLines[i].direction === "vert") balanceType = "pDiag";
						else balanceType = "hori";
						if(!$.inArray(balanceType, point.balanceTypes)) {
							point.balanceTypes.push(balanceType);
							//console.log("Found balance for point " + point.id + " of direction " + balanceType);
						}
						
						// Now for extra calculation for triplets in the detailedBalanceScore
						// Note: these directions were already found, so we don't need to add them to balanceTypes again.
						var innerBisect = (i+1)%8;
						var outerBisect = (i+5)%8;
						if(point.adjLines[innerBisect] !== null){
							//console.log("found an innerBisect at " + innerBisect);
							point.foundBalance[innerBisect] = true;
							point.detailedBalanceScore++;
						}
						if(point.adjLines[outerBisect] !== null){
							//console.log("found an outerBisect at " + outerBisect);
							point.foundBalance[outerBisect] = true;
							point.detailedBalanceScore++;
						}
					}
					
				}
				
				// Tally the final simple bisect count
				for(var i = 0; i < point.foundBalance.length; i++){
					if(point.foundBalance[i] === true) point.balanceScore += 1/8;
				}
				//console.log("FINAL SCORES FOUND FOR POINT " + point.id + ": " + point.balanceScore + ", " + point.detailedBalanceScore);
			}
		},
		
		scoreDensity: function(){
			// For each adj line/point, add 1/8
			point.densityScore = 0;
			for(var i = 0; i < point.lines.length; i++){
				point.densityScore += 1/8;
			}
		},
		
		findPointAtOtherEndOfLine: function(line){
			for(i = 0; i < point.lines.length; i++){
				if(point.lines[i].id === line.id){
					// Figure out if this point is point 1 or 2 and return the other one
					if(point.lines[i].point1.id === point.id){
						// this is point 1. Send back point 2
						return point.lines[i].point2;
					} else {
						// this is point 2. Send back point 1
						return point.lines[i].point1;
					}
				}
			}
			// This line isn't attached!
			console.log("This point " + point.id + " is not a part of line " + line.id);
			return null;
		}
	};
	
	return point;
};

// NOTE: BE CAREFUL WITH THIS COPY! There should never be copies of points (or lines) in the design
// Everything with balance will be re-calculated by the owner of this copy (the grammar) once it manipulates it
var copyPoint = function(point){
	var newPoint = createPoint();
	newPoint.position = copyPosition(point.position);
	for(var i = 0; i < 8; i++){
		if(point.adjLines[i] !== null) newPoint.adjLines[i] = point.adjLines[i];
		if(point.adjPoints[i] !== null) newPoint.adjPoints[i] = point.adjPoints[i];
	}
	for(var i = 0; i < point.lines.length; i++){
		newPoint.lines.push(point.lines[i]);
	}
	for(var i = 0; i < point.points.length; i++){
		newPoint.points.push(point.points[i]);
	}
	newPoint.update();
	newPoint.id += +"_COPY";
	return newPoint;
};

var createLine = function(){
	var line = {
		id: null,
		findID: function(){
			var id = "";
			id += line.point1.position.x;
			id += line.point1.position.y;
			id += line.point2.position.x;
			id += line.point2.position.y;
			line.id = id;
		},
		update: function(){
			// Points have been changed? Re-calculate line info
			line.findDirection(); // This also finds the point orientation
			line.findID();
		},
		parent: null,
		point1: createPoint(),
		point2: createPoint(),
		direction: "NA",
		topOrRightPoint: null,
		bottomOrLeftPoint: null,
		findDirection: function(){
			// Determines if the line is horizontal, vertical, posDiag, or 
			// negDiag based on the x/y positions of its points
			var pt1AdjNum = -1;
			var pt2AdjNum = -1;
			// for shortness' sake
			var point1 = line.point1;
			var point2 = line.point2;
			if(point1.position.x === point2.position.x){
				// Vertical
				line.direction = "vert";
				if(point1.position.y < point2.position.y){
					// point 1 is on TOP, so its line and point are DOWN (4)
					pt1AdjNum = 4;
					pt2AdjNum = 0;
					//point1.adjLines[4] = line;
					//point1.adjPoints[4] = point2;
					//point2.adjLines[0] = line;
					//point2.adjPoints[0] = point1;
				} else {
					// point 2 is on top
					pt1AdjNum = 0;
					pt2AdjNum = 4;
				}
			} else if(point1.position.y === point2.position.y){
				// Horizontal
				line.direction = "hori";
				if(point1.position.x > point2.position.x){
					// point 1 is to the RIGHT, so its line and point are to the LEFT (6)
					pt1AdjNum = 6;
					pt2AdjNum = 2;
				} else {
					// point 2 is to the right
					pt1AdjNum = 2;
					pt2AdjNum = 6;
				}
			} else {
				// Diagonal of some form
				var top;
				var right;
				if(point1.position.y < point2.position.y) top = 1;
				else top = 2;
				if(point1.position.x > point2.position.x) right = 1;
				else right = 2;
				
				if(top === right){
					line.direction = "pDiag";
					if(top === 1){
						// point 1 is to the UP-RIGHT, so its line and point are to the down-left (5)
						pt1AdjNum = 5;
						pt2AdjNum = 1;
					} else {
						// point 2 is to the UP-RIGHT, so its line and point are to the down-left (5)
						pt1AdjNum = 1;
						pt2AdjNum = 5;
					}
				} else {
					line.direction = "nDiag";
					if(top === 1){
						// point 1 is to the UP-LEFT, so its line and point are to the down-right (3)
						pt1AdjNum = 3;
						pt2AdjNum = 7;
					} else {
						pt1AdjNum = 7;
						pt2AdjNum = 3;
					}
				}
			}
			
			// finally make the link
			// Note: the adjNums should never be -1 unless the points are on top of each other
			// Which should also never happen because we check if the points exist when making the line!
			point1.adjLines[pt1AdjNum] = line;
			point1.adjPoints[pt1AdjNum] = point2;
			point2.adjLines[pt2AdjNum] = line;
			point2.adjPoints[pt2AdjNum] = point1;
			
			line.findPointOrientation(1, pt1AdjNum);
		},
		
		// NOTE: currently only uses point === 1 because it would be redundant copy-paste code to do it for point === 2.
		// If you ever plan to use it for point === 2, make that part of the function!
		findPointOrientation: function(point, adjNum){
			//console.log("Checking point orientation: " + point + ", " + adjNum);
			// Upper/right half of the map
			if(point === 1){
				if(adjNum === 7 || adjNum === 0 || adjNum === 1 || adjNum === 2){
					// Point 1 is dominant	
					line.topOrRightPoint = line.point1;
					line.bottomOrLeftPoint = line.point2;
					//console.log("point1 dominant");
				} else {
					// point 2 is dominant
					line.topOrRightPoint = line.point2;
					line.bottomOrLeftPoint = line.point1;
					//console.log("point2 dominant");
				}
			}  else {
				console.log("ERRROR: Don't call findPointOrientation with point !== 1 until you implement this part");
			}
			 
		},
		
		removeMe: function(){
			var parentDesign = allDesigns[line.parent];
			// For start and end points:
				// Does this point connect to any other points?
				//		If so, disconnect the line and leave the point
				//		If not, remove the point
			// Remove line
			
		}
	};
	
	return line;
};

var designCount = 0;
var allDesigns = [];

var createDesign = function(){
	var design = {
		absoluteRoot: createPosition(),
		width: 10,
		height: 10,
		greatestX: -9999, 
		smallestX: 9999, 
		greatestY: -9999,
		smallestY: 9999,
		id: designCount,
		
		resetDimensionMarkers : function(){
			design.greatestX= -9999;
			design.smallestX= 9999;
			design.greatestY= -9999;
			design.smallestY= 9999;
		},
		updateDimensions : function(){
			design.resetDimensionMarkers();
			for(var i = 0; i < design.points.length; i++){
				if(design.points[i].position.x > design.greatestX) design.greatestX = design.points[i].position.x;
				if(design.points[i].position.x < design.smallestX) design.smallestX = design.points[i].position.x;
				
				if(design.points[i].position.y > design.greatestY) design.greatestY = design.points[i].position.y;
				if(design.points[i].position.y < design.smallestY) design.smallestY = design.points[i].position.y;
			}
			
			design.width = design.greatestX - design.smallestX;
			design.height = design.greatestY - design.smallestY;
			
			if(design.width === 0) design.width = 1;
			if(design.height === 0) design.height = 1;
			
			//console.log("design dimentions: " + design.smallestX + ", " + design.smallestY + " /// " +
			//								  + design.greatestX + ", " + design.greatestY + " /// " +
			//									design.width + " by " + design.height);
		},
		changeRoot: function(x, y){
			// moves all points in the design by x and y amounts to keep the root
			// at the upper left corner
		},
		// Design contents
		points: [],
		lines: [],
		addPoint : function(x, y){
			// does the point exist?
			
			// if not, make it!
			var pt = createPoint();
			pt.position.x = x;
			pt.position.y = y;
			design.points.push(pt);
			return pt;
		},
		removePoint : function(name){
			// Can only remove a point if all lines connected to it
			// have also been removed
			for(var i = 0; i < design.points.length; i ++){
				if(design.points[i].id === name){
					console.log("DESIGN " + design.id + " owns the point " + name);
					console.log(design.points[i].lines);
					if(design.points[i].lines.length > 0){
						console.log("POINT " + name + " has connected lines: Cannot remove.");
						return false;
					} else {
					
						// Remove point
						if(design.points.length === 1){
							console.log("THE DESIGN CANNOT BE EMPTY! LEAVE THIS LAST POINT!");
							return false;
						} else {
							design.points.splice(i, 1);
							return true;
						}
					}
				}
			}
			console.log("POINT " + name + " not found in design " + design.id);
			return false;
		},
		
		// like "doesPointExist" except it returns the object too
		getPointAtPosition: function(x, y){
			var pointString = "" + x + y;
			for(var i = 0; i < design.points.length; i++){
				if(design.points[i].position.x === x && design.points[i].position.y === y) {
				//if(design.points[i].id === pointString){
					//console.log("GOT POINT AT POSITION " + x + ", " + y);
					return design.points[i];
				}
			}
			return null;
		},
		
		//If this is a diagonal line, does a diagonal line exist that crosses it?
		doesCrossLineExist: function(x1, y1, x2, y2){
			if(x1 === x2 || y1 === y2) return false; // These are horizontal/vertical lines
			
			var newy1;
			var newy2;
			
			if(y1 > y2){
				newy1 = y1 - 1; // Lower y1
				newy2 = y2 + 1; // Raise y2
			} else if (y2 > y1){
				newy1 = y1 + 1; // Raise y1
				newy2 = y2 - 1; // Lower y2
			}
			if(design.doesLineExist(x1, newy1, x2, newy2)){
				//console.log("FOUND CROSS LINE AT " + x1 + ", " + newy1 + ", " + x2 + ", " + newy2);
				return true;
			}
			return false;
		},
		
		doesLineExist : function(x1, y1, x2, y2){
			//var matchedPt1 = false;
			//var matchedPt2 = false;
			var lineString1 = "" + x1 + y1 + x2 + y2;
			var lineString2 = "" + x2 + y2 + x1 + y1;
			//console.log("checking lines " + lineString1 + " and " + lineString2);
			for (var i = 0; i < design.lines.length; i++){
				// NOTE: Checking the id, because it is faster and easier to code
				// If at all this fails, check that the IDs are properly being set/created
				if(design.lines[i].id === lineString1 || design.lines[i].id === lineString2){
					return true;
				}
			}
			
			return false;
		},
		lastAddedLine : null,
		addLine : function(x1, y1, x2, y2){
			// does the line, or its reverse, exist?
			// Check existing lines matching x1,y1,x2,y2 or x2,y2,x1,y1
			var lineExist = design.doesLineExist(x1, y1, x2, y2);
			//console.log("Does this line exist? " + lineExist);
			// ..........................................................
			// Also check: Do we have the same start and end point? That's not a line!
			if(!lineExist && !(x1 === x2 && y1 === y2)){
				var newLine = createLine();
				// For start and end points:
				var pt1ID = null;
				var pt2ID = null;
				for(var i = 0; i < design.points.length; i++){
					if(design.points[i].position.x === x1 && design.points[i].position.y === y1) pt1ID = i;
					if(design.points[i].position.x === x2 && design.points[i].position.y === y2) pt2ID = i;
				}
					// Does this point exist? 
					//		If so, add it to this line
				if(pt1ID !== null){
					newLine.point1 = design.points[pt1ID];
				} else {
					// 		If not, create the point and add it to the line
					newLine.point1 = design.addPoint(x1, y1);
				}
				if(pt2ID !== null){
					newLine.point2 = design.points[pt2ID];
				} else {
					newLine.point2 = design.addPoint(x2, y2);
				}
					
				// Figure out its direction and where it belongs in relation to the points
				newLine.point1.lines.push(newLine);
				newLine.point2.lines.push(newLine);
				newLine.point1.update();
				newLine.point2.update();
				newLine.update();
				newLine.point1.parent = newLine.point2.parent = newLine.parent = design.id;
				// Add line to the design
				design.lines.push(newLine);
				design.lastAddedLine = newLine;
				return true;
			} else {
				console.log("NOPE! Not making that " + x1 + y1 + x2 + y2 + " line. It already exists.");
				return false;
			}
		},
		
		addAllLines : function(newLines){
			console.log("adding " + newLines.length + " new lines to the design");
			for(var i = 0; i < newLines.length; i++){
				design.addLine(newLines[i].point1.position.x, newLines[i].point1.position.y, 
							   newLines[i].point2.position.x, newLines[i].point2.position.y);
			}
		},
		removeLine : function(name) {
			for(var i = 0; i < design.lines.length; i ++){
				if(design.lines[i].id === name){
					//console.log("DESIGN " + design.id + " owns the line " + name);
					var line = design.lines[i];
					//console.log(line);
					// For start and end points:
					// Does this point connect to any other points?
					var idToDelete = -1;
					var found = false;
					// Scrub point 1's lists of this line and its connections
					// POINT 1: LINES ///////////////////////////////////////////////////////////
					for(var j = 0; j < line.point1.lines.length; j++){
						if(!found && line.point1.lines[j].id === name) {
							idToDelete = j;
							found = true;
						}
					}
					if(found){
						//console.log("p1 phase 1 deleting ID: "  + idToDelete);
						//console.log(line.point1.lines + " with length " + line.point1.lines.length);
						line.point1.lines.splice(idToDelete, 1);
						//console.log(line.point1.lines + " with length " + line.point1.lines.length);
					}
					// POINT 1: POINTS ///////////////////////////////////////////////////////////

					found = false;
					for(var j = 0; j < line.point1.points.length; j++){
						if(!found && line.point1.points[j].id === line.point2.id){
							idToDelete = j;
							found = true;
						} 
					}
					if(found){
						//console.log("p1 phase 2 deleting ID: "  + idToDelete);
						//console.log(line.point1.points + " with length " + line.point1.points.length);
						line.point1.points.splice(idToDelete, 1);
						//console.log(line.point1.points + " with length " + line.point1.points.length);
					}

					// POINT 1: ADJLINES ///////////////////////////////////////////////////////////
					found = false;
					for(var j = 0; j < line.point1.adjLines.length; j++){
						if(!found && line.point1.adjLines[j] !== null && line.point1.adjLines[j].id === name){
							idToDelete = j;
							found = true;
						}
					}
					if(found){
						//console.log("p1 phase 3 deleting ID: "  + idToDelete);
						//console.log("adjLines " + line.point1.adjLines);
						line.point1.adjLines[idToDelete] = null;
						//console.log("adjLines " + line.point1.adjLines);
					}
					// POINT 1: ADJPOINTS ///////////////////////////////////////////////////////////
					found = false;
					for(var j = 0; j < line.point1.adjPoints.length; j++){
						if(!found && line.point1.adjPoints[j] !== null && line.point1.adjPoints[j].id === line.point2.id) {
							idToDelete = j;
							found = true;
						}
					}
					if(found){
						//console.log("p1 phase 4 deleting ID: "  + idToDelete);
						//console.log("adjPoints " + line.point1.adjPoints);
						line.point1.adjPoints[idToDelete] = null;
						//console.log("adjPoints " + line.point1.adjPoints);
					}
					
					// Do the same for point 2's /////////////////////////////////////////////////
					// POINT 2: LINES ///////////////////////////////////////////////////////////
					found = false;
					for(var j = 0; j < line.point2.lines.length; j++){
						if(!found && line.point2.lines[j].id === name) {
							idToDelete = j;
							found = true;
						}
					}
					if(found){
						//console.log("p2 phase 1 deleting ID: "  + idToDelete);
						//console.log(line.point2.lines + " with length " + line.point2.lines.length);
						line.point2.lines.splice(idToDelete, 1);
						//console.log(line.point2.lines + " with length " + line.point2.lines.length);
					}
					// POINT 1: POINTS ///////////////////////////////////////////////////////////

					found = false;
					for(var j = 0; j < line.point2.points.length; j++){
						if(!found && line.point2.points[j].id === line.point1.id){
							idToDelete = j;
							found = true;
						} 
					}
					if(found){
						//console.log("p2 phase 2 deleting ID: "  + idToDelete);
						//console.log(line.point2.points + " with length " + line.point2.points.length);
						line.point2.points.splice(idToDelete, 1);
						//console.log(line.point2.points + " with length " + line.point2.points.length);
					}

					// POINT 1: ADJLINES ///////////////////////////////////////////////////////////
					found = false;
					for(var j = 0; j < line.point2.adjLines.length; j++){
						if(!found && line.point2.adjLines[j] !== null && line.point2.adjLines[j].id === name){
							idToDelete = j;
							found = true;
						}
					}
					if(found){
						//console.log("p2 phase 3 deleting ID: "  + idToDelete);
						//console.log("adjLines " + line.point2.adjLines);
						line.point2.adjLines[idToDelete] = null;
						//console.log("adjLines " + line.point2.adjLines);
					}
					// POINT 1: ADJPOINTS ///////////////////////////////////////////////////////////
					found = false;
					for(var j = 0; j < line.point2.adjPoints.length; j++){
						if(!found && line.point2.adjPoints[j] !== null && line.point2.adjPoints[j].id === line.point1.id) {
							idToDelete = j;
							found = true;
						}
					}
					if(found){
						//console.log("p2 phase 4 deleting ID: "  + idToDelete);
						//console.log("adjPoints " + line.point2.adjPoints);
						line.point2.adjPoints[idToDelete] = null;
						//console.log("adjPoints " + line.point2.adjPoints);
					}
					
					design.removePoint(design.lines[i].point1.id);
					design.removePoint(design.lines[i].point2.id);
					
					// Remove line
					design.lines.splice(i, 1);
					//console.log("REMOVAL PROCESS COMPLETE");
					console.log(design);
					return true;
				}
			}
			console.log("LINE " + name + " not found in design " + design.id);
			return false;
		},
		
		reflectPoints: function(direction, value) {
			var newLines = [];
			
			if(direction === "x"){
				// Looks like |
				// Expected: value of x=? line to be reflected upon
				for(var i = 0; i < design.lines.length; i++){
					var dist1 = value - design.lines[i].point1.position.x;
					var dist2 = value - design.lines[i].point2.position.x;
					//console.log("dist 1/2: " + dist1 + ", " + dist2);
					var line = createLine();
					line.point1 = createPoint();
					line.point1.position.x = design.lines[i].point1.position.x + (dist1*2);
					line.point1.position.y = design.lines[i].point1.position.y;
					line.point2 = createPoint();
					line.point2.position.x = design.lines[i].point2.position.x + (dist2*2);
					line.point2.position.y = design.lines[i].point2.position.y;
					newLines.push(line);
				}
			} else if (direction === "y"){
				// Looks like -
				// Expected: value of y=? line to be reflected upon
				for(var i = 0; i < design.lines.length; i++){
					var dist1 = value - design.lines[i].point1.position.y;
					var dist2 = value - design.lines[i].point2.position.y;
					console.log("ydist 1/2: " + dist1 + ", " + dist2);
					var line = createLine();
					line.point1 = createPoint();
					line.point1.position.x = design.lines[i].point1.position.x;
					line.point1.position.y = design.lines[i].point1.position.y + (dist1*2);
					line.point2 = createPoint();
					line.point2.position.x = design.lines[i].point2.position.x;
					line.point2.position.y = design.lines[i].point2.position.y + (dist2*2);
					newLines.push(line);
				}
			} else if (direction === "pDiag"){
				// IE looks like /
			} else if (direction === "nDiag"){
				// IE looks like \
			} else {
				console.log("invalid direction: use 'x' 'y' 'pDiag' or 'nDiag'");
			}
			
			return newLines;
		},
		
		reflectArbitraryLines: function(a, c, x){
			var newLines = [];
			// For arbitrary line y = ax+c
			// for horizontal line y=? a = 0, c = the offset
			// for x=?, a and c are null and you use the x value instead.
			
			if(a === null && c === null){
				// Looks like |
				// Expected: value of x=? line to be reflected upon
				for(var i = 0; i < design.lines.length; i++){
					var dist1 = x - design.lines[i].point1.position.x;
					var dist2 = x - design.lines[i].point2.position.x;
					//console.log("dist 1/2: " + dist1 + ", " + dist2);
					var line = createLine();
					line.point1 = createPoint();
					line.point1.position.x = design.lines[i].point1.position.x + (dist1*2);
					line.point1.position.y = design.lines[i].point1.position.y;
					line.point2 = createPoint();
					line.point2.position.x = design.lines[i].point2.position.x + (dist2*2);
					line.point2.position.y = design.lines[i].point2.position.y;
					newLines.push(line);
				}
			} else {
				for(var i = 0; i < design.lines.length; i++){
					// (x + (y - c) * a)/(1+ (a*a))
					var dist1 = (design.lines[i].point1.position.x + (design.lines[i].point1.position.y - c) * a) / (1 + (a * a));
					var dist2 = (design.lines[i].point2.position.x + (design.lines[i].point2.position.y - c) * a) / (1 + (a * a));
					console.log("dist 1/2: " + dist1 + ", " + dist2);
					var line = createLine();
					line.point1 = createPoint();
					line.point1.position.x = 2*dist1 - design.lines[i].point1.position.x;
					line.point1.position.y = 2*dist1*a - design.lines[i].point1.position.y + 2 * c;
					line.point2 = createPoint();
					line.point2.position.x = 2*dist2 - design.lines[i].point2.position.x;
					line.point2.position.y = 2*dist2*a - design.lines[i].point2.position.y + 2 * c;
					newLines.push(line);
				}
			}
			
			return newLines;
		},
		roundNumber : function(num){
			if(num !== Math.floor(num) || num !== Math.ceil(num)){
				console.log("rounding num " + num);
				// Round the number
				if(num > Math.floor(num) + .5) return Math.ceil(num);
				else return Math.floor(num);
			}
			return num;
		},
		rotateAroundArbitraryPoint: function(cx, cy, angle){
			var newLines = [];
			
			for(var i = 0; i < design.lines.length; i++){
				
				var line = createLine();
				line.point1 = createPoint();
				line.point2 = createPoint();
				
				var s = Math.sin(angle);
				var c = Math.cos(angle);
				
				// translate to origin
				line.point1.position.x = design.lines[i].point1.position.x - cx;
				line.point1.position.y = design.lines[i].point1.position.y - cy;
				line.point2.position.x = design.lines[i].point2.position.x - cx;
				line.point2.position.y = design.lines[i].point2.position.y - cy;
				
				// rotate point
				var xnew1 = line.point1.position.x * c - line.point1.position.y * s;
				var ynew1 = line.point1.position.x * s + line.point1.position.y * c;
				var xnew2 = line.point2.position.x * c - line.point2.position.y * s;
				var ynew2 = line.point2.position.x * s + line.point2.position.y * c;
				
				// traslate point back
				line.point1.position.x = design.roundNumber(xnew1 + cx);
				line.point1.position.y = design.roundNumber(ynew1 + cy);
				line.point2.position.x = design.roundNumber(xnew2 + cx);
				line.point2.position.y = design.roundNumber(ynew2 + cy);

				newLines.push(line);
				
			}
			
			//console.log("new rotation lines...");
			//console.log(newLines);
			return newLines;
		},
		
		copyLines: function(xOffset, yOffset){
			var newLines = [];
			
			for(var i = 0; i < design.lines.length; i++){
				var line = createLine();
				line.point1.position.x = design.lines[i].point1.position.x + xOffset;
				line.point1.position.y = design.lines[i].point1.position.y + yOffset;
				
				line.point2.position.x = design.lines[i].point2.position.x + xOffset;
				line.point2.position.y = design.lines[i].point2.position.y + yOffset;
				
				newLines.push(line);
			}
			
			console.log("new copied lines...");
			console.log(newLines);
			return newLines;
		},
		
		translateTheseLines: function(xOffset, yOffset){
			for(var i = 0; i < design.points.length; i++){
				design.points[i].position.x += xOffset;
				design.points[i].position.y += yOffset;
				
				design.points[i].update();
			}
			
			for(var j = 0; j < design.lines.length; j++){
				design.lines[j].update();
			}
		},
		
		findMST: function(){
			var edges = [];
			var components = [];
			var activeComponent = [];
			//var components = new Array(design.points.length);
			for (var i = 0; i < design.points.length; i++){
				//components[i]= new Array();
				//components[i].add(design.points[i]);
				
				// reset a flag that determines if we've visited
				design.points[i].addedToComponent = i;
			}
			// Should be an array of arrays each with 1 point
			//console.log("MST components: " + components);
			
			for (var i = 0; i < design.lines.length; i++){
				// For each line, if the end points have not been in a component...
				if(design.lines[i].point1.addedToComponent !== design.lines[i].point2.addedToComponent){
					//arbitrarily choose one component to merge into the other
					var componentToKill = design.lines[i].point1.addedToComponent;
					var componentToSave = design.lines[i].point2.addedToComponent;
					// Go through all edges to merge into the saved component
					for(var j = 0; j < design.lines.length; j++){
						if(design.lines[j].point1.addedToComponent === componentToKill) design.lines[j].point1.addedToComponent = componentToSave;
						if(design.lines[j].point2.addedToComponent === componentToKill) design.lines[j].point2.addedToComponent = componentToSave;
					}
					
					// Even though the component to kill now should be completely killed, just be safe
					design.lines[i].point1.addedToComponent = componentToSave;
					//////////////////////////////////////////////////////
					// BUUUG BUG BUG BUGBUGBUG ***************************
					// Does not connect components depending on the order that they are added
					// If two edges get added to two different components, they are flagged as true and not connected
					// Fix: track which components the points are a part of?
					
					// and add the edge to the edges list
					edges.push(design.lines[i]);
				}
			}
			
			design.currentMST = edges;
			return edges;
		},
		
		// http://en.wikipedia.org/wiki/Depth-first_search
		findDFSPoints: function(){
			// Can do something smarter about picking a first point...
			// For now, just pick the first edge. We are looking for a list of point locations 
			var stack = [];
			var processed = [];
			if(design.points.length < 1){
				console.log("Can't DFS on empty design of 0 points...");
				return null;
			}
			console.log("POINTS: ", design.points);
			
			// Find the first component
			design.points[0].DFSParent = null;
			processed = processed.concat(design.findConnectedDFSPoints(design.points[0]));
			
			// Check for unconnected components to make sure we have the whole design
			for(var i = 0; i < design.points.length; i++){
				if(design.points[i].DFSParent === undefined){
					processed.push("jump");
					console.log("Found disconnected point " + design.points[i].id);
					processed = processed.concat(design.findConnectedDFSPoints(design.points[i]));
				}
			}
			
			// By now, processed should contain all the pattern info we need on the order of points to stitch
			return processed;
		},
		
		findConnectedDFSPoints: function(seedPt){
			console.log("calling findConnectedDFSPoints on point " + seedPt.id);
			
			var stack = [];
			var processed = [];
			
			seedPt.DFSParent = null;
			stack.push(seedPt);
			
			while(stack.length > 0){
				var vertex = stack.pop();
				//console.log("examining DFS for point " + vertex.id);

				if(vertex && vertex.discovered !== true){
					vertex.discovered = true;
					processed.push(vertex);
					var added = 0;
					
					for(var i = 0; i < vertex.adjPoints.length; i++){
						// adjPoints will always be 8 long. Check for not null in order to add them...
						if( vertex.adjPoints[i] !== null && 
							vertex.adjPoints[i].id !== vertex.DFSParent) {
								
								// Also skip the root node
								// Also skip discovered nodes because it's just a waste
								if(vertex.adjPoints[i].DFSParent === null ||
									vertex.adjPoints[i].discovered === true){
									// Found an already-claimed node (or the root), loop it
									processed.push("loop:"+ vertex.id + "->"+ vertex.adjPoints[i].id);
								} else {
									//console.log("adjVertex(" + vertex.adjPoints[i].id + ") setting parent " + vertex.id);
									vertex.adjPoints[i].DFSParent = vertex.id;
									stack.push(vertex.adjPoints[i]);
									added++;
								}
						}
					}

					// Pop if we are at the end of the line
					if(added === 0) processed.push("pop.noConnections:" + vertex.id);
				} else if(vertex && vertex.discovered !== undefined && vertex.discovered === true) {
					// Pop if we've reached a loop
					processed.push("pop.alreadyVisitedVertex:" + vertex.id);
				}
			}
			console.log("returning processed", processed);
			
			return processed;
		},
		
		resetDFSVariables: function(){
			// Reset all the points' settings for next time
			
			for(var i = 0; i < design.points.length; i++){
				design.points[i].discovered = undefined;
				design.points[i].DFSParent = undefined;
			}
		},
	};
	
	designCount++;
	allDesigns.push(design);
	return design;
};


