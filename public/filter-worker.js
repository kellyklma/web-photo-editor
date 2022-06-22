// filter-worker.js includes functionality for the web worker to filter image data
// according to brightness, contrast, grayscale, and invert filter parameters

// Performs brightness and contrast filters on the data array in the imageData object using a combination 
// of input brightness and contrast filtering factors.
// Also performs grayscale and inversion filtering if indicated by the boolean parameters.
// Note: uint8clampedarray clamps values >255 or <0 to 255 and 0, respectively (need not take min vs 255 or max vs 0)
function filter(brightness, contrast, grayscale, invert, imageData) {
		const data = imageData.data;
    const dataLength = data.length;
    brightness = Math.round(-255 * brightness / 100);
    contrast *= 2.55;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const c = -128 * factor + 128;
    for (let i=0; i < dataLength; i += 4) {
        data[i] = (data[i] - brightness)*factor + c; // r
        data[i+1] = (data[i+1] - brightness)*factor + c; // g
        data[i+2] = (data[i+2] - brightness)*factor + c; // b
    }
		grayscale && filterGrayscale(data, dataLength);
		invert && filterInvert(data, dataLength);
};

// Performs grayscale filtering of an image having the rgba values in dataArr. Changes the r, g, and b values (indices j, j+1, j+2) of dataArr
// to the average of those three values
function filterGrayscale(dataArr, len) {
	for (let j=0; j < len; j += 4) {
		const avg = (dataArr[j] + dataArr[j+1] + dataArr[j+2]) / 3;
		dataArr[j] = dataArr[j+1] = dataArr[j+2] = avg;
	}
}

// Performs inversion filtering of an image having the rgba values in dataArr. Inverts the rgb values (indices j, j+1, j+2) of dataArr
function filterInvert(dataArr, len) {
	for (let j=0; j < len; j += 4) {
		dataArr[j] = 255 - dataArr[j];
		dataArr[j+1] = 255 - dataArr[j+1];
		dataArr[j+2] = 255 - dataArr[j+2];
	}
}

// Handles receipt of a message from the main thread. Passes the received data into a function call to filter the data array in
// the provided image data object. Sends the object containing the filtered image data back to the main thread, as well as a variable
// indicating the time taken to perform all filtering.
onmessage = function(e) {
    const { brightness, contrast, grayscale, invert, currImageData } = e.data;
    const start = new Date().getTime();
    filter(brightness, contrast, grayscale, invert, currImageData);
    postMessage({
        time: new Date().getTime() - start,
        newImageData: currImageData
    });
};