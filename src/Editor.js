import React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
      this.grayscale = this.grayscale.bind(this);
			this.invert = this.invert.bind(this);

      this.getOriginal = this.getOriginal.bind(this);
      this.filterBrightness = this.filterBrightness.bind(this);
			this.filterContrast = this.filterContrast.bind(this);
      this.handleBrightness = this.handleBrightness.bind(this);
      this.handleContrast = this.handleContrast.bind(this);
      this.runFilters = this.runFilters.bind(this);

      this.state = {
        originalImageData: this.props.originalImageData,
        brightnessValue: 0,
        contrastValue: 0,
				grayscaleChecked: false,
				invertChecked: false
      }
    }

    // Recognize upload of new image and reset state variables
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

		// Put originalImageData on the canvas and reset values
		revert() {
			this.setState( { brightnessValue: 0, contrastValue: 0, grayscaleChecked: false, invertChecked: false });
			this.runFilters(0, 0, false, false);
		}

    handleDownload(event) {
			const imageData = document.getElementById("image-canvas").toDataURL('image/jpeg', 0.8);
			let tempLink = document.createElement('a');
			tempLink.download = 'edited.jpeg';
			tempLink.href = imageData;
			document.body.appendChild(tempLink);
			tempLink.click();
			document.body.removeChild(tempLink);
    }

		handleUpload(event) {
			console.log("handleUpload");
			document.getElementById("browse-files").click();
		}

		handleGrayscale(event) {
      this.setState( { grayscaleChecked : event.target.checked } );
      if (event.target.checked) { // Turning on grayscale, do not need to complete all edits again
        this.grayscale();
      }
      else { // Turning off grayscale, need to redo all edits to return to colored mode
        this.runFilters(this.state.brightnessValue, this.state.contrastValue, event.target.checked, this.state.invertChecked);
      }
		}

		handleInvert(event) {
      this.setState( { invertChecked : event.target.checked } );
      this.invert();
		}

    grayscale() {
      const imgCanvas = document.getElementById("image-canvas");
			const ctx = imgCanvas.getContext('2d');
			const imageData = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
			const data = imageData.data;
      const dataLength = data.length;
			for (let i=0; i<dataLength; i += 4) {
				const avg = (data[i] + data[i+1] + data[i+2]) / 3;
				data[i] = avg;
				data[i+1] = avg;
				data[i+2] = avg;
			}
			ctx.putImageData(imageData, 0, 0);
    }

		invert() {
      const imgCanvas = document.getElementById("image-canvas");
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
  
    // Replace canvas data with original data
    getOriginal() {
      // console.log("getOriginal");
      const ctx = document.getElementById("image-canvas").getContext('2d');
      ctx.putImageData(this.state.originalImageData, 0, 0);
    }

    // Filter brightness of canvas data
    filterBrightness(value) {
      if (value === 0) { return; }
      // console.log("filterBrightness")
      value = Math.round(255* -(value/100));
      const imgCanvas = document.getElementById("image-canvas");
			const ctx = imgCanvas.getContext('2d');
			const imageData = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
      const data = imageData.data;
      const dataLength = data.length;

      const t0 = performance.now();
      // uint8clampedarray clamps values >255 or <0 to 255 and 0, respectively (need not take min vs 255 or max vs 0)
      for (let i=0; i<dataLength; i += 4) {
        data[i] = data[i] - value; // r
        data[i+1] = data[i+1] - value; // g
        data[i+2] = data[i+2] - value; // b
      }
     
      const t1 = performance.now();
      console.log("brightness took " + (t1-t0));

      ctx.putImageData(imageData, 0, 0);
      return imageData;
    }
    
  
    // Filter contrast of canvas data
    filterContrast(value) {
      if (value === 0) { return; }
      value *= 2.55;
      const imgCanvas = document.getElementById("image-canvas");
			const ctx = imgCanvas.getContext('2d');
			const imageData = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
      const data = imageData.data;
      const dataLength = data.length;
      const factor = (259 * (value + 255)) / (255 * (259 - value));
      const c = -128 * factor + 128;
      
      const t0 = performance.now();
      // uint8clampedarray clamps values >255 or <0 to 255 and 0, respectively
      for (let i=0; i<dataLength; i += 4) {
        data[i] = factor * data[i] + c; // r
        data[i+1] = factor * data[i+1] + c; // g
        data[i+2] = factor * data[i+2] + c; // b
      }
      const t1 = performance.now();
      console.log("contrast took " + (t1-t0));

      ctx.putImageData(imageData, 0, 0);
      return imageData;
    }
  
    handleBrightness(event, newBrightness) {
      // console.log("handleBrightness");
      // console.log(newBrightness);
			if (newBrightness !== this.state.brightnessValue) {
				this.setState( { brightnessValue : newBrightness });
				this.runFilters(newBrightness, this.state.contrastValue, this.state.grayscaleChecked, this.state.invertChecked);
			}
    }
  
    handleContrast(event, newContrast) {
			if (newContrast !== this.state.contrastValue) {
				this.setState( { contrastValue: newContrast });
				this.runFilters(this.state.brightnessValue, newContrast, this.state.grayscaleChecked, this.state.invertChecked);
			}
    }

		runFilters(brightness, contrast, grayscale, invert) {
      // Apply original data to canvas
      this.getOriginal();

      // Filter existing canvas repeatedly
			this.filterBrightness(brightness);
			this.filterContrast(contrast);

      // Apply grayscale/invert on existing canvas if toggled
      if (grayscale) { this.grayscale(); }
      if (invert) { this.invert(); }
		}

    render() {
      // console.log(this.state);
      return (
        <div id="editor"> 
					<button id="editor-revert" onClick={this.revert}>Revert changes</button>
          <button id="editor-upload" onClick={this.handleUpload}>Upload</button>
          <button id="editor-download" onClick={this.handleDownload}>Download</button>
          <ThemeProvider theme={theme}>
            <Typography id="brightness-label" color="primary.contrastText" >Brightness</Typography>
            <Slider 
              id="brightness-slider" 
              aria-label="Brightness slider" 
              value={this.state.brightnessValue} 
              min={-100} 
              max={100} 
              valueLabelDisplay="auto" 
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
              onChangeCommitted={this.handleContrast}
            />
            <hr id="section-divider"></hr>

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