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
	
	this.defaultPath = null;
	this.simplifiedPath = null;
	this.flattenedPath = null;
	
	// JANK-FAST
	this.pathPoints = [];
	
	return this;
}; // Design


////////////////////////////////////////////////////////////////////////
/////// DESIGN PATHS WITH PAPERJS //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// Round PATHPOINTS positions to their next whole number...
Design.prototype.roundPathPoints = function(){
	for(var i = 0; i < this.pathPoints.length; i++){
		this.pathPoints[i].x = Math.round(this.pathPoints[i].x);
		this.pathPoints[i].y = Math.round(this.pathPoints[i].y);
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

Design.prototype.prepForPrint = function() {
	this.parsePathToPoints(this.flattenedPath);
	this.roundPathPoints();
	this.calcDimensionsBasedOnPathPoints();
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

