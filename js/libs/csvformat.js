(function (global) {
    "use strict";
    

	// x, y , 0/1 flag if jump/trim stitch, 0/1 flag if color-change command, 0/1 if start, 0/1 if end
	
	
	function csvWrite(fileName, pattern){
    
    	// Design data starts at Byte 512, with first Byte labeled 0
    	var csvString = '';
    	
    	// start flag -- copy first stitch's location if there are any stitches. I hope there are.
    	if(pattern.stitches.length > 0){
    		csvString += pattern.stitches[0].x + "," + pattern.stitches[0].y + ",0,0,1,0\n";
    	} else {
			csvString += "0,0,0,0,1,0\n";
		}
		
		for(var i = 0; i < pattern.stitches.length; i++){
			var st = pattern.stitches[i];
			// x and y
			csvString += st.x + "," + st.y + ",";
			// jump/trim
			if((global.stitchTypes.jump & st.flags) === global.stitchTypes.jump || 
			   (global.stitchTypes.trim & st.flags) === global.stitchTypes.trim){
			   	csvString += "1,";
			   	console.log("saving jump/trim stitch to csv");
			   	console.log(st);
			   } else {
			   	csvString += "0,";
			   }
			// color-change (signaled via stop)
			if((global.stitchTypes.stop & st.flags) === global.stitchTypes.stop) {
				csvString +="1,";
				console.log("saving stop (aka color change) stitch to csv");
			   	console.log(st);
			} else {
				csvString +="0,";
			}
			
			// start is hard-coded and not a flag, so we add that as 0
			csvString += "0,";
			
			// finally the end...
			if((global.stitchTypes.end & st.flags) === global.stitchTypes.end) {
				csvString +="1"; // Note pattern will END with end and not need a new line!
				console.log("saving END stitch to csv");
			   	console.log(st);
			} else {
				csvString +="0\n";
			}
		}
    	
		var blob = new Blob([csvString], {type:"text/csv;charset=utf-8;"});
		
		saveAs(blob, fileName);
    }
    
    // jDataView, not an actual file (for now, not sure what we'll need here yet')
    function csvRead(file, pattern){
    	
    }

    global.csvRead = csvRead;
    global.csvWrite = csvWrite;

}(this));
