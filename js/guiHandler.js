
// Just a collection of functions to generate GUI elements that fit in the expanding menu divs

// functions should take (event, ui)
// options parsing goes like this:
// {
//		change: fn(event, ui) {}, <-- ui has .handle and .value
//		max:, min:, step:, value:, range: true (2 sliders), then values should be [two, numbers]						
// }

// Note: // Getter: var value = $( ".selector" ).slider( "option", "value" );
var addSliderToGUI = function(parentID, id, labelText, options){
	var label = $('<div/>', {'class': parentID + "_menuGuts menu_item"}).appendTo('#' + parentID);
	label.html(labelText);
	var slide = $('<div/>', {id: id, 'class': parentID + "_menuGuts menu_item ui-slider"}).appendTo('#' + parentID);
	
	if(options !== undefined){
		slide.slider(options); // jquery ui slider initialization
	} else {
		slide.slider();
	}
	
	updateMenuVisibilityContents([parentID]);
};

var getValueOfSlider = function(id){
	var val = $('#' + id).slider("value");
	return val;
};

// UNFINISHED
var addOnChangeToSlider = function(id, onChangeFn){
	var slider = $('#' + id);
};

// Done by class, which is generated on adding items to the parent menu
var showMenuGuts = function(menuID){
	$("." + menuID + "_menuGuts").css('visibility', 'visible');
};

// Done by class, which is generated on adding items to the parent menu
var hideMenuGuts = function(menuID){
	$("." + menuID + "_menuGuts").css('visibility', 'hidden');
};

var updateMenuVisibilityContents = function(menus){
	for(var i = 0; i < menus.length; i++){
		if(global[menus[i]].visible === true) showMenuGuts(menus[i]);
		else hideMenuGuts(menus[i]);
	
	}
};

//////////////////////////////////////
///////////// Menu Manipulation //////////////////////////
/////////////////////////////////////

var setupMenu = function(ID){
	$("#" + ID)
		.mouseenter(function(){
			showMenuGuts(ID);
			global[ID].visible = true;
		})
		.mouseleave(function(){
			hideMenuGuts(ID);
			global[ID].visible = false;
		});
};

var moveMenu = function(ID, toX, toY){
	$("#" + ID).css({
	    position: 'absolute',
	    left: toX,
	    top: toY
	});
};

// Main's global.calcHeight size is the mainDiv... $("#mainDiv").height();
// We need THE WHOLE ENCHILADA!
var updateMenuPositions = function(){
	moveMenu("view_options", $("#hundred").width()-$("#view_options").outerWidth(true), 0);
	moveMenu("print", 0, $("#hundred").height()-$("#print").outerHeight(true));
	moveMenu("image_options", $("#design_options").outerWidth() + 5, 0);
};

////////////////////////////////////////////////
/////// Called in main ////////////////////////
////////////////////////////////////////////////
var initilizeMenus = function(){
	// Menus should, on enter and exit, show/hide their content.
	// !!! NOTE: Make sure IDs match in this function! And in main's global! !!!
	setupMenu("design_options");
	setupMenu("image_options");
	setupMenu("view_options");
	
	// Line simplifier function slider //#lineSimplifierTolerance
	addSliderToGUI("design_options", "lineSimplifierTolerance", "Line Simplifier Tolerance", {
															min: .1, max: 5, step: .1, value:2.5,
															change: function(event, ui){ global.mainDesignHandler.regenerateAllDerivedPaths(); },
															slide: function(event, ui){ global.mainDesignHandler.regenerateAllDerivedPaths(); } });
	addSliderToGUI("design_options", "lineFlatness", "Line Flatten Allowed Error", {
															min: .5, max: 15, step: .5, value:2.5,
															change: function(event, ui){ global.mainDesignHandler.regenerateAllDerivedPaths(); },
															slide: function(event, ui){ global.mainDesignHandler.regenerateAllDerivedPaths(); } });
	
	addSliderToGUI("image_options", "edgeThreshold", "Edge Detection Threshold", {
															min: 0, max: 300, step: 1, value:100,
															change: function(event, ui){ global.mainCanvasHandler.reloadImageFromGUI(); },
															slide: function(event, ui){ global.mainCanvasHandler.reloadImageFromGUI(); } });
	
	
	
	// Radio button selectors 
	// Set default checked, matches default in designHandler...
	$("#radio-3").prop('checked', true);
	$( "input[type='radio']" ).checkboxradio().on("change", function(e){ global.mainDesignHandler.updatePathSelection($( e.target ).val()); });
	//(v this hides the radio selector)
	updateMenuVisibilityContents(["design_options", "view_options", "image_options"]);
	
	// BUTTONS!
	// This one is not invisible, so we just add it manually and let it float...
	var saveButton = $('<div/>', {id: "save_button", 'class': "ui-button"}).appendTo("#print");
	saveButton.button({label:"Save to DST"}).click(function() {global.mainDesignHandler.saveAllDesignsToFile();});
	
	console.log("Menus initialized");
};