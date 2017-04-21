var Design = function() {
	this.id = global.designCount++;
	this.pointCount = 0;
	this.dimensions = {smallX: 999999, bigX: -999999, 
					   smallY: 999999, bigY: -999999, 
					   width: -1, height: -1};
	
	this.head = null;
	this.tail = null;
	
	this.currentAnchor = this.createPosition(0, 0);
	
	// In order of creation
	this.pointsStack = [];
	// By ID
	this.pointsMap = [];
	
	// By Location // TO DO LATER, IF IT'S USEFUL //
	//this.pointsMapByLocation = [];
	
	this.defaultPath = null;
	this.simplifiedPath = null;
	
	// JANK-FAST
	this.pathPoints = [];
	
	return this;
} // Design

////////////////////////////////////////////////////////////////////////
//////////////// POSITIONS & POINTS ////////////////////////////////////
////////////////////////////////////////////////////////////////////////
Design.prototype.createPosition = function (xPos, yPos) {
	if(xPos === undefined || yPos === undefined ||
		xPos === null || yPos === null){
			console.err("Creating (0, 0) point because x or y of create point is undefined/null", xPos, yPos);
			return {x: 0, y: 0};
		} else {
			return {x: xPos, y: yPos}
		}
		
}; // createPosition

Design.prototype.copyPostion = function(position){
	if(position === undefined || position === null){
		console.err("Cannot copy null/undefined position ", position);
		return;
	}
	return this.createPosition(position.x, position.y);
}; // copyPosition

Design.prototype.addNewPoint = function(xPos, yPos){
	var design = this;
	var position;
	
	if(xPos === undefined || yPos === undefined ||
		xPos === null || yPos === null){
			position = design.createPosition(0, 0);
		} else {
			position = design.createPosition(xPos, yPos);
		}
	
	var point = {
		id: global.pointCount++,
		pos: position, // {x: #, y: #}
		prev: null, // point
		next: null, // point
		
		// to do: Add any overhead necessary for easy point navigation, retrieval, or score evaluation
		
		// printing!
		toString: function(){ 
			return "(" + this.position.x + ", " + this.position.y + ")"; 
		}
	}; // point
	
	this.pointsStack.push(point);
	this.pointMap[point.id] = point;
	
	return point;
}; // Design.createPoint

// NOTE: CURRENTLY DOES NOT COPY PREV/NEXT! Why would you want to? That fucks things up!
Design.prototype.copyPoint = function(point){
	if(point === null || point === undefined){
		console.err("Cannot copy null/undefined point", point);
		return;
	}
	
	var newPoint = this.addNewPoint(point.pos.x, point.pos.y);
	return newPoint;
}; // Design.copyPoint

// Round PATHPOINTS positions to their next whole number...
Design.prototype.roundPathPoints = function(){
	for(var i = 0; i < this.pathPoints.length; i++){
		this.pathPoints[i].x = Math.round(this.pathPoints[i].x);
		this.pathPoints[i].y = Math.round(this.pathPoints[i].y);
	}
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

/*
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


*/