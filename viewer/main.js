var message = [];
if (!window.FileReader) {
    message = '<p>The ' +
              '<a href="http://dev.w3.org/2006/webapi/FileAPI/" target="_blank">File API</a>s ' +
              'are not fully supported by this browser.</p>' +
              '<p>Upgrade your browser to the latest version.</p>';

    document.querySelector('body').innerHTML = message;
} else {
    document.getElementById('fileDropBox').addEventListener('dragover', handleDragOver, false);
    document.getElementById('fileDropBox').addEventListener('drop', handleFileSelection, false);
    document.getElementById('files').addEventListener('change', handleFileSelection, false);
    // April's
    document.getElementById('genButton').addEventListener('click', generateSomething, false);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var currentlyLoadedPattern;
function displayFileText(filename, evt) {
    var view = new jDataView(evt.target.result, 0, evt.size);
    var pattern = new Pattern();
    filename = filename.toLowerCase();
    if (filename.endsWith("pes")) {
        pesRead(view, pattern);
    } else if (filename.endsWith("pec")) {
        pecRead(view, pattern);
    } else if (filename.endsWith("pcs")) {
        pcsRead(view, pattern);
    } else if (filename.endsWith("dst")) {
        dstRead(view, pattern);
    } else if (filename.endsWith("jef")) {
        jefRead(view, pattern);
    } else if (filename.endsWith("exp")) {            
        expRead(view, pattern);
    } else if (filename.endsWith("vp3")) {            
        vp3Read(view, pattern);
    } else if (filename.endsWith("xxx")) {            
        xxxRead(view, pattern);
    }
    //console.log("..  " + pattern.stitches[0].x + ", " + pattern.stitches[0].y );
    console.log(".  " + pattern.stringifyStitches());
    pattern.moveToPositive();
    console.log("..  " + pattern.stringifyStitches());
    pattern.drawShape(document.getElementById('mycanvas'));
    console.log("...  " + pattern.stringifyStitches());
    
    // April's
    pattern.loadedFileName = filename;
    currentlyLoadedPattern = pattern;
}

function handleFileReadAbort(evt) {
    alert("File read aborted.");
}

function handleFileReadError(evt) {
    var message;
    switch (evt.target.error.name) {
        case "NotFoundError":
            alert("The file could not be found at the time the read was processed.");
        break;
        case "SecurityError":
            message = "<p>A file security error occured. This can be due to:</p>";
            message += "<ul><li>Accessing certain files deemed unsafe for Web applications.</li>";
            message += "<li>Performing too many read calls on file resources.</li>";
            message += "<li>The file has changed on disk since the user selected it.</li></ul>";
            alert(message);
        break;
        case "NotReadableError":
            alert("The file cannot be read. This can occur if the file is open in another application.");
        break;
        case "EncodingError":
            alert("The length of the data URL for the file is too long.");
        break;
        default:
            alert("File error code " + evt.target.error.name);
    }
}

function startFileRead(fileObject) {
    var reader = new FileReader();

    // Set up asynchronous handlers for file-read-success, file-read-abort, and file-read-errors:
    reader.onloadend = function (x) { displayFileText.apply(null, [fileObject.name, x]); }; // "onloadend" fires when the file contents have been successfully loaded into memory.
    reader.abort = handleFileReadAbort; // "abort" files on abort.
    reader.onerror = handleFileReadError; // "onerror" fires if something goes awry.

    if (fileObject) { // Safety first.
      reader.readAsArrayBuffer(fileObject); // Asynchronously start a file read thread. Other supported read methods include readAsArrayBuffer() and readAsDataURL().
    }
}

function handleFileSelection(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer ? evt.dataTransfer.files : evt.target.files;

    if (!files) {
      alert("<p>At least one selected file is invalid - do not select any folders.</p><p>Please reselect and try again.</p>");
      return;
    }

    for (var i = 0, file; file = files[i]; i++) {
      if (!file) {
            alert("Unable to access " + file.name); 
            continue;
      }
      if (file.size == 0) {
            alert("Skipping " + file.name.toUpperCase() + " because it is empty.");
            continue;
      }
      startFileRead(file);
    }
}

function generateSomething(evt){
	
	if(currentlyLoadedPattern){
		// Undo moveToPositive
		currentlyLoadedPattern.moveToZeroFromPositive();
		// Undo flip vertical
		currentlyLoadedPattern.invertPatternVertical();
		// Undo absolute stitches transformation
		currentlyLoadedPattern.transformToRelStitches();
		
		var nameWithoutExt = currentlyLoadedPattern.loadedFileName.split(".")[0];
		dstWrite(nameWithoutExt + "_generated.dst", currentlyLoadedPattern);
		
	} else {
		var testStr = '040003';
		var byteArray = new Uint8Array(testStr.length/2);
		for(var i = 0; i < byteArray.length; i++){
			byteArray[i] = parseInt(testStr.substr(i*2, 2), 16);
		}
		var blob = new Blob([byteArray], {type:"application/octet-stream"});
		
		console.log(URL.createObjectURL(blob));
		
		saveAs(blob, "test.dst");
	}
	
	//window.requestFileSystem(window.PERSISTENT, 1024*1024, saveFile);
}
