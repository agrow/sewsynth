
/* Action
 * A user input that is a notable event
 * Can be undone/redone
 * 
 * A major component of HistoryHandler
 * 
 */
var Action = function(params, onDo, onUndo){
	this.params = params;
	this.onDo = onDo;
	this.onUndo = onUndo;
	
	return this;
}; 

Action.prototype.toString = function(){
	var str = "";
	
	if(this.params !== undefined){
		str += "====== Action: " + this.params.tag + " ======\n";
	}

	str += ("Action params: \n");
	
	for (var key in this.params) {
	    // skip loop if the property is from prototype
	    if (!this.params.hasOwnProperty(key)) continue;
	
	    //if (this.params[key] !== null){
	    str += key + ": " + this.params[key] + "\n";
	    //} 
    }
   
   return str + "\n";
};

Action.prototype.fullPrint = function(log){
	if(this.params !== undefined){
		console.log("====== Action: " + this.params.tag + " ======");
	}

	console.log("Action params: ", this.params);
   
    console.log("onDo: ", this.onDo);
    console.log("onUndo: ", this.onUndo);
};

/* HistoryHandler
 * Manages the push/pull of Actions
 * via undo/redo
 * 
 * 
 * 
 */
var HistoryHandler = function(){
	var log = "";
	
	// When an action is done, it gets pushed to the addStack
	this.addStack = [];
	
	// When an action is undon, it is Popped from addStack & pushed to subStack
	// When an action is redon, it is Popped from the subStack & pushed to addStack
	this.subStack = [];

	return this;
}; // HistoryHandler


// Makes a new Action & pushes it to addStack
HistoryHandler.prototype.doAction = function(action){
	try{
		action.onDo();
	} catch (e) {
		console.log(e);
		console.log("doACTION problem!!!", action);
	}
	this.log += action.toString();
	this.addStack.push(action);
};


// Pops an action from addStack & pushes it to subStack
HistoryHandler.prototype.doUndo = function(){
	var action = this.addStack.pop();
	try { 
		action.onUndo();
	} catch (e) {
		console.log(e);
		console.log("undoACTION problem!!!", action);
	}
	this.log += "--- UNDO ---\n";
	this.subStack.push(action);
};

// Pops an action from subStack & pushes it to addStack
HistoryHandler.prototype.doRedo = function(){
	var action = this.subStack.pop();
	this.log += "--- REDO ---\n";
	this.doAction(action);
};

