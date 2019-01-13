

var Tool = function(){
	
	// TODO: cavas handler tool settings, if needed
	
	// TODO: Design settings -- how many paths?
	
	// TODO: Design Path & Generation Settings for each path
	
	// TODO: Name of graphical file to display as the icon
	
	return this;
}

var toolLibrary = {
	plainLine: new Tool(
		// canvas handler tool just needs a min
		// Design settings needs 1 path
		// No generation settings
	),
	sketchNoise: new Tool(
		// canvas handler tool needs min & small max lines
		// Design settings needs 2 paths
		// Generation settings need loooow frequency, low iterations, low
	),
	sketchHighNoise = new Tool(
		// canvas handler tool needs min and small max lines
		// Design settings needs 1 paths
		// Generation settings need high frequency and an angle
	),
	swingNoise: new Tool(
		// canvas handler tool needs min & small max lines
		// Design settings needs 1 path
		// Generation settings needs 2 sets of generation settings
		// (or a high/low on frequency)
		// and an interval range on when the swap between low and high freq
	),
}
