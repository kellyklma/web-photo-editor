const Filters = {};

Filters.brightness = (value, data) => {
	const dataLength = data.length;
	value = Math.round(-255 * value / 100);
	// uint8clampedarray clamps values >255 or <0 to 255 and 0, respectively (need not take min vs 255 or max vs 0)
	for (let i=0; i < dataLength; i += 4) {
		data[i] = data[i] - value; // r
		data[i+1] = data[i+1] - value; // g
		data[i+2] = data[i+2] - value; // b
	}
	return data;
};
// function brightnessWorker(value, data) {

// };

onmessage = function(e) {
	const { brightness, currImageData, filter } = e.data;
	const start = new Date().getTime();
	Filters[filter]( brightness, currImageData.data );
	postMessage({
		time: new Date().getTime() - start,
		newImageData: currImageData
	});
};