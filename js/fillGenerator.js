
// This is the first attempt to fill out a sewing-line visualzation of a fill
// That is, going zig-zag properly at a fill angle for a particular polygon

var FillGenerator = function(){
	this.verbose = false;
	
	// generation things sometimes require some seeds. We should save these where necessary
	this.noiseSeeds = [];
	for(var i = 0; i < 5; i++){
		this.noiseSeeds.push(Math.random());
	}

	return this;
}; // FillGenerator

///////////////////////////////////////////////////////////////
/// Helper functions to asses the shape /////////////////////////////
///////////////////////////////////////////////////////////////
/*
// https://stackoverflow.com/questions/22159120/how-to-determine-which-side-of-a-polygon-edge-is-inside-a-polygon-and-which-is
FillGenerator.prototype.isClockwisePolygon = function(path){
	
};
*/

/* signedArea = 0
for each point in points:
    x1 = point[0]
    y1 = point[1]
    if point is last point
        x2 = firstPoint[0]
        y2 = firstPoint[1]
    else
        x2 = nextPoint[0]
        y2 = nextPoint[1]
    end if

    signedArea += (x1 * y2 - x2 * y1)
end for
return signedArea / 2
*/
// https://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-points-are-in-clockwise-order/1165943#1165943
/*
FillGenerator.prototype.findSignedPolygonArea = function(path){
	if(path == undefined || path == null || path.segments.length < 3){
		console.log("cannot findSeignedPolygoneArea with a bad path", path);
		return null;
	}
	
	var signedArea = 0;
	var x1 = null;
	var y1 = null;
	var x2 = null;
	var y2 = null;
	
	for(var i = 0; i < path.segments.length; i++){
		x1 = path.segments[i].point.x;
		y1 = path.segments[i].point.y;
		
		if(i == path.segments.length-1){
			x2 = path.segments[0].point.x;
			y2 = path.segments[0].point.y;
		} else {
			x2 = path.segments[i + 1].point.x;
			y2 = path.segments[i + 1].point.y;
		}
		signedArea += (x1 * y2 - x2 * y1);
	}
	
	return signedArea / 2;
};*/

///////////////////////////////////////////////////////////////
/// Using Paper.js' intersection and such to help /////////////////////////////
///////////////////////////////////////////////////////////////

// polyPath: closed, or treated as closed, paper.js path that we are filling
// vector: the Point representing direction of the lines we want
// distance: the space between each scanline
FillGenerator.prototype.findAngledFillPath = function(polyPath, vector, distance){
	vector = vector.normalize();
	
	// Use some line length 
	var estLength = global.calcWidth + global.calcHeight;
	// TODO: use polyPath.bounds() to get the Rectangle and only check that area
	// For now, just do it from y = 0 or 1 or whatever
	var startPoint = new Point(0, 0);
	var movementVector;
	var movingRight = true;
	var movingDown = false;

	
	console.log("findAngledFillPath starting line/vector", endPoint);

	if((vector.x > 0 && vector.y > 0) || (vector.x < 0 && vector.y < 0)){
		// Positive slope "/"
		// Start at 0, which means that x should move to the left as we move down (- x)
		if(vector.x > 0 && vector.y > 0){
			vector = vector * -1;
			
		} 
		// Our vector is pointing down/left, so to move to the right (+) from there,
		// we move counter-clockwise (turn x +) each step, aka we rotate 90
		movementVector = vector.rotate(90);
	} else if ((vector.x > 0 && vector.y < 0) || (vector.x < 0 && vector.y > 0)){
		// Negative slope "\"
		movingRight = false;
		startPoint.x = global.calcWidth;
		// Start at top right point, pointing down, which means x should go to the right (+ x)
		if(vector.x < 0 && vector.y > 0){
			vector = vector * -1;
		}
		// Our vector is point down/right, so we move to the left (-) from there,
		// we move clockwise (turn x ) each step, aka we rotate -90
		movementVector = vector.rotate(-90);
	} else if(vector.x == 0){
		// y is 1 or -1. We will never move along x
		movingDown = true;
		movingRight = false;
		movementVector = new Point(0, -1);
	} else if (vector.y == 0){
		// x is 1 or -1. We will never move along y
		movementVector = new Point(1, 0);
	}
	
	var endPoint = vector * estLength;
	movementVector = movementVector * distance;
	
	console.log("findAngledFillPath movementVector", movementVector);

	var intersections = [];
	var paths = [];
	var pathCount = 0;
	
	////////////////////////////////
	// Figure out how many paths we will be estimating for based on the movementVector
	if(movingRight){
		// true for lines with positive slope or 0 slope (vertical horizontal line)
		// moving right, so we need to divide width by x movement increments
		pathCount = global.calcWidth / movementVector.x;
	} else if (movingDown){
		// moving down, only true if vector.x = 0 (ie flat horizontal line)
		pathCount = global.calcHeight / movementVector.y;
	} else {
		// lines with negative slope
		pathCount = global.calcWidth / movementVector.x;
	}
	
	pathCount = Math.abs(pathCount);
	
	console.log("findAngledFillPath pathCount", pathCount);
	
	////////////////////////////////
	// Gather the intersections and lines we want
	var tempLine = new Path(startPoint);
	tempLine.add(endPoint);
	
	for(var i = 0; i <= pathCount; i++){
		paths.push(tempLine.clone());
		intersections.push(polyPath.getIntersections(tempLine));
		
		if(moveingDown){
			// scoot down. Should be signed correctly
			tempLine.segments[0].point.y += movementVector.y;
			tempLine.segments[1].point.y += movementVector.y;
		} else {
			// scoot to the right or left, should be signed correctly
			tempLine.segments[0].point.x += movementVector.x;
			tempLine.segments[1].point.x += movementVector.x;
		}
		
	}
	
	return finalPath(polyPath, vector, distance, movementVector, intersections);
	
};

// I should just need the ordered list of intersections and the polyPath
// intersections is a list of lists, where each list is an intersection of one of the angled scanlines
//		Array of CurveLocation objects...?
// if a list in intersections is > 2, we have to deal with some proper scanline fill logic
FillGenerator.prototype.parseIntersections = function(polyPath, vector, distance, movementVector, intersections){
	var finalPath = new Path();
	
	return finalPath;
};







