
function interpolateAlgo2(pointLength, degree, drawCurveFunc, knots) {

	var knots = [0, 0.01, 0.02, 0.03, 1.5, 2.5, 3.00000000000000, 3.04, 3.05, 3.0599999999999996];

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
				value = value + 0.01;
			}
			
		}
	}
	
	console.log(knots);
	
	var kfuncList = []
	
	var nfunc = function f(i, k, t) {
	
		if (k == 0) {
			if (knots[i] <= t && t < knots[i+1]) {
				return 1.0;
			}
			else {
				return 0.0;
			}
		}
		else {
			var value1 = f(i, k - 1, t);
			var value2 = f(i + 1, k - 1, t);
			var rate1 = (t - knots[i]) / (knots[i + k] - knots[i]);
			var rate2 = (knots[i + k + 1] - t) / (knots[i + k + 1]  - knots[i + 1]);
			var result = rate1 * value1 + rate2 * value2;
			return result;
		}
	};
	
	linePointsArray = []
	for (var j = 0; j < pointLength + degree - 1; ++j) {
		var linePoints = []
		for (var i = 0; i < knots.length - 1; ++i) {
			var lineKnotsPoints = []
			for (var t = knots[i]; t < knots[i + 1]; t = t + 0.1) {
				var value = nfunc(j, degree, t);
				console.log(t, value);
				var linePoint = new Object();
				linePoint.x = t;
				linePoint.y = value;
				lineKnotsPoints.push(linePoint)
			}
			linePoints = linePoints.concat(lineKnotsPoints);
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

