

var DesignHandler = function(){
	this.designs = [];
	this.activeDesign = null;
	
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
	
	this.activeDesign.defaultPath = path.clone();
	this.activeDesign.simplifiedPath = path.clone();
	
	// Now simplify the simplified path
	
	// Then translate it to our design line
	
	// Then apply some design xform
	
	
	console.log("paperJSPath imported to activeDesign", path);
};

