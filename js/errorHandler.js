

/* ErrorHandler
 * Handles GUI/history/logs for errors that are thrown from everywhere!
 * 
 * 
 * 
 * 
 */
var ErrorHandler = function(){
	var errorlog = "";

	return this;
}; // ErrorHandler

ErrorHandler.prototype.log = function(msg){
	errorlog += msg + "\n";
};

ErrorHandler.prototype.errorMsg = function(msg, obj){
	this.traceMsg(msg, obj);
	
};

ErrorHandler.prototype.error = function(e){
	this.trace(e);
	
};

//////////////////////////////////////////////////
////// These should be disabled whenever there is a release
////// e.stack replaced with something safer/user friendlier
//////  
ErrorHandler.prototype.traceMsg = function(msg, obj, e){

	this.displayError(obj, e);
	
	if(msg !== undefined){
		try{
			throw new Error(msg);
		} catch (e) {
			alert(msg + "\n\n" + e.stack);
		}
	}
};

ErrorHandler.prototype.trace = function(e){
	alert(e.stack);
};

//////////////////////////////////////////////////
//////////////////////////////////////////////////

ErrorHandler.prototype.displayError = function(obj, e) {
	console.log("!!!!!!!!!!!!!!!!!!");
	console.log(obj);
	console.log(e);
	console.log("!!!!!!!!!!!!!!!!!!");
};
