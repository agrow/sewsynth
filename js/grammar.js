/* when dealing with points, it is good to remember: 		
 * 
 *		/// Point and Line connections
		//0: null, // Up
		//1: null, // Up-right
		//2: null, // Right
		//3: null, // Down-right
		//4: null, // Down
		//5: null, // Down-left
		//6: null, // Left
		//7: null, // Up-left
		// Reflexive Pairs: 0-4, 1-5, 2-6, 3-7
*/

var rules = [];

var buildRules = function(){
	var workingName = "";
	
	// Create a line out from point
	for(var i = -1; i <= 1; i++){
		for(var j = -1; j <= 1; j++){
			if (!(i === 0 && j === 0)){
				var rule = {
					name: "point_" + i + "," + j,
					xOffset: i,
					yOffset: j,
					precond: function(design, point, x, y){
						// One of these i, j pairs will always exist because we're building off an existing line
						//console.log($("#noCrosses").prop('checked'));
						if($("#noCrosses").prop('checked')){
							//console.log("FORBIDDING CROSSED LINES!!!");
							return (design.doesLineExist(point.position.x, point.position.y, point.position.x + x, point.position.y + y)
								 || design.doesCrossLineExist(point.position.x, point.position.y, point.position.x + x, point.position.y + y));
						} else {
							return (design.doesLineExist(point.position.x, point.position.y, point.position.x + x, point.position.y + y));
						}
					},
					execute: function(design, point, x, y){
						//console.log("new line with offsets... " + x + ", " + y);
						design.addLine(point.position.x, point.position.y, point.position.x + x, point.position.y + y);
					}
				};
				//console.log(rule);
				rules.push(rule);
			}
		}
	}
	
	console.log(rules.length + " rules generated");
	console.log(rules);
};

var connectPoints = function(pt1, pt2, options){
	// Shortest path
	// noise (and various degrees)
	
	// round-abouts
};

var randomGrammarStart = function(design, x, y){
	var i = 0;
	var j = 0;
	
	while(i === 0 && j ===0){
		i = Math.floor(Math.random() * 3) -1;
		j = Math.floor(Math.random() * 3) -1;
	}
	
	design.addLine(x, y, x + i, y + j);
};

// BE CAREFUL! DO THIS ONLY WITH COPY POINTS
var expandPhantomRule = function(point, ruleID){
	var line = createLine(); // SUPER NULL
	point.lines.push(line);
	
	if(rules[ruleID].xOffset === 0 && rules[ruleID].yOffset === -1) point.adjLines[0] = line;
	else if(rules[ruleID].xOffset === 1 && rules[ruleID].yOffset === -1) point.adjLines[1] = line;
	else if(rules[ruleID].xOffset === -1 && rules[ruleID].yOffset === 0) point.adjLines[6] = line;
	else if(rules[ruleID].xOffset === 1 && rules[ruleID].yOffset === 0) point.adjLines[2] = line;
	else if(rules[ruleID].xOffset === -1 && rules[ruleID].yOffset === 1) point.adjLines[5] = line;
	else if(rules[ruleID].xOffset === 0 && rules[ruleID].yOffset === 1) point.adjLines[4] = line;
	else if(rules[ruleID].xOffset === 1 && rules[ruleID].yOffset === 1) point.adjLines[3] = line;
	else if(rules[ruleID].xOffset === -1 && rules[ruleID].yOffset === -1) point.adjLines[7] = line;
};

var spreadDensityExpansion = function(design, options){
	var possibleRules = [];
	var minDensityAvg = 9999;
	// Score all the density -- We need to do this before because of the endpoints
	for(var i = 0; i < design.points.length; i++){
		design.points[i].scoreDensity();
	}
	
	for(var i = 0; i < design.points.length; i++){
		for(var j = 0; j < rules.length; j++){
			// Try out every rule on every point.
			// 1. Test if it's viable
			if(!rules[j].precond(design, design.points[i], rules[j].xOffset, rules[j].yOffset)){
				// If it's viable, test how much it would increase the average density score of the endpoints by
				
				var avg1 = design.points[i].densityScore;
				var avg2 = 0;
				// Does the point exist?
				var endPoint = design.getPointAtPosition(design.points[i].position.x + rules[j].xOffset, design.points[i].position.y + rules[j].yOffset);
				if(endPoint !== null){
					//console.log("found endpoint, using its density score: " + endPoint.densityScore);
					// If it does, grab its density.
					avg2 = endPoint.densityScore;
				}
				
				var totalAvg = (avg1 + avg2)/2;
				if(options) {
					//console.log("OPTIONS FOUND");
					//console.log(options);
					if(options.endpoint){
						//console.log("OPTIONS.ENDPOINT FOUND");
						totalAvg = avg2;
					}
				}
				//console.log("Densities calculated: " + avg1 + ", " + avg2 + " with total avg of " + totalAvg);
				if(totalAvg < minDensityAvg) minDensityAvg = totalAvg;
				
				var ruleChoice = {
					pointID: i,
					ruleID: j,
					densityAvg: totalAvg
				};
				possibleRules.push(ruleChoice);
			}
		}
	}
	
	// Pick from the smallest density increases
	// NOTE: If we just "pop" it will pick the first rule over and over.
	// 		In this case, density has such limited ranges we want to randomly pick
	//console.log(possibleRules);
	var newRulePool = [];
	for(var i = 0; i < possibleRules.length; i++){
		if(possibleRules[i].densityAvg === minDensityAvg) newRulePool.push(possibleRules[i]);
	}
	console.log("Found " + newRulePool.length + " Rules with minDensityAverage " + minDensityAvg);
	var chosenRule = newRulePool[Math.floor(Math.random() * newRulePool.length)];
	//console.log(chosenRule);
	//console.log(design.points[chosenRule.pointID]);
	
	// Execute that rule
	rules[chosenRule.ruleID].execute(design, design.points[chosenRule.pointID], rules[chosenRule.ruleID].xOffset, rules[chosenRule.ruleID].yOffset);

};

// NOTE: This function only really makes sense with the detailedBalanceScore
var mostBalancedExpansion = function(design, options){
	var possibleRules = [];
	for(var i = 0; i < design.points.length; i++){
		design.points[i].scorePointBalance();
		for(var j = 0; j < rules.length; j++){
			// Try out every rule on every point.
			// 1. Test if it's viable
			if(!rules[j].precond(design, design.points[i], rules[j].xOffset, rules[j].yOffset)){
				// If it's viable, test how much it would increase the balance score by
				var cPoint = copyPoint(design.points[i]);
				expandPhantomRule(cPoint, j);
				cPoint.scorePointBalance();
				var ruleChoice = {
					pointID: i,
					ruleID: j,
					dBSIncrease: cPoint.detailedBalanceScore - design.points[i].detailedBalanceScore
				};
				possibleRules.push(ruleChoice);
			}
		}
	}
	
	// Rules have been made for all possible points and lines
	//console.log(possibleRules);
	// Make and use a custom sort function for this array and sort it
	possibleRules.sort(function(x, y){
		if(x.dBSIncrease > y.dBSIncrease) return 1;
		if(x.dBSIncrease < y.dBSIncrease) return -1;
		return 0;
	});
	
	// Pick the biggest dBSIncrease
	//console.log(possibleRules);
	var chosenRule = possibleRules.pop();
	//console.log(chosenRule);
	//console.log(design.points[chosenRule.pointID]);
	
	// Execute that rule
	rules[chosenRule.ruleID].execute(design, design.points[chosenRule.pointID], rules[chosenRule.ruleID].xOffset, rules[chosenRule.ruleID].yOffset);
};

var balancedRandomExpansion = function(design, options){
	//for(var i = 0; i < design.points.length; i++){
		// Score all the points!
	//	design.points[i].scorePointBalance();
	//}
	var count = 0;
	
	while(count < design.points.length * 10){
		var chooseRule = Math.floor(Math.random() * rules.length);
		var choosePoint = Math.floor(Math.random() * design.points.length);
		if(!rules[chooseRule].precond(design, design.points[choosePoint], rules[chooseRule].xOffset, rules[chooseRule].yOffset)){
			// This rule is valid. Would it increase balance?
			design.points[choosePoint].scorePointBalance();
			//console.log(design.points[choosePoint].id + "..... Trying score... " + design.points[choosePoint].balanceScore);
			var cPoint = copyPoint(design.points[choosePoint]);
			expandPhantomRule(cPoint, chooseRule);
			cPoint.scorePointBalance();
			//console.log("Phantom copy with new line: " + cPoint.balanceScore);
			if(cPoint.balanceScore > design.points[choosePoint].balanceScore){
				//console.log("rule expansion occuring");
				console.log(rules[chooseRule]);
				//console.log("!!!!! FOUND A BALANCE INCREASE! " + cPoint.balanceScore + " > " + design.points[choosePoint].balanceScore);
				rules[chooseRule].execute(design, design.points[choosePoint], rules[chooseRule].xOffset, rules[chooseRule].yOffset);
				return true;
			}
		}
		count++;
	}
	
	console.log("In " + count + " tries, we could not find a way to increase balance through random selection. Using random expansion.");
	randomExpansion(design, options);
};

var randomExpansion = function(design, options){
	var count = 0;
	while(count < 9999){ // 9999 is the threshold for finding a workable rule. 
		var chooseRule = Math.floor(Math.random() * rules.length);
		//console.log("chosen rule: " + chooseRule + " with name " + rules[chooseRule].name);
		//console.log(rules[chooseRule]);
		
		//var chooseLine = Math.floor(Math.random() * design.lines.length);
		var choosePoint = Math.floor(Math.random() * design.points.length);
		//console.log("chosen point: " + choosePoint + " with id " + design.points[choosePoint].id);
		//console.log(rules[chooseRule].precond);
		//console.log("checking precond: " + rules[chooseRule].precond(design, design.points[choosePoint]));
		
		if(!rules[chooseRule].precond(design, design.points[choosePoint], rules[chooseRule].xOffset, rules[chooseRule].yOffset)){
			rules[chooseRule].execute(design, design.points[choosePoint], rules[chooseRule].xOffset, rules[chooseRule].yOffset);
			return true;
		} //else {
		//	console.log("precondition failed, line likely already exists.");
		//}
		count++;
	}
};

var randomPostProduction = function(design, options){
	var postDetails;
	
	if(options && options.postDetails){
		console.log("Loading post Details: ", options.postDetails);
		postDetails = options.postDetails;
		
	} else {
		postDetails = {
			greatestX: -9999,
			smallestX: 9999,
			greatestY: -9999,
			smallestY: 9999,
			width: -1,
			height:-1,
			xOffset: $("#spinnerX").spinner("value"), //0, // Math.floor(Math.random() *4) -2,
			yOffset: $("#spinnerY").spinner("value"),  //0, //Math.floor(Math.random() *4) -2
			firstManip: -1,
			secondManip: -1,
		};
	}
	console.log(postDetails);
	
	for(var i = 0; i < design.points.length; i++){
		if(design.points[i].position.x > postDetails.greatestX) postDetails.greatestX = design.points[i].position.x;
		if(design.points[i].position.x < postDetails.smallestX) postDetails.smallestX = design.points[i].position.x;
		
		if(design.points[i].position.y > postDetails.greatestY) postDetails.greatestY = design.points[i].position.y;
		if(design.points[i].position.y < postDetails.smallestY) postDetails.smallestY = design.points[i].position.y;
	}
	
	postDetails.width = postDetails.greatestX - postDetails.smallestX;
	postDetails.height = postDetails.greatestY - postDetails.smallestY;
	
	if(postDetails.width === 0) postDetails.width = 1;
	if(postDetails.height === 0) postDetails.height = 1;
	
	console.log("postDetails: ");
	console.log(postDetails);
	
	var newDesignAdditions = createDesign();
	// Randomly choose: Copy, Reflect, or rotate L/R to make a horizontal manipulation
	var firstManip;
	
	if(postDetails.firstManip >= 0){
		firstManip = postDetails.firstManip;
	} else {
		firstManip = Math.floor(Math.random() * 4);
		postDetails.firstManip = firstManip;
	}

	//var firstManip = 3;
	if(firstManip === 0){
		// Copy
		console.log("Copying for first manip");
		newDesignAdditions.addAllLines(design.copyLines(postDetails.width + postDetails.xOffset, 0));
	} else if (firstManip === 1){
		// Reflect
		console.log("Reflecting for first manip");
		newDesignAdditions.addAllLines(design.reflectPoints("x", postDetails.greatestX + postDetails.xOffset/2));
	} else if (firstManip === 2){
		// Rotate Right
		console.log("Rotating Right for first manip");
		newDesignAdditions.addAllLines(design.rotateAroundArbitraryPoint(postDetails.greatestX, postDetails.greatestY, Math.PI/2));
		newDesignAdditions.translateTheseLines(postDetails.xOffset, 0);
	} else if (firstManip ===3){
		// Rotate Left
		console.log("Rotating Left for first manip");
		// This involves a rotate and translate
		newDesignAdditions.addAllLines(design.rotateAroundArbitraryPoint(postDetails.greatestX, postDetails.greatestY, -Math.PI/2));
		//newDesignAdditions.updateDimensions();
		newDesignAdditions.translateTheseLines(postDetails.height + postDetails.xOffset, -(postDetails.width));
	} else {
		console.log("ERROR! first manip random is off: " + firstManip);
	}
	
	// Randomly choose: Copy, Reflect, or rotate L/R to make a vertical manipulation
	//var secondManip = Math.floor(Math.random() * 4);
	var secondManip; // = 3;
	if(postDetails.secondManip >= 0){
		secondManip = postDetails.secondManip;
	} else {
		secondManip = 3;
		postDetails.secondManip = secondManip;
	}
	
	if(secondManip === 0){
		// Copy
		console.log("Copying for second manip");
		newDesignAdditions.addAllLines(newDesignAdditions.copyLines(0, postDetails.height + postDetails.yOffset));
		newDesignAdditions.addAllLines(design.copyLines(0, postDetails.height + postDetails.yOffset));
	} else if (secondManip === 1){
		// Reflect
		console.log("Reflecting for second manip");
		newDesignAdditions.addAllLines(newDesignAdditions.reflectPoints("y", postDetails.greatestY + postDetails.yOffset/2));
		newDesignAdditions.addAllLines(design.reflectPoints("y", postDetails.greatestY + postDetails.yOffset/2));
	} else if (secondManip === 2 || secondManip === 3){
		// Rotate Right
		console.log("Rotating Right/Left for second manip");
		var newDesignAdditionsTEMP = createDesign();
		
		newDesignAdditionsTEMP.addAllLines(design.rotateAroundArbitraryPoint(postDetails.greatestX, postDetails.greatestY, Math.PI));
		
		newDesignAdditionsTEMP.addAllLines(newDesignAdditions.rotateAroundArbitraryPoint(postDetails.greatestX, postDetails.greatestY, Math.PI));
		newDesignAdditionsTEMP.translateTheseLines(postDetails.xOffset, 0);
		newDesignAdditionsTEMP.translateTheseLines(0, postDetails.yOffset);
		newDesignAdditions.addAllLines(newDesignAdditionsTEMP.lines);
		//} else if (secondManip === 3){
		// Rotate Left // exactly same as rotating right on the second pass, ignore!
		//console.log("Rotating Left for second manip");
	} else {
		console.log("ERROR! second manip random is off: " + secondManip);
	}
	
	// Find right edge
	// possibly reflect across it or copy to it
	// Find bottom edge
	// possibly reflect across it or copy to it
	// keep bottom right corner
	// possibly rotate around it 90 degrees
	// or rotate and then reflect/copy
	// use bottom-right corner to bisect diagonally and reflect across that. Repeat some other step from before to distribute
	
	newDesignAdditions.postProductionDetails = postDetails;
	
	return newDesignAdditions;
};
