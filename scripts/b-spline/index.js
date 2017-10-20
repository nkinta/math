function interpolateAlgo3(pointLength, degree, drawCurveFunc, crearFunc, knots) {

	// var knots = [0, 0.01, 0.02, 0.03, 1.5, 2.5, 3.00000000000000, 3.04, 3.05, 3.0599999999999996];

	if(!knots) {
		// build knot vector of length [pointLength + degree + 1]
		var knots = [];
		var value = 0.0;
		for(i = 0; i < pointLength + 2 * degree; i++) {
			knots[i] = value;
			if (degree - 1 < i && i < pointLength + degree - 1) {
				value = value + 1.0;
			}
			else {
				value = value + 1.0;
			}
			
		}
	}
	
	console.log(knots);
	
	var kfuncList = []

	var valueStructArray = []; 
	
	for (var i = 0; i < degree + 1; ++i) {
		valueStructArray.push([]);
	}
	
	function convolution(inputArray1, inputArray2) {
	
		/*
		tempArray1 = []
		for (var i = 0; i < inputArray1.length; ++i) {
			var tempArray2 = [];
			for (var pushZero = 0; pushZero < i; pushZero++) {
				tempArray2.push(0.0);
			}
			for (var j = 0; j < inputArray2.length; ++j) {
				tempArray2.push(inputArray1[j] * inputArray1[i]);
			}
			for (var pushZero = 0; pushZero < inputArray2.length - i; pushZero++) {
				tempArray2.push(0.0);
			}
			tempArray1.push(tempArray2)
		}
		*/
		
		var resultArray = [];

		for (var i = 0; i < inputArray1.length + inputArray2.length - 1; ++i) {
			var value = 0.0;
			var k = 0;
			for (var j = i; j >= 0; --j) {
				if (!(k < inputArray1.length)) {
					break;
				}
				if (j < inputArray2.length) {
					value += inputArray1[k] * inputArray2[j];
				}
				++k;
			}
			resultArray.push(value);
		}
		
		// resultArray.reverse();
		
		return resultArray;
	}
	function addArray(inputArray1, inputArray2) {
	
		var max = 0;
		if (inputArray1.length >= inputArray2.length) {
			max = inputArray1.length;
		}
		else {
			max = inputArray2.length;
		}
		
		var resultArray = [];
		for (var i = 0; i < max; ++i) {
			
			var value1 = 0.0;
			var value2 = 0.0;
			if (i  < inputArray1.length) {
				value1 = inputArray1[i];
			}
			if (i  < inputArray2.length) {
				value2 = inputArray2[i];
			}
			
			resultArray.push(value1 + value2);
		}
		
		return resultArray;
	
	}
	
	function drawDiv(knots, coefficientDataArray) {
	
		for (var coefficientData of coefficientDataArray) {
			console.log(coefficientData);
			var tStart = knots[coefficientData.div];
			var tEnd = knots[coefficientData.div + 1];
			
			var coe = coefficientData.coefficient;
			
			var tRate = (tEnd - tStart) / 10.0;
			
			var tArrayLength = coe.length;
			
			var pointArray = []
			for (var t = tStart; t < tEnd; t += tRate) {
				
				var tArray = [];
				/*
				var tTemp = 1.0;
				for (var i = 0; i < tArrayLength; ++i) {
					tArray.push(tTemp);
					tTemp = tTemp * t;
				}
				*/
				var tTemp = t;
				for (var i = 0; i < tArrayLength; ++i) {
					tArray.push(tTemp);
					tTemp =  (1 / (i + 1)) * tTemp * t;
				}
				
				var value = 0.0;
				for (var i = 0; i < coe.length; ++i) {
					value += coe[i] * tArray[i];
				}
				
				
				var point = new Object();
				point.x = t;
				point.y = value;
				pointArray.push(point);
			}
			
			drawCurveFunc(pointArray);
			
			
 		}
	}
	
	var nfunc = function f(k, i, div) {
	
		if (k == 0) {
			if (i == div) {
				return [1.0];
			}
			else {
				return [0.0];
			}
		}
		else {
			var value1 = f(k - 1, i, div);
			var value2 = f(k - 1, i + 1, div);
			var denominator1 = (knots[i + k] - knots[i]);
			var rate1 = [ 1.0 / denominator1, (- knots[i]) / denominator1];
			var denominator2 = (knots[i + k + 1]  - knots[i + 1]);
			var rate2 = [ -1.0 / denominator2, (knots[i + k + 1]) / denominator2]; // [(knots[i + k + 1] - t) / (knots[i + k + 1]  - knots[i + 1])];
			var result = addArray(convolution(rate1, value1), convolution(rate2, value2));
			
			return result;
		}
	};
	
	linePointsArray = []
	for (var p = 0; p < pointLength + degree - 1; ++p) {
		var coefficientDataArray = []
		for (var div = 0; div < knots.length - 1; ++div) {
			var coefficient = nfunc(degree, p, div);
			coefficient.reverse();
			var coefficientData = new Object();
			coefficientData.div = div;
			coefficientData.coefficient = coefficient;
			coefficientDataArray.push(coefficientData)
		}
		
		drawDiv(knots, coefficientDataArray);
		// drawCurveFunc(linePoints);
		linePointsArray.push(coefficientDataArray);
	}
	
	return linePointsArray;


}

function interpolateAlgo(rate, degree, points, knots, weights, result) {

	// function-scoped iteration variables
	var pointLength = points.length;		// points count

	if(degree < 1) throw new Error('degree must be at least 1 (linear)');
	if(degree > (pointLength - 1)) throw new Error('degree must be less than or equal to point count - 1');

	if(!weights) {
		// build weight vector of length [n]
		weights = [];
		for(i = 0; i < pointLength; i++) {
			weights[i] = 1;
		}
	}

	if(!knots) {
		// build knot vector of length [pointLength + degree + 1]
		var knots = [];
		for(i = 0; i < pointLength + degree + 1; i++) {
			knots[i] = i;
		}
	} else {
			if(knots.length !== pointLength + degree + 1) throw new Error('bad knot vector length');
	}
	

	var domain = new Object();
	domain.start = degree - 1;
	domain.end = knots.length - 1 - (degree - 1);

	// remap t to the domain where the spline is defined
	var t = rate * (knots[domain.end] - knots[domain.start]) + knots[domain.start];

	console.log("domain", domain);
	console.log(knots);

	if(t < domain.start) {
		t = knots[domain.start];
	}
	else if (t > domain.end) {
		t = knots[domain.end];
	}

	// find s (the spline segment) for the [t] value provided
	for(var s = domain.start; s < domain.end; s++) {
		if(t >= knots[s] && t <= knots[s+1]) {
			var currentDomain = s;
			break;
		}
	}
	console.log("currentDomain", currentDomain);

	// convert points to homogeneous coordinates
	var v = [];
	var w = [];
	for(var i = 0; i < pointLength; i++) {
		v[i] = points[i] * weights[i];
		w[i] = weights[i];
	}

	// l (level) goes from 1 to the curve degree + 1
	var alpha;
	for(var l = 1; l <= degree; l++) {
		// build level l of the pyramid

		for(var i = currentDomain; i > currentDomain - (degree) + l; i--) {
			alpha = (t - knots[i]) / (knots[i + degree + 1 - l] - knots[i]);
			
			var value = v[i];
			var valueBefore = v[i - 1];

			v[i] = (1 - alpha) * valueBefore + alpha * value;
			w[i] = 1.0;
			
			/*
			v[index] = (1 - alpha) * v[index - 1] + alpha * v[index];
			w[index] = (1 - alpha) * w[index - 1] + alpha * w[index]; // weight

			v[i] = (1 - alpha) * v[i - 1] + alpha * v[i];
			w[i] = (1 - alpha) * w[i - 1] + alpha * w[i];
			*/
		}
	}

	// convert back to cartesian and return
	/*
	var result = result || [];
	for(i=0; i<d; i++) {
		result[i] = v[s][i] / v[s][d];
	}
	*/
	var result = new Object();
	
	result.y = v[currentDomain] / w[currentDomain];
	result.x = t;

	return result;
}




function interpolateAlgo2(pointLength, degree, drawCurveFunc, crearFunc, knots) {

	// var knots = [0, 0.01, 0.02, 0.03, 1.5, 2.5, 3.00000000000000, 3.04, 3.05, 3.0599999999999996];

	if(!knots) {
		// build knot vector of length [pointLength + degree + 1]
		var knots = [];
		var value = 0.0;
		for(i = 0; i < pointLength + 2 * degree; i++) {
			knots[i] = value;
			if (degree - 1 < i && i < pointLength + degree - 1) {
				value = value + 1.0;
			}
			else {
				value = value + 1.0;
			}
			
		}
	}
	
	console.log(knots);
	
	var kfuncList = []

	var valueStructArray = []; 
	
	for (var i = 0; i < degree + 1; ++i) {
		valueStructArray.push([]);
	}
	
	var nfunc = function f(k, i, t) {
	
		if (k == 0) {
			if (knots[i] <= t && t < knots[i+1]) {
				return 1.0;
			}
			else {
				return 0.0;
			}
		}
		else {
			var value1 = f(k - 1, i, t);
			var value2 = f(k - 1, i + 1, t);
			var rate1 = (t - knots[i]) / (knots[i + k] - knots[i]);
			var rate2 = (knots[i + k + 1] - t) / (knots[i + k + 1]  - knots[i + 1]);
			var result = rate1 * value1 + rate2 * value2;
			
			var value1Point = new Object();
			var value2Point = new Object();
			var rate1Point = new Object();
			var rate2Point = new Object();
			var resultPoint = new Object();
			
			value1Point.x = t;
			value2Point.x = t;
			rate1Point.x = t;
			rate2Point.x = t;
			resultPoint.x = t;

			value1Point.y = value1;
			value2Point.y = value2;
			rate1Point.y = rate1;
			rate2Point.y = rate2;
			resultPoint.y = result;
			
			var valueStruct = new Object();
			
			if (valueStructArray[k][i] == undefined) {
				var valueStruct = new Object();
				valueStructArray[k][i] = valueStruct;
				valueStruct.value1Array = [];
				valueStruct.value2Array = [];
				valueStruct.rate1Array = [];
				valueStruct.rate2Array = [];
				valueStruct.resultArray = [];
			}
			
			valueStructArray[k][i].value1Array.push(value1Point);
			valueStructArray[k][i].value2Array.push(value2Point);
			valueStructArray[k][i].rate1Array.push(rate1Point);
			valueStructArray[k][i].rate2Array.push(rate2Point);
			valueStructArray[k][i].resultArray.push(resultPoint);
		
			return result;
		}
	};
	
	linePointsArray = []
	for (var p = 0; p < pointLength + degree - 1; ++p) {
		var linePoints = []
		for (var j = 0; j < knots.length - 1; ++j) {
			var lineKnotsPoints = []
			for (var t = knots[j]; t < knots[j + 1]; t = t + 0.1) {
				var value = nfunc(degree, p, t);
				console.log(t, value);
				var linePoint = new Object();
				linePoint.x = t;
				linePoint.y = value;
				lineKnotsPoints.push(linePoint)
			}
			linePoints = linePoints.concat(lineKnotsPoints);
			
			console.log(value);
			
		}
		
		for (var d = 0; d < valueStructArray.length; ++d) {
			var temp = valueStructArray[d];
			for (var j = 0; j < temp.length; ++j) {
				crearFunc();
				drawCurveFunc(temp[j].value1Array);
				drawCurveFunc(temp[j].rate1Array);
				drawCurveFunc(temp[j].value2Array);
				drawCurveFunc(temp[j].rate2Array);
				crearFunc();
				drawCurveFunc(temp[j].resultArray);
			}
		}
				
		drawCurveFunc(linePoints);
		linePointsArray.push(linePoints);
	}
	
	return linePointsArray;


}

function interpolateAlgo(rate, degree, points, knots, weights, result) {

	// function-scoped iteration variables
	var pointLength = points.length;		// points count

	if(degree < 1) throw new Error('degree must be at least 1 (linear)');
	if(degree > (pointLength - 1)) throw new Error('degree must be less than or equal to point count - 1');

	if(!weights) {
		// build weight vector of length [n]
		weights = [];
		for(i = 0; i < pointLength; i++) {
			weights[i] = 1;
		}
	}

	if(!knots) {
		// build knot vector of length [pointLength + degree + 1]
		var knots = [];
		for(i = 0; i < pointLength + degree + 1; i++) {
			knots[i] = i;
		}
	} else {
			if(knots.length !== pointLength + degree + 1) throw new Error('bad knot vector length');
	}
	

	var domain = new Object();
	domain.start = degree - 1;
	domain.end = knots.length - 1 - (degree - 1);

	// remap t to the domain where the spline is defined
	var t = rate * (knots[domain.end] - knots[domain.start]) + knots[domain.start];

	console.log("domain", domain);
	console.log(knots);

	if(t < domain.start) {
		t = knots[domain.start];
	}
	else if (t > domain.end) {
		t = knots[domain.end];
	}

	// find s (the spline segment) for the [t] value provided
	for(var s = domain.start; s < domain.end; s++) {
		if(t >= knots[s] && t <= knots[s+1]) {
			var currentDomain = s;
			break;
		}
	}
	console.log("currentDomain", currentDomain);

	// convert points to homogeneous coordinates
	var v = [];
	var w = [];
	for(var i = 0; i < pointLength; i++) {
		v[i] = points[i] * weights[i];
		w[i] = weights[i];
	}

	// l (level) goes from 1 to the curve degree + 1
	var alpha;
	for(var l = 1; l <= degree; l++) {
		// build level l of the pyramid

		for(var i = currentDomain; i > currentDomain - (degree) + l; i--) {
			alpha = (t - knots[i]) / (knots[i + degree + 1 - l] - knots[i]);
			
			var value = v[i];
			var valueBefore = v[i - 1];

			v[i] = (1 - alpha) * valueBefore + alpha * value;
			w[i] = 1.0;
			
			/*
			v[index] = (1 - alpha) * v[index - 1] + alpha * v[index];
			w[index] = (1 - alpha) * w[index - 1] + alpha * w[index]; // weight

			v[i] = (1 - alpha) * v[i - 1] + alpha * v[i];
			w[i] = (1 - alpha) * w[i - 1] + alpha * w[i];
			*/
		}
	}

	// convert back to cartesian and return
	/*
	var result = result || [];
	for(i=0; i<d; i++) {
		result[i] = v[s][i] / v[s][d];
	}
	*/
	var result = new Object();
	
	result.y = v[currentDomain] / w[currentDomain];
	result.x = t;

	return result;
}



function interpolate(t, degree, points, knots, weights, result) {

	var i,j,s,l;							// function-scoped iteration variables
	var n = points.length;		// points count
	var d = points[0].length; // point dimensionality

	if(degree < 1) throw new Error('degree must be at least 1 (linear)');
	if(degree > (n-1)) throw new Error('degree must be less than or equal to point count - 1');

	if(!weights) {
		// build weight vector of length [n]
		weights = [];
		for(i=0; i<n; i++) {
			weights[i] = 1;
		}
	}

	if(!knots) {
		// build knot vector of length [n + degree + 1]
		var knots = [];
		for(i=0; i<n+degree+1; i++) {
			knots[i] = i;
		}
	} else {
		if(knots.length !== n+degree+1) throw new Error('bad knot vector length');
	}

	var domain = [
		degree,
		knots.length-1 - degree
	];

	// remap t to the domain where the spline is defined
	var low	= knots[domain[0]];
	var high = knots[domain[1]];
	t = t * (high - low) + low;

	if(t < low || t > high) throw new Error('out of bounds');

	// find s (the spline segment) for the [t] value provided
	for(s=domain[0]; s<domain[1]; s++) {
		if(t >= knots[s] && t <= knots[s+1]) {
			break;
		}
	}

	// convert points to homogeneous coordinates
	var v = [];
	for(i=0; i<n; i++) {
		v[i] = [];
		for(j=0; j<d; j++) {
			v[i][j] = points[i][j] * weights[i];
		}
		v[i][d] = weights[i];
	}

	// l (level) goes from 1 to the curve degree + 1
	var alpha;
	for(l=1; l<=degree+1; l++) {
		// build level l of the pyramid
		for(i=s; i>s-degree-1+l; i--) {
			alpha = (t - knots[i]) / (knots[i+degree+1-l] - knots[i]);

			// interpolate each component
			for(j=0; j<d+1; j++) {
				v[i][j] = (1 - alpha) * v[i-1][j] + alpha * v[i][j];
			}
		}
	}

	// convert back to cartesian and return
	var result = result || [];
	for(i=0; i<d; i++) {
		result[i] = v[s][i] / v[s][d];
	}

	return result;
}

