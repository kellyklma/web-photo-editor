// Run brightness filter and contrast filter at once
function filter(value_b, value_c, data) {
	const dataLength = data.length;
	value_b = Math.round(-255 * value_b / 100);
	value_c *= 2.55;
	const factor = (259 * (value_c + 255)) / (255 * (259 - value_c));
	const c = -128 * factor + 128;
	// uint8clampedarray clamps values >255 or <0 to 255 and 0, respectively (need not take min vs 255 or max vs 0)
	for (let i=0; i < dataLength; i += 4) {
		data[i] = (data[i] - value_b)*factor + c; // r
		data[i+1] = (data[i+1] - value_b)*factor + c; // g
		data[i+2] = (data[i+2] - value_b)*factor + c; // b
	}
};

onmessage = function(e) {
	const { brightness, contrast, currImageData } = e.data;
	const start = new Date().getTime();
	filter( brightness, contrast, currImageData.data );
	postMessage({
		time: new Date().getTime() - start,
		newImageData: currImageData
	});
};