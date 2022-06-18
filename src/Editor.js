import React from 'react';
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
      this.grayscale = this.grayscale.bind(this);
			this.invert = this.invert.bind(this);
			// this.updateOriginal = this.updateOriginal.bind(this);
      this.filterBrightness = this.filterBrightness.bind(this);
			this.filterContrast = this.filterContrast.bind(this);
      this.handleBrightness = this.handleBrightness.bind(this);
      this.handleContrast = this.handleContrast.bind(this);
      this.handleDownload = this.handleDownload.bind(this);
			this.runFilters = this.runFilters.bind(this);
			this.handleUpload = this.handleUpload.bind(this);
      this.state = {
        originalData: this.props.originalImageData,
        newImageData: this.props.newImageData,
        brightnessValue: 0,
        contrastValue: 0
      }
    }

		componentDidUpdate(prevProps) {
			if (prevProps.originalImageData !== this.props.originalImageData) {
				this.setState({ originalData: this.props.originalImageData,
					newImageData: this.props.newImageData,
					brightnessValue: 0,
					contrastValue: 0
				});
			}
		}

		// Put originalImageData on the canvas and reset values
		revert() {
			this.setState( { brightnessValue: 0 });
			this.setState( { contrastValue: 0 });
			this.runFilters(0, 0);
		}

		// updateOriginal() {

		// }

    grayscale() {
      const imgCanvas = document.getElementById("image-canvas");
			const ctx = imgCanvas.getContext('2d');
			const imageData = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
			const data = imageData.data;
			for (let i=0; i<data.length; i += 4) {
				const avg = (data[i] + data[i+1] + data[i+2]) / 3;
				data[i] = avg;
				data[i+1] = avg;
				data[i+2] = avg;
			}
			ctx.putImageData(imageData, 0, 0);
			// updateOriginal();
    }

		invert() {
      const imgCanvas = document.getElementById("image-canvas");
			const ctx = imgCanvas.getContext('2d');
			const imageData = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
			const data = imageData.data;
			for (let i=0; i<data.length; i += 4) {
				data[i] = 255 - data[i];
				data[i+1] = 255 - data[i+1];
				data[i+2] = 255 - data[i+2];
			}
			ctx.putImageData(imageData, 0, 0);
			// updateOriginal();
		}
  
		// Store filtered originalImageData in newImageData
    filterBrightness(value) {
      console.log("filterBrightness")
      const origData = this.state.originalData.data;
      const imageData = this.state.newImageData;
      const data = imageData.data;
      for (let i=0; i<origData.length; i += 4) {
        data[i] = Math.max(0, Math.min(255, origData[i] - Math.round(255 * -(value/100)))); // r
        data[i+1] = Math.max(0, Math.min(255, origData[i+1] - Math.round(255 * -(value/100)))); // g
        data[i+2] = Math.max(0, Math.min(255, origData[i+2] - Math.round(255 * -(value/100)))); // b
      }
      let ctx = document.getElementById("image-canvas").getContext('2d');
      ctx.putImageData(imageData, 0, 0);
    }
  
		// Replace newImageData with filtered newImageData
    filterContrast(value) {
      console.log("filterContrast")
      value *= 2.55;
      const imageData = this.state.newImageData;
      const data = imageData.data;
      // Formula from: https://www.dfstudios.co.uk/articles/programming/image-programming-algorithms/image-processing-algorithms-part-5-contrast-adjustment/
      const factor = (259 * (value + 255)) / (255 * (259 - value));
      for (let i=0; i<data.length; i += 4) {
        data[i] = Math.trunc( factor * ( data[i] - 128 ) + 128 ); // r
        data[i+1] = Math.trunc( factor * ( data[i+1] - 128 ) + 128 ); // g
        data[i+2] = Math.trunc( factor * ( data[i+2] - 128 ) + 128 ); // b
      }
      let ctx = document.getElementById("image-canvas").getContext('2d');
      ctx.putImageData(imageData, 0, 0);
    }
  
    handleBrightness(event, newBrightness) {
			if (newBrightness !== this.state.brightnessValue) {
				this.setState( { brightnessValue : newBrightness } );
				this.runFilters(newBrightness, this.state.contrastValue);
			}
    }
  
    handleContrast(event, newContrast) {
			if (newContrast !== this.state.contrastValue) {
				this.setState( { contrastValue: newContrast });
				this.runFilters(this.state.brightnessValue, newContrast);
			}
    }

		runFilters(currBrightness, currContrast) {
			this.filterBrightness(currBrightness);
			// any later filters run will use "newImageData" as the original to edit off of
			this.filterContrast(currContrast);
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
  
    // Edit options: grayscale, saturation, brightness, contrast
    // Provide slider a pre-slider edit ctx relative to which brightness is modified by the slider
    render() {
      console.log(this.state);
	
      return (
        <div id="editor"> 
					<button id="editor-revert" onClick={this.revert}>Revert changes</button>
          <button id="editor-upload" onClick={this.handleUpload}>Upload</button>
          <button id="editor-download" onClick={this.handleDownload}>Download</button>
          <button id="grayscale-btn" onClick={this.grayscale}>Grayscale</button>
					<button id="invert-btn" onClick={this.invert}>Invert</button>
          <ThemeProvider theme={theme}>
            <Typography id="brightness-label" color="primary.contrastText" >Brightness</Typography>
            <Slider 
              id="brightness-slider" 
              aria-label="Brightness slider" 
              value={this.state.brightnessValue} 
              min={0} 
              max={100} 
              // step={20} 
              // marks 
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
              // step={20} 
              // marks 
              valueLabelDisplay="auto" 
              onChangeCommitted={this.handleContrast}
            />
          </ThemeProvider>
  
        </div>
      );
    }
  }