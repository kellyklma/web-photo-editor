// Editor.js performs basic image filtering functionality.

import React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';

// Designates colors for material UI components: sliders, switches, labels
const theme = createTheme({
    palette: {
      primary: {
        light: '#757ce8',
        main: '#fafafa',
        dark: '#002884',
        contrastText: '#fff',
      },
      secondary: {
        light: '#ff7961',
        main: '#757575',
        dark: '#ba000d',
        contrastText: '#000',
      },
    },
  });

export default class Editor extends React.Component {
    constructor(props) {
      super(props);
			this.revert = this.revert.bind(this);
      this.handleDownload = this.handleDownload.bind(this);
			this.handleUpload = this.handleUpload.bind(this);

      this.handleGrayscale = this.handleGrayscale.bind(this);
      this.handleInvert = this.handleInvert.bind(this);
      this.filterGrayscale = this.filterGrayscale.bind(this);
			this.filterInvert = this.filterInvert.bind(this);

      this.getOriginal = this.getOriginal.bind(this);

      this.changedBrightness = this.changedBrightness.bind(this);
      this.changedContrast = this.changedContrast.bind(this);
      this.handleBrightness = this.handleBrightness.bind(this);
      this.handleContrast = this.handleContrast.bind(this);
 
      this.runFilters = this.runFilters.bind(this);

      this.state = {
        originalImageData: this.props.originalImageData, // differentiates new image from old
        brightnessValue: 0,
        contrastValue: 0,
				grayscaleChecked: false,
				invertChecked: false,
        worker: this.props.worker
      }
    }

    // Recognizes upload of a new image (Editor re-rendered by Content.js) and resets state variables to default values
		componentDidUpdate(prevProps) {
			if (prevProps.originalImageData !== this.props.originalImageData) {
				this.setState({ 
          originalImageData: this.props.originalImageData,
					brightnessValue: 0,
					contrastValue: 0,
          grayscaleChecked: false,
          invertChecked: false
				});
			}
		}

		// Upon click of revert button, resets state variables to their default values and removes all image filtering
		revert() {
			this.setState( { brightnessValue: 0, contrastValue: 0, grayscaleChecked: false, invertChecked: false });
			this.runFilters(0, 0, false, false);
		}

    // Upon click of download button, downloads the filtered canvas data in jpeg format to the user's file system
    handleDownload(event) {
			const imageData = document.getElementById("image-canvas").toDataURL('image/jpeg', 0.8);
			let tempLink = document.createElement('a');
			tempLink.download = 'edited.jpeg';
			tempLink.href = imageData;
			document.body.appendChild(tempLink);
			tempLink.click();
			document.body.removeChild(tempLink);
    }

    // Upon click of upload button, displays file browser to allow selection of another photo to edit. 
    // Selection is handled in Content.js and in componentDidUpdate() above
		handleUpload(event) {
			document.getElementById("browse-files").click();
		}

    // Upon toggling the grayscale filter switch, updates the grayscale state variable and calls a 
    // function to either perform or remove grayscale filtering according to the grayscale state
		handleGrayscale(event) {
      this.setState( { grayscaleChecked : event.target.checked } );
      event.target.checked && this.filterGrayscale(document.getElementById("image-canvas"));
      !event.target.checked && this.runFilters(this.state.brightnessValue, this.state.contrastValue, event.target.checked, this.state.invertChecked);
		}

    // Updates the invert state variable and calls a function to perform the invert filter upon toggling of the invert filter switch
		handleInvert(event) {
      this.setState( { invertChecked : event.target.checked } );
      this.filterInvert(document.getElementById("image-canvas"));
		}

    // Performs grayscale filtering of data on the canvas imgCanvas by replacing the r, g, and b intensities in the data array 
    // with the average of the three colors' intensities
    filterGrayscale(imgCanvas) {
			const ctx = imgCanvas.getContext('2d');
			const imageData = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
			const data = imageData.data;
      const dataLength = data.length;
			for (let i=0; i<dataLength; i += 4) {
				const avg = (data[i] + data[i+1] + data[i+2]) / 3;
				data[i] = data[i+1] = data[i+2] = avg;
			}
			ctx.putImageData(imageData, 0, 0);
    }

    // Performs inversion filtering of data on the canvas imgCanvas by taking the inverse of all rgb intensities in
    // the data array: (255 - r), (255 - g), (255 - b)
		filterInvert(imgCanvas) {
			const ctx = imgCanvas.getContext('2d');
			const imageData = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
			const data = imageData.data;
      const dataLength = data.length;
			for (let i=0; i<dataLength; i += 4) {
				data[i] = 255 - data[i];
				data[i+1] = 255 - data[i+1];
				data[i+2] = 255 - data[i+2];
			}
			ctx.putImageData(imageData, 0, 0);
		}
  
    // Replaces data of canvas imgCanvas with the original image data
    getOriginal(imgCanvas) {
      const myImg = document.getElementById("image-upload");
      imgCanvas.width = myImg.naturalWidth;
      imgCanvas.height = myImg.naturalHeight;
      imgCanvas.naturalWidth = myImg.naturalWidth;
      imgCanvas.naturalHeight = myImg.naturalHeight;
      const ctx = imgCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(myImg, 0, 0, myImg.naturalWidth, myImg.naturalHeight);
    }

    // Update brightness state variable and re-renders view to show new slider value with each change of brightness slider
    changedBrightness(event, newBrightness) {
      (newBrightness !== this.state.brightnessValue) && this.setState( { brightnessValue : newBrightness });
    }

    // Updates contrast state variable and re-renders view to show new slider value with each change of contrast slider
    changedContrast(event, newContrast) {
      (newContrast !== this.state.contrastValue) && this.setState( { contrastValue : newContrast });
    }
  
    // Calls a function to perform image filtering with new brightness filtering value newBrightness upon committed change of brightness slider
    handleBrightness(event, newBrightness) {
      this.runFilters(newBrightness, this.state.contrastValue, this.state.grayscaleChecked, this.state.invertChecked);
    }
  
    // Calls a function to perform image filtering with new contrast filtering value newContrast upon committed change of contrast slider
    handleContrast(event, newContrast) {
      this.runFilters(this.state.brightnessValue, newContrast, this.state.grayscaleChecked, this.state.invertChecked);
    }

    // Delegates web worker to filter in sequence the original data according to filtering parameters 
    // brightness, contrast, grayscale, and invert. Displays the final product on the onscreen canvas.
		runFilters(brightness, contrast, grayscale, invert) {
      const t0 = performance.now();

      // Create temporary canvas to hold original data and editing progress
      const canvas = document.createElement("canvas");
      this.getOriginal(canvas);
      const tempCtx = canvas.getContext('2d');
			const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

      // Delegate brightness, contrast, grayscale, and inversion filtering of canvas data to web worker
      const worker = this.state.worker;
      const promise = new Promise(function(resolve, reject) {
        if (brightness === 0 && contrast === 0) { resolve(imageData); } 
        worker.postMessage({ 
          brightness: brightness, // integer
          contrast: contrast, // integer
          grayscale: grayscale, // boolean
          invert: invert, // boolean
          currImageData: imageData
        });
        worker.onerror = (err) => {
          reject(new Error(err));
        };
        worker.onmessage = function(e) {
          const { time, newImageData } = e.data;
          console.log(time);
          tempCtx.putImageData(newImageData, 0, 0);
          resolve(newImageData);
        };
      });

      // Once filtering is complete, draws temporary canvas data onto actual onscreen canvas
			promise.then(() => {
        const imageCanvas = document.getElementById("image-canvas");
        const ctx = imageCanvas.getContext('2d');
        ctx.putImageData(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height), 0, 0);

        const t1 = performance.now();
        console.log("filtering took " + (t1-t0)); 
      });
		}

    render() {
      return (
        <div id="editor"> 
          <div id="revert-upload">
            <button id="editor-revert" className="editor-btn" onClick={this.revert}><HistoryIcon/></button>
            <button id="editor-download" className="editor-btn" onClick={this.handleDownload}><DownloadIcon/></button>
            <button id="editor-upload" className="editor-btn" onClick={this.handleUpload}>Upload</button>
            
          </div>
					
          
          <hr className="section-divider"></hr>
          <ThemeProvider theme={theme}>
            <Typography id="brightness-label" color="primary.contrastText" >Brightness</Typography>
            <Slider 
              id="brightness-slider" 
              aria-label="Brightness slider" 
              value={this.state.brightnessValue} 
              min={-100} 
              max={100} 
              valueLabelDisplay="auto" 
              onChange={this.changedBrightness}
              onChangeCommitted={this.handleBrightness}
            />
            <Typography id="contrast-label" color="primary.contrastText" >Contrast</Typography>
            <Slider 
              id="contrast-slider" 
              aria-label="Saturation slider" 
              value={this.state.contrastValue} 
              min={-100} 
              max={100} 
              valueLabelDisplay="auto" 
              onChange={this.changedContrast}
              onChangeCommitted={this.handleContrast}
            />
            <hr className="section-divider"></hr>
            <FormGroup>
              <FormControlLabel id="grayscale-label" control={
                <Switch 
                  checked={this.state.grayscaleChecked}
                  onChange={this.handleGrayscale}
                  inputProps={{ 'aria-label': 'grayscale switch'}} 
                />
              } label="Grayscale" color="primary.contrastText" />
              <FormControlLabel id="invert-label" control={
                <Switch 
                  checked={this.state.invertChecked}
                  onChange={this.handleInvert}
                  inputProps={{ 'aria-label': 'invert switch'}} 
                />
              } label="Invert" color="primary.contrastText" />
            </FormGroup>
          </ThemeProvider>
         
        </div>
      );
    }
  }