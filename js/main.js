
// Handled by flex, but we may need to override that if it doesn't work with our drawing functions...
var resizeSVG = function(){
	//console.log($(document).width());
	//$("#svg_canvas").width($(document).width() - 160);
	//$("#svg_canvas").height($(document).height() - 140);
};

var setGUIFunctions = function(){
	// Put button/UI functions here, to be loaded when document is ready!
};

var drawBackground = function(start){
	
};

var drawDesign = function(start){
	
};

var randomRestart = function(design){
	console.log("Random restart...");
	sizeGrid();
	var x = Math.floor(numAcross/2);
	var y = Math.floor(numDown/2);
	
	randomGrammarStart(design, x, y);
	console.log("Random restart complete.");
};

$( document ).ready(function() {
	// Import the rest of the functions
		
	console.log( "ready!" );
});
