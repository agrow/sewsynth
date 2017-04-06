var testDesign;
var designManip;
var destructive;

var resizeSVG = function(){
	console.log($(document).width());
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


$( document ).ready(function() {
	// Import the rest of the functions
	
	
	console.log( "ready!" );
	
	resizeSVG();
	/*
	drawGrid();
	
	testDesign = createDesign();
	//console.log(testDesign);
	/*
	testDesign.addLine(1, 1, 2, 2); // Diag down
	testDesign.addLine(2, 2, 2, 3); // Down
	testDesign.addLine(2, 3, 3, 4); // Diag down
	testDesign.addLine(3, 4, 4, 4); // Horizontal
	testDesign.addLine(4, 4, 4, 3); // Up
	testDesign.addLine(4, 3, 3, 2); // Diag down
	testDesign.addLine(3, 2, 2, 2); // Horizontal
	
	testDesign.addLine(7, 3, 8, 2); // Diag up
	
	testDesign.addLine(8, 2, 8, 3); // Down
	
	//testDesign.addLine(8, 3, 7, 3); // Horizontal
	//testDesign.addLine(8, 3, 7, 3); // Horizontal // Tests adding repeated lines
	//testDesign.addLine(7, 3, 8, 3); // Horizontal // Tests adding repeated line
	
	// Random start
	randomRestart(testDesign);
	
	console.log(testDesign);
	
	// Testing rules/grammar
	buildRules();
	//randomExpansion(testDesign);
	*/
	
	/*
	// Testing vertical reflection
	var testDesign2 = createDesign();
	testDesign2.addAllLines(testDesign.reflectPoints("x", 9));
	// Testing horizontal reflection
	var testDesign3 = createDesign();
	testDesign3.addAllLines(testDesign.reflectPoints("y", 5));
	testDesign3.addAllLines(testDesign2.reflectPoints("y", 5));
	
	//console.log(testDesign2);
	drawDesignOnGrid(testDesign2);
	drawDesignOnGrid(testDesign3);
	*/
	
	// Testing self-reflection
	//testDesign.addAllLines(testDesign.reflectPoints("x", 8));
	//testDesign.addAllLines(testDesign.reflectPoints("y", 4));
	
	// Testing new reflection
	// NOTE: These reflections happen in global space, NOT design space! 
	//		 Count 0 from the upper left corner and y is inverted.
	//testDesign.addAllLines(testDesign.reflectArbitraryLines(0, 4));
	//testDesign.addAllLines(testDesign.reflectArbitraryLines(null, null, 8));
	//testDesign.addAllLines(testDesign.reflectArbitraryLines(1, -4)) // diagonal y=x goes \ 
	//testDesign.addAllLines(testDesign.reflectArbitraryLines(-1, 10)) // diagonal y=-x / 
	
	// Testing rotation
	// ONLY LOOKS GOOD FOR INCRIMENTS OF 90
	//testDesign.addAllLines(testDesign.rotateAroundArbitraryPoint(10, 10, Math.PI/2));
	//testDesign.addAllLines(testDesign.rotateAroundArbitraryPoint(10, 10, Math.PI));
	
	//drawDensityColorMap(testDesign);
	
	//drawDesignOnGrid(testDesign);
	//redrawDesignBoundary(testDesign);
	//findCenterAndRedrawHoop();
	
	//drawMST(testDesign);
	/*
	$("#randExp").click(function(){
		randomExpansion(testDesign);
		drawOneMoreLine(testDesign);
		redrawDesignBoundary(testDesign);
		findCenterAndRedrawHoop();
	});
	$("#randExpx5").click(function(){
		for(var i = 0; i < 5; i++) $("#randExp").trigger("click");
	});
	$("#randExpx10").click(function(){
		for(var i = 0; i < 10; i++) $("#randExp").trigger("click");
	});
	$("#randExpx25").click(function(){
		for(var i = 0; i < 25; i++) $("#randExp").trigger("click");
	});
	$("#randExpx50").click(function(){
		for(var i = 0; i < 50; i++) $("#randExp").trigger("click");
	});
	
	$("#balaRandExp").click(function(){
		balancedRandomExpansion(testDesign);
		drawOneMoreLine(testDesign);
		redrawDesignBoundary(testDesign);
		findCenterAndRedrawHoop();
	});
	$("#balaRandx5").click(function(){
		for(var i = 0; i < 5; i++) $("#balaRandExp").trigger("click");
	});
	$("#balaRandx25").click(function(){
		for(var i = 0; i < 25; i++) $("#balaRandExp").trigger("click");
	});
	
	$("#mostBalaExp").click(function(){
		mostBalancedExpansion(testDesign);
		drawOneMoreLine(testDesign);
		redrawDesignBoundary(testDesign);
		findCenterAndRedrawHoop();
	});
	
	$("#mostBalax5").click(function(){
		for(var i = 0; i < 5; i++) $("#mostBalaExp").trigger("click");
	});
	$("#mostBalax25").click(function(){
		for(var i = 0; i < 25; i++) $("#mostBalaExp").trigger("click");
	});
	
	$("#minDensityExp").click(function(){
		spreadDensityExpansion(testDesign);
		drawOneMoreLine(testDesign);
		redrawDesignBoundary(testDesign);
		findCenterAndRedrawHoop();
	});
	$("#minDensityx5").click(function(){
		for(var i = 0; i < 5; i++) $("#minDensityExp").trigger("click");
	});
	$("#minDensityx25").click(function(){
		for(var i = 0; i < 25; i++) $("#minDensityExp").trigger("click");
	});
	
	$("#minDensityEndExp").click(function(){
		spreadDensityExpansion(testDesign, {endpoint:true});
		drawOneMoreLine(testDesign);
		redrawDesignBoundary(testDesign);
		findCenterAndRedrawHoop();
	});
	
	$("#minDensityEndx5").click(function(){
		for(var i = 0; i < 5; i++) $("#minDensityEndExp").trigger("click");
	});
	$("#minDensityEndx25").click(function(){
		for(var i = 0; i < 25; i++) $("#minDensityEndExp").trigger("click");
	});
	
	$("#restartGen").click(function(){
		$("#svg_canvas").empty();
		drawGrid();
		testDesign = createDesign();
		randomRestart(testDesign);
		drawDesignOnGrid(testDesign);
		redrawDesignBoundary(testDesign);
		findCenterAndRedrawHoop();
	});
	
	//var designManip = null;
	
	$("#randPost").click(function(){
		// Remove any previous designManip things
		removeObjectsWithClassName("designManip");
		designManip = randomPostProduction(testDesign);
		drawDesignOnGrid(designManip, {class: "designManip", print: "new"});
		// randPost only draws the manip, not the original design, which is drawn line-by-line...
		findCenterAndRedrawHoop();
	});
	
	$("#clearPost").click(function(){
		// Remove any previous designManip things
		removeObjectsWithClassName("designManip");
		findCenterAndRedrawHoop();
	});
	
	$("#makeEdge").click(function(){
		// Remove any previous designManip things
		removeObjectsWithClassName("designManip");
		
		
		destructive = createDesign();
		if(designManip !== null) {
			drawDesignOnGrid(designManip, {class: "designManip"});
			destructive.addAllLines(designManip.lines);
		}
		
		destructive.addAllLines(testDesign.lines);
		drawDesignOnGridAsEdge(destructive, {class: "designManip", skipMiddleDesign: true, print: "new"});
		findCenterAndRedrawHoop();
	});
	
	$("#makeFill").click(function(){
		// Remove any previous designManip things
		removeObjectsWithClassName("designManip");
		
		
		var destructive = createDesign();
		if(designManip !== null) {
			drawDesignOnGrid(designManip, {class: "designManip"});
			destructive.addAllLines(designManip.lines);
		}
		
		destructive.addAllLines(testDesign.lines);
		drawDesignOnGridAsFill(destructive, {class: "designManip", print: "new"});
		findCenterAndRedrawHoop();
	});
	
	$( "#spinnerX" ).spinner();
	$( "#spinnerX" ).spinner("value", 0);
	$( "#spinnerY" ).spinner();
	$( "#spinnerY" ).spinner("value", 0);
	
	$( "#spinnerFillX" ).spinner();
	$( "#spinnerFillX" ).spinner("value", 0);
	$( "#spinnerFillY" ).spinner();
	$( "#spinnerFillY" ).spinner("value", 0);
	
	
	$("#generatePrint").click(function(){
		// Should be done after hoop is repositioned, which I think happens automatically now.
		gatherPrintableStitches();
		generatePrintPattern(printDesign, gridSpacing);
		drawStPattern();
	});
	
	$("#zoomHoopIn").click(function() {
		console.log("trying to zoom IN", hoop.unitsPerStitch);
		if(hoop.unitsPerStitch < 100){
			hoop.unitsPerStitch += 10;
			$("#restartGen").trigger("click");
		}
	});
	$("#zoomHoopOut").click(function() {
		console.log("trying to zoom OUT", hoop.unitsPerStitch);
		if(hoop.unitsPerStitch > 10){
			hoop.unitsPerStitch -= 10;
			$("#restartGen").trigger("click");
		}
	});*/
});

var randomRestart = function(design){
	console.log("Random restart...");
	sizeGrid();
	var x = Math.floor(numAcross/2);
	var y = Math.floor(numDown/2);
	
	randomGrammarStart(design, x, y);
	console.log("Random restart complete.");
};

