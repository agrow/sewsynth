var global = {
	mainErrorHandler: null,
	mainHistoryHandler: null,
	mainCanvasHandler: null,
	mainDesignHandler: null,
	mainDesignGenerator: null,
	toolLibrary: null, // this is defined in tools.js
	selectedTool: "plainLine",
	
	calcHeight: 0,
	calcWidth: 0,
	designCount: 0,
	pointCount: 0,
	actionCount: 0,
	
	
	// GUIelements, not necessary to put them here, but helpful to know what's up
	design_options: {visible: false},
	view_options: {visible: false},
	image_options: {visible: false},
	
	keyMap: {},
	keyEventFired: {},
	// TODO: if drawing a path, lock commands such as keyboard UNDO
	inputLock: false, // if true, undo/UI commands should not be executed
	inputsLockedBy: null, // a string describing input locker & why
	
	/////////////////////////////////////////////////////////////
	//////////////// Functions //////////////////////////////////
	/////////////////////////////////////////////////////////////
	checkAllObjKeysNotNull: function(params){
		for (var key in params) {
		    // skip loop if the property is from prototype
		    if (!params.hasOwnProperty(key)) continue;
		    if (params[key] == null) return false;
		}
		return true;
	},
	
	// keys: an array of strings
	// params: an obj
	// params may have fields that are not in keys, and that's okay
	// If any key in keys does not exist in params, or is null in params, return false
	// BEWARE SPELLING MISTAKES!!!
	checkParamKeysNotNull: function(keys, params){
		if (keys == undefined || params == undefined || keys == null || params == null){
			console.log("!!!!!! IMPROPER USE OF checkParamKeysNotNull, null or undefined params sent", keys, params);
			return false;
		}
		
		for (var key in keys) {
		    // If any key does not exist in params, or if it is null, return false
		    if(params[keys[key]] == undefined || params[keys[key]] == null) {
		    	console.log("checkParamKeysNotNull found null value (key, name, params):::: ", key, keys[key], params);
		    	return false;
		    }
		}		
		
		return true;
	}
};