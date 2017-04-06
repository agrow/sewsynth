(function (global) {
    "use strict";
    function decodeExp(b2) {
        var returnCode = 0;
        if (b2 === 0xF3) {
            return global.stitchTypes.end;
        }
        if ((b2 & 0xC3) === 0xC3) {
            return global.stitchTypes.trim | global.stitchTypes.stop;
        }
        if (b2 & 0x80) {
            returnCode |= global.stitchTypes.trim;
        }
        if (b2 & 0x40) {
            returnCode |= global.stitchTypes.stop;
        }
        return returnCode;
    }

	// dstRead takes a jDataView and a pattern, not a file!
    function dstRead(file, pattern) {
        var flags,
            x,
            y,
            prevJump = false,
            thisJump = false,
            b = [],
            byteCount = file.byteLength;
        file.seek(512);
        while (file.tell() < (byteCount - 3)) {
            b[0] = file.getUint8();
            b[1] = file.getUint8();
            b[2] = file.getUint8();
            x = 0;
            y = 0;
            if (b[0] & 0x01) {
                x += 1;
            }
            if (b[0] & 0x02) {
                x -= 1;
            }
            if (b[0] & 0x04) {
                x += 9;
            }
            if (b[0] & 0x08) {
                x -= 9;
            }
            if (b[0] & 0x80) {
                y += 1;
            }
            if (b[0] & 0x40) {
                y -= 1;
            }
            if (b[0] & 0x20) {
                y += 9;
            }
            if (b[0] & 0x10) {
                y -= 9;
            }
            if (b[1] & 0x01) {
                x += 3;
            }
            if (b[1] & 0x02) {
                x -= 3;
            }
            if (b[1] & 0x04) {
                x += 27;
            }
            if (b[1] & 0x08) {
                x -= 27;
            }
            if (b[1] & 0x80) {
                y += 3;
            }
            if (b[1] & 0x40) {
                y -= 3;
            }
            if (b[1] & 0x20) {
                y += 27;
            }
            if (b[1] & 0x10) {
                y -= 27;
            }
            if (b[2] & 0x04) {
                x += 81;
            }
            if (b[2] & 0x08) {
                x -= 81;
            }
            if (b[2] & 0x20) {
                y += 81;
            }
            if (b[2] & 0x10) {
                y -= 81;
            }
            flags = decodeExp(b[2]);
            thisJump = flags & global.stitchTypes.jump;
            if (prevJump) {
                flags |= global.stitchTypes.jump;
            }
            pattern.addStitchRel(x, y, flags, true);
            prevJump = thisJump;
            
            console.log("Stitch... " + x + ", " + y + " -- flags: " + flags);
            //if(thisJump) console.log("there was a jump! ", flags);
        }
        //console.log("1  " + pattern.stitches[0].x + ", " + pattern.stitches[0].y );
        pattern.addStitchRel(0, 0, global.stitchTypes.end, true);
        pattern.invertPatternVertical();
        //console.log("2  " + pattern.stitches[0].x + ", " + pattern.stitches[0].y );
        console.log("stitches", pattern.stitches);
    }
    
     /*
    * The header seems to contain information about the design.
    * Seems to be ASCII text delimited by 0x0D (carriage returns).
    * This must be in the file for most new software or hardware
    * to consider it a good file! This is much more important
    * than I originally believed. The header is 125 bytes in
    * length and padded out by 0x20 to 512 bytes total.
    * All entries in the header seem to be 2 ASCII characters
    * followed by a colon, then it's value trailed by a carriage return.
    *
    * char LA[16+1];  First is the 'LA' entry, which is the design name with no
    *                 path or extension information. The blank is 16 characters
    *                 in total, but the name must not be longer that 8 characters
    *                 and padded out with 0x20.
    *
    * char ST[7+1];   Next is the stitch count ST, this is a 7 digit number
    *                 padded by leading zeros. This is the total stitch count
    *                 including color changes, jumps, nups, and special records.
    *
    * char CO[3+1];   Next, is CO or colors, a 3 digit number padded by leading
    *                 zeros. This is the number of color change records in the file.
    *
    * char POSX[5+1]; Next is +X or the positive X extent in centimeters, a 5
    *                 digit non-decimal number padded by leading zeros.
    *
    * char NEGX[5+1]; Following is the -X or the negative X extent in millimeters,
    *                 a 5 digit non-decimal number padded by leading zeros.
    *
    * char POSY[5+1]; Again, the +Y extents.
    *
    * char NEGY[5+1]; Again, the -Y extents.
    *
    * char AX[6+1];   AX and AY should express the relative coordinates of the
    * char AY[6+1];   last point from the start point in 0.1 mm. If the start
    *                 and last points are the same, the coordinates are (0,0).
    *
    * char MX[6+1];   MX and MY should express coordinates of the last point of
    * char MY[6+1];   the previous file for a multi-volume design. A multi-
    *                 volume design means a design consisted of two or more files.
    *                 This was used for huge designs that can not be stored in a
    *                 single paper tape roll. It is not used so much (almost
    *                 never) nowadays.
    *
    * char PD[9+1];   PD is also storing some information for multi-volume design.
    */
    
    function dstWrite(fileName, pattern){
    
    	// Design data starts at Byte 512, with first Byte labeled 0
    	var header = '';
    	for(var i = 0; i < 512; i++) header += '20';
    	
    	//var designByteArray = new UintArray(pattern.stitches.length * 3);
    	var design = '';
    	for(var i = 0; i < pattern.stitches.length; i++){
    		design += encodeStitch(pattern.stitches[i].x, pattern.stitches[i].y, pattern.stitches[i].flags);
    	}
    	
    	var fileContents = header + design;

    	var byteArray = new Uint8Array(fileContents.length/2);
		for(var i = 0; i < byteArray.length; i++){
			byteArray[i] = parseInt(fileContents.substr(i*2, 2), 16);
		}
		var blob = new Blob([byteArray], {type:"application/octet-stream"});
		
		//console.log(URL.createObjectURL(blob));
		
		saveAs(blob, fileName);
    }
    
    // These stitches should be RELATIVE to the last ones
    function encodeStitch(x, y, flags){
    	var b0 = 0, b1 = 0, b2 = 0; // Bytes 1, 2, and 3 of a stitch
    	
    	if(x > 121 || x < -121) console.log("dstformat.encodeStitch() error: x is not in valid range [-121, 121]. x = " + x);
    	if(y > 121 || y < -121) console.log("dstformat.encodeStitch() error: y is not in valid range [-121, 121]. y = " + y);
    	
    	// Work max -> min narrowing in on zero
    	if(x >= +41) { b2 |= turnBitOn(2); x -= 81; }
    	if(x <= -41) { b2 |= turnBitOn(3); x += 81; }
    	if(x >= +14) { b1 |= turnBitOn(2); x -= 27; }
    	if(x <= -14) { b1 |= turnBitOn(3); x += 27; }
    	if(x >= +5)  { b0 |= turnBitOn(2); x -= 9; }
    	if(x <= -5)  { b0 |= turnBitOn(3); x += 9; }
    	if(x >= +2)  { b1 |= turnBitOn(0); x -= 3; }
    	if(x <= -2)  { b1 |= turnBitOn(1); x += 3; }
    	if(x >= +1)  { b0 |= turnBitOn(0); x -= 1; }
    	if(x <= -1)  { b0 |= turnBitOn(1); x += 1; }
    	if(x != 0)   { console.log("dstformat.encodeStitch() error: x should be zero, but it is " + x); }
    	
    	if(y >= +41) { b2 |= turnBitOn(5); y -= 81; }
    	if(y <= -41) { b2 |= turnBitOn(4); y += 81; }
    	if(y >= +14) { b1 |= turnBitOn(5); y -= 27; }
    	if(y <= -14) { b1 |= turnBitOn(4); y += 27; }
    	if(y >= +5)  { b0 |= turnBitOn(5); y -= 9; }
    	if(y <= -5)  { b0 |= turnBitOn(4); y += 9; }
    	if(y >= +2)  { b1 |= turnBitOn(7); y -= 3; }
    	if(y <= -2)  { b1 |= turnBitOn(6); y += 3; }
    	if(y >= +1)  { b0 |= turnBitOn(7); y -= 1; }
    	if(y <= -1)  { b0 |= turnBitOn(6); y += 1; }
    	if(y != 0)   { console.log("dstformat.encodeStitch() error: y should be zero, but it is " + y); }
    	
    	// The first 2 bits need to be on regardless
    	b2 |= 3;
    	
    	// Last 3 bytes must be 00 00 F3
    	if(flags === global.stitchTypes.end){
    		console.log("setting stitch end");
    		b2 = 0xf3; //'f3';
    		b0 = b1 = 0; 
    	}
    	
    	if(flags === global.stitchTypes.jump || flags === global.stitchTypes.trim){
    		console.log("setting stitch jump or trim");
    		b2 = (b2 | 0x83); // bitwise or, turn on those flags!
    	}
    	if(flags === global.stitchTypes.stop){
    		console.log("setting stitch stop");
    		b2 = (b2 | 0xC3); // bitwise or, turn on those flags!
    	}
    	
    	var compiledBytes = addLeadingZeroForHex(b0.toString(16)) + addLeadingZeroForHex(b1.toString(16)) + addLeadingZeroForHex(b2.toString(16));
    	
    	//console.log("generating bytes: " + compiledBytes);
    	
    	return compiledBytes;
    	
    }
    
    function addLeadingZeroForHex(text){
    	return ("0" + text).slice(-2);
    }
    
    function turnBitOn(pos){
    	return 1 << pos;
    }

    global.dstRead = dstRead;
    global.dstWrite = dstWrite;

}(this));
