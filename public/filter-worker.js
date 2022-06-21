const Filters = {};

// uint8clampedarray clamps values >255 or <0 to 255 and 0, respectively (need not take min vs 255 or max vs 0)

Filters.brightness = (value, data, segmentLength) => {
	for (let i=0; i < segmentLength; i += 4) {
		data[i] = data[i] - value; // r
		data[i+1] = data[i+1] - value; // g
		data[i+2] = data[i+2] - value; // b
	}
};



onmessage = function(e) {
	const { value, currData, filter, length } = e.data;

	// const start = new Date().getTime();
	Filters[filter]( value, currData, length );

	console.log('started postMessage at' + this.performance.now())
	postMessage({
		// time: new Date().getTime() - start,
		newData: currData
	});
	console.log('finished postMessage at' + this.performance.now())
};