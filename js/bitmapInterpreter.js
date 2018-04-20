// FILE INCLUDES: BitmapInterpreter; BitmapInterpretation
// Interpreter takes bitmaps and makes interpretations
// Interpretations hold line/fill design elements
// Interpretations will hold history/states of edits
// Interpretations will also take/change/generate from user input/specification
// A single interpretation, once settled, will be added to the active design...

var BitmapInterpreter = function(){
	// takes image data
	// returns interpretation
	this.interpretBitmap = function(img){
		var output = new BitmapInterpretation();
		
		return output;
	};
	
	return this;
}; // BitmapInterpreter

var BitmapInterpretation = function(){
	
	
	return this;
}; // BitmapInterpretation
