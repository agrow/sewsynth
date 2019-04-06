
/* Action
 * A user input that is a notable event
 * Can be undone/redone
 * 
 * A major component of HistoryHandler
 * 
 * params are held by the action and hold any relevant child access info
 * onDo, onUndo, onRedo, and onEdit are functions that will be called by the history manager
 * as it deems necessary based on user input
 */
var Action = function(params, onDo, onUndo, onRedo, onEdit){
	console.log("in action", params);
	console.log("in action", params.obj);
	console.log("in action", params.path);
	this.id = global.actionCount++;
	this.params = params;
	this.onDo = onDo;
	this.onUndo = onUndo;
	this.onRedo = onRedo;
	this.onEdit = onEdit;
	// this.destroy
	
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
    console.log("onRedo: ", this.onRedo);
    console.log("onEdit: ", this.onEdit);
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

////////////////////////////////////////////////
// CALLED BY OTHER FUNCTIONS IN THE CODE
// Where actions are defined & executed 
////////////////////////////////////////////////

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
	
	console.log("Did an action, clear out the redo stack!");
	//TODO: utterly destroy any paths inside of the subStack
	this.subStack = [];
};

////////////////////////////////////////////////
// CALLED BY MAIN ON INPUT LISTENING
// Needs no contextual input
////////////////////////////////////////////////


// Pops an action from addStack & pushes it to subStack
HistoryHandler.prototype.doUndo = function(){
	if(this.addStack.length > 0){
		var action = this.addStack.pop();
		this.log += "--- UNDO ---\n";
		
		try { 
			action.onUndo();
		} catch (e) {
			console.log(e);
			console.log("undoACTION problem!!!", action);
		}
		
		this.subStack.push(action);
	} else {
		console.log("Cannot undo empty stack, do nothing");
	}
};

// Pops an action from subStack & pushes it to addStack
HistoryHandler.prototype.doRedo = function(){
	if(this.subStack.length > 0){
		var action = this.subStack.pop();
		this.log += "--- REDO ---\n";
		
		try{
			action.onDo();
		} catch (e) {
			console.log(e);
			console.log("redoACTION problem!!!", action);
		}
		
		this.log += action.toString();
		this.addStack.push(action);
		
	} else {
		console.log("Cannot redo empty stack, do nothing");
	}
};

// finds an action wherever it is (hopefully on the top of the add stack but who knows)
// and edit its contents
// PROBLEM...? how do we send info on the 'changes' to this function call?
HistoryHandler.prototype.doEdit = function(actionID, editParams){
	
	// Find the action to edit
	for(var i = 0; i < this.addStack.length; i++){
		if(this.addStack[i].id == actionID){
			this.log += "--- EDIT --- add id: " + actionID + "\n";
		
			try{
				this.addStack[i].onEdit(editParams);
			} catch (e) {
				console.log(e);
				console.log("editACTION problem!!!", this.addStack[i]);
			}
		}
	}
	
	// This should probably never happen. Why did I do this?
	for(var i = 0; i < this.subStack.length; i++){
		if(this.subStack[i].id == actionID){
			this.log += "--- EDIT --- sub id: " + actionID + "\n";
		
			try{
				this.subStack[i].onEdit(editParams);
			} catch (e) {
				console.log(e);
				console.log("editACTION problem!!!", this.subStack[i]);
			}
		}
	}
	
	
};

