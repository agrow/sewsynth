
// Just a collection of functions to generate GUI elements that fit in the expanding menu divs

// functions should take (event, ui)
// options parsing goes like this:
// {
//		change: fn(event, ui) {}, <-- ui has .handle and .value
//		max:, min:, step:, value:, range: true (2 sliders), then values should be [two, numbers]						
// }

// Note: // Getter: var value = $( ".selector" ).slider( "option", "value" );
var addSliderToGUI = function(parentID, id, options){
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
		if(global[menus[i]].visible === true) showMenuGuts(menus[i])
		else hideMenuGuts(menus[i])
	
	}
}

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
}

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
};

////////////////////////////////////////////////
/////// Called in main ////////////////////////
////////////////////////////////////////////////
var initilizeMenus = function(){
	// Menus should, on enter and exit, show/hide their content.
	// !!! NOTE: Make sure IDs match in this function! And in main's global! !!!
	setupMenu("design_options");
	setupMenu("view_options");
	
	// Line simplifier function slider //#lineSimplifierTolerance
	addSliderToGUI("design_options", "lineSimplifierTolerance", {min: .5, max: 10, step: .5, value:2.5});
	
	// Radio button selectors 
	$( "input[type='radio']" ).checkboxradio().on("change", function(e){global.mainDesignHandler.updatePathSelection($( e.target ).val())});
	//(v this hides the radio selector)
	updateMenuVisibilityContents(["design_options", "view_options"]);
	
	// BUTTONS!
	// This one is not invisible, so we just add it manually and let it float...
	var saveButton = $('<div/>', {id: "save_button", 'class': "ui-button"}).appendTo("#print");
	saveButton.button({label:"Save to DST"}).click(function() {global.mainDesignHandler.saveAllDesignsToFile();});
	
	console.log("Menus initialized");
};