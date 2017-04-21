
// Just a collection of functions to generate GUI elements that fit in the expanding menu divs

// functions should take (event, ui)
// options parsing goes like this:
// {
//		change: fn(event, ui) {}, <-- ui has .handle and .value
//		max:, min:, step:, value:, range: true (2 sliders), then values should be [two, numbers]						
// }

// Note: // Getter: var value = $( ".selector" ).slider( "option", "value" );
var addSliderToGUI = function(parentID, id, options){
	var slide = $('<div/>', {id: id, 'class': parentID + "_menuGuts menu_item"}).appendTo('#' + parentID);
	
	if(options !== undefined){
		slide.slider(options); // jquery ui slider initialization
	} else {
		slide.slider();
	}
	
	if(global[parentID].visible === true) showMenuGuts(parentID)
	else hideMenuGuts(parentID)
};

var getValueOfSlider = function(id){
	var val = $('#' + id).slider("value");
	return val;
};

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



////////////////////////////////////////////////
/////// Called in main ////////////////////////
////////////////////////////////////////////////
var initilizeMenus = function(){
	// Menus should, on enter and exit, show/hide their content.
	// #design_sliders
	setupMenu("design_sliders");
	
	// Line simplifier function slider //#lineSimplifierTolerance
	addSliderToGUI("design_sliders", "lineSimplifierTolerance", {min: .5, max: 10, step: .5, value:2.5});
	
	console.log("Menus initialized");
};

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
