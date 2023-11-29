// GrafJS.
var GrafJS = [];

function GrafCreate() {
	GrafJS.push([
		1,		// GrafStepX
		null,null,	// GrafCanvas, GrafCtx (graf itself)
		null,null,	// GrafCanvasTL, GrafCtxTL (timeline)
		[],		// GrafMatrix
		[],		// GrafMatrixTL
		[],		// GrafCollection (cpu, gpu, etc).
		0,		// LastTimelineRecorded
		null,		// GrafInfoBox
		null,null	// GageCanvas, GageCtx
	]);
}

function GrafLoad(Grafs,GrafJSIndex) {
	
	// Start Graf engine.
	PrepCanvases(GrafJSIndex);
	GrafJS[GrafJSIndex][7] = Grafs;
	
	// Prep initial Y coords for all inquired graphs.
	for (n=0; n<GrafJS[GrafJSIndex][7].length; n++) {
		GrafJS[GrafJSIndex][7][n][2] = GrafJS[GrafJSIndex][1].height;
		GrafJS[GrafJSIndex][7][n][3] = GrafJS[GrafJSIndex][1].height;
	}
	
	// Start engine.
	GrafEngine(GrafJSIndex);
}

function PrepCanvases(GrafJSIndex) {
	
	// Get the canvases.
	GrafJS[GrafJSIndex][1] = document.getElementById("Graf"+GrafJSIndex);
	GrafJS[GrafJSIndex][3] = document.getElementById("GrafTimeline"+GrafJSIndex);
	GrafJS[GrafJSIndex][10] = document.getElementById("GageBox"+GrafJSIndex);
	
	// Did we resize?
	var CurCanvasX = document.getElementById("Grafs").offsetWidth;
	if (CurCanvasX > GrafJS[GrafJSIndex][1].width || CurCanvasX < GrafJS[GrafJSIndex][1].width)
		GrafJS[GrafJSIndex][0] = GrafJS[GrafJSIndex][1].width - CurCanvasX;
	else
		GrafJS[GrafJSIndex][0] = 1;
	
	// Canvas properties and contexts.
	GrafJS[GrafJSIndex][1].width = CurCanvasX;
	GrafJS[GrafJSIndex][3].width = CurCanvasX;
	GrafJS[GrafJSIndex][10].width = CurCanvasX;
	GrafJS[GrafJSIndex][2] = GrafJS[GrafJSIndex][1].getContext("2d");
	GrafJS[GrafJSIndex][4] = GrafJS[GrafJSIndex][3].getContext("2d");
	GrafJS[GrafJSIndex][11] = GrafJS[GrafJSIndex][10].getContext("2d");
	GrafJS[GrafJSIndex][2].clearRect(-10,-10,GrafJS[GrafJSIndex][1].width+20,GrafJS[GrafJSIndex][1].height+20);
	GrafJS[GrafJSIndex][4].clearRect(-10,-10,GrafJS[GrafJSIndex][1].width+20,GrafJS[GrafJSIndex][1].height+20);
	GrafJS[GrafJSIndex][11].clearRect(-10,-10,GrafJS[GrafJSIndex][10].width+20,GrafJS[GrafJSIndex][10].height+20);
	
	// Default styling.
	GrafJS[GrafJSIndex][2].strokeStyle = "blue";
	GrafJS[GrafJSIndex][2].lineWidth = 2;
	GrafJS[GrafJSIndex][2].lineJoin = "round";
	GrafJS[GrafJSIndex][2].lineCap = "round";
	GrafJS[GrafJSIndex][2].translate(0.5,0.5);
	GrafJS[GrafJSIndex][2].font = "11px Verdana";
	GrafJS[GrafJSIndex][2].textBaseline = "middle";
	GrafJS[GrafJSIndex][4].font = "12px Verdana";
	GrafJS[GrafJSIndex][4].textAlign = "end";
	GrafJS[GrafJSIndex][4].textBaseline = "top";
}

function GrafEngine(GrafJSIndex) {
	
	// Handle resize.
	PrepCanvases(GrafJSIndex);
	
	// Local vars.
	var n,n2,newX;
	var lastX = GrafJS[GrafJSIndex][1].width;
	var TimelineTime;
	var GrafColor = "";
	var GageXPos = 30;
	
	// Horizontal value legends and numbers.
	GrafJS[GrafJSIndex][2].beginPath();
	GrafJS[GrafJSIndex][2].strokeStyle = "#ccc";
	GrafJS[GrafJSIndex][2].lineWidth = 1;
	// 80.
	GrafJS[GrafJSIndex][2].moveTo(20,0);
	GrafJS[GrafJSIndex][2].lineTo(20,GrafJS[GrafJSIndex][1].height);
	GrafJS[GrafJSIndex][2].moveTo(20,20);
	GrafJS[GrafJSIndex][2].lineTo(GrafJS[GrafJSIndex][1].width,20);
	GrafJS[GrafJSIndex][2].fillText("80",2,20);
	// 60.
	GrafJS[GrafJSIndex][2].moveTo(20,40);
	GrafJS[GrafJSIndex][2].lineTo(GrafJS[GrafJSIndex][1].width,40);
	GrafJS[GrafJSIndex][2].fillText("60",2,40);
	// 40.
	GrafJS[GrafJSIndex][2].moveTo(20,60);
	GrafJS[GrafJSIndex][2].lineTo(GrafJS[GrafJSIndex][1].width,60);
	GrafJS[GrafJSIndex][2].fillText("40",2,60);
	// 40.
	GrafJS[GrafJSIndex][2].moveTo(20,80);
	GrafJS[GrafJSIndex][2].lineTo(GrafJS[GrafJSIndex][1].width,80);
	GrafJS[GrafJSIndex][2].fillText("20",2,80);
	GrafJS[GrafJSIndex][2].stroke();
	
	// Set back line thickness for graphs.
	GrafJS[GrafJSIndex][2].lineWidth = 2;
	
	// Clean up old data outside X bounds in the matrixes.
	for (n=0; n<=GrafJS[GrafJSIndex][5].length-1; n++) {
		if (GrafJS[GrafJSIndex][5][n][0] <= 22) {
			GrafJS[GrafJSIndex][5].shift();
			n=0;
			continue;
		}
	}
	for (n=0; n<=GrafJS[GrafJSIndex][6].length-1; n++) {
		if (GrafJS[GrafJSIndex][6][n][0] <= 22) {
			GrafJS[GrafJSIndex][6].shift();
			n=0;
			continue;
		}
	}
	
	// Print GrafMatrix.
	for (n=0; n<=GrafJS[GrafJSIndex][5].length-1; n++) {
		
		// Update moving coordinates.
		GrafJS[GrafJSIndex][5][n][0] -= (GrafJS[GrafJSIndex][0]);
		GrafJS[GrafJSIndex][5][n][2] -= (GrafJS[GrafJSIndex][0]);
		
		// Draw line.
		GrafJS[GrafJSIndex][2].beginPath();
		GrafJS[GrafJSIndex][2].strokeStyle = GrafJS[GrafJSIndex][5][n][4];
		GrafJS[GrafJSIndex][2].moveTo(GrafJS[GrafJSIndex][5][n][0], GrafJS[GrafJSIndex][5][n][1]);
		GrafJS[GrafJSIndex][2].lineTo(GrafJS[GrafJSIndex][5][n][2], GrafJS[GrafJSIndex][5][n][3]);
		GrafJS[GrafJSIndex][2].stroke();
		
		// Record the last point for the new line.
		lastX = GrafJS[GrafJSIndex][5][n][2];
		
		// LastY for each graph in the collection.
		GrafColor = GrafJS[GrafJSIndex][5][n][4];
		for (n2=0; n2<GrafJS[GrafJSIndex][7].length; n2++) {
			if (GrafColor.includes(GrafJS[GrafJSIndex][7][n2][1]))
				GrafJS[GrafJSIndex][7][n2][2] = GrafJS[GrafJSIndex][5][n][3];
		}
	}
	
	// Print GrafMatrixTL (timeline).
	for (n=0; n<=GrafJS[GrafJSIndex][6].length-1; n++) {
		
		// Update moving coordinates.
		GrafJS[GrafJSIndex][6][n][0] -= (GrafJS[GrafJSIndex][0]);
		
		// Draw text.
		GrafJS[GrafJSIndex][4].fillText(
			GrafJS[GrafJSIndex][6][n][2], 
			GrafJS[GrafJSIndex][6][n][0], 
			GrafJS[GrafJSIndex][6][n][1]
		);
	}
	
	// Calculate new X coordinate for new graf points.
	newX = lastX+1;
	
	// Draw new lines/points.
	for (n=0; n<GrafJS[GrafJSIndex][7].length; n++) {
		GrafJS[GrafJSIndex][2].beginPath();
		GrafJS[GrafJSIndex][2].strokeStyle = GrafJS[GrafJSIndex][7][n][1];
		GrafJS[GrafJSIndex][2].moveTo(lastX,GrafJS[GrafJSIndex][7][n][2]);
		GrafJS[GrafJSIndex][2].lineTo(newX,GrafJS[GrafJSIndex][7][n][3]);
		GrafJS[GrafJSIndex][2].stroke();
	
		// Record it.
		GrafJS[GrafJSIndex][5].push([
			lastX,
			GrafJS[GrafJSIndex][7][n][2],
			newX,
			GrafJS[GrafJSIndex][7][n][3],
			GrafJS[GrafJSIndex][7][n][1]
		]);
		
		// Update gage.
		var GageXPos;
		var GageValuePos = 0;
		var GageColor = ((100 - GrafJS[GrafJSIndex][7][n][3]) >= 80 ?"red":"green");
		var PercentStepValue = Math.PI/100;
		var PercentStep = GrafJS[GrafJSIndex][7][n][3];
		GrafJS[GrafJSIndex][11].font = "11px Verdana";
		GrafJS[GrafJSIndex][11].lineWidth = 5;
		
		// Percent handling.
		if ((100-PercentStep) < 10)
			GageValuePos = 2;
		else if ((100-PercentStep) < 100)
			GageValuePos = 6;
		else if ((100-PercentStep) == 100)
			GageValuePos = 10;
		
		//BGcolor.
		GrafJS[GrafJSIndex][11].beginPath();
		GrafJS[GrafJSIndex][11].arc(GageXPos,20,15,Math.PI,(Math.PI*2));
		GrafJS[GrafJSIndex][11].strokeStyle = "#eee";
		GrafJS[GrafJSIndex][11].stroke();
		// Front color.
		GrafJS[GrafJSIndex][11].beginPath();
		GrafJS[GrafJSIndex][11].arc(GageXPos,20,15,Math.PI,(Math.PI*2)-PercentStepValue*PercentStep);
		GrafJS[GrafJSIndex][11].strokeStyle = GageColor;
		GrafJS[GrafJSIndex][11].stroke();
		// Name.
		GrafJS[GrafJSIndex][11].beginPath();
		GrafJS[GrafJSIndex][11].fillStyle = GrafJS[GrafJSIndex][7][n][1];
		GrafJS[GrafJSIndex][11].fillText(GrafJS[GrafJSIndex][7][n][0],GageXPos-(GrafJS[GrafJSIndex][7][n][0].length*3),30);
		GrafJS[GrafJSIndex][11].stroke();
		// Value.
		GrafJS[GrafJSIndex][11].beginPath();
		GrafJS[GrafJSIndex][11].font = "10px Verdana";
		GrafJS[GrafJSIndex][11].fillStyle = "#000";
		GrafJS[GrafJSIndex][11].fillText(100-PercentStep,GageXPos-GageValuePos,20);
		GrafJS[GrafJSIndex][11].stroke();
		
		// GageXPos
		GageXPos += 80;
	}
	
	// Handle timeline.
	if (GrafJS[GrafJSIndex][8] == 0 || Date.now() - GrafJS[GrafJSIndex][8] >= 120000) {
		
		TimelineTime = GrafTimelineTime();
		GrafJS[GrafJSIndex][4].fillText(TimelineTime,GrafJS[GrafJSIndex][3].width,2);
		GrafJS[GrafJSIndex][6].push([GrafJS[GrafJSIndex][3].width,2,TimelineTime]);
		GrafJS[GrafJSIndex][8] = Date.now();
	}
	
	// Loop it.
	setTimeout(GrafEngine,1000,GrafJSIndex);
}

function GrafUpdate(name,value,GrafJSIndex) {
	var n,g;
	
	// Find value in collection and update it.
	// We get our value in positive but will convert it to negative as canvas heights is in reverse.
	for (n=0; n<GrafJS[GrafJSIndex][7].length; n++) 
		if (GrafJS[GrafJSIndex][7][n][0] == name) 
			GrafJS[GrafJSIndex][7][n][3] = (100-value);
		
	// Keep values within vertical limits.
	for (n=0; n<GrafJS[GrafJSIndex][7].length; n++) {
		GrafJS[GrafJSIndex][7][n][3] = (GrafJS[GrafJSIndex][7][n][3]<0?0:GrafJS[GrafJSIndex][7][n][3]);
		GrafJS[GrafJSIndex][7][n][3] = (GrafJS[GrafJSIndex][7][n][3]>GrafJS[GrafJSIndex][1].height?GrafJS[GrafJSIndex][1].height:GrafJS[GrafJSIndex][7][n][3]);
	}
}

function GrafTimelineTime() {
	var d = new Date();
	var h = (d.getHours()<10 ? "0"+ d.getHours() : d.getHours());
	var m = (d.getMinutes()<10 ? "0"+ d.getMinutes() : d.getMinutes());
	
	return h +":"+ m;
}
// GrafJS.