import './App.css';
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
      this.doEdit = this.doEdit.bind(this);
      this.filterBrightness = this.filterBrightness.bind(this);
      this.handleBrightness = this.handleBrightness.bind(this);
      this.handleContrast = this.handleContrast.bind(this);
      this.handleDownload = this.handleDownload.bind(this);
			this.runFilters = this.runFilters.bind(this);
      this.state = {
        originalData: this.props.originalImageData,
        newImageData: this.props.newImageData,
        brightnessValue: 0,
        contrastValue: 0
      }
    }

    doEdit() {
      let myImg = document.getElementById("image-upload");
      let imgCanvas = document.getElementById("image-canvas");
      if (myImg.naturalWidth === imgCanvas.width) { // Ensure canvas image has been drawn first
        let ctx = imgCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
        const data = imageData.data;
        for (let i=0; i<data.length; i += 4) {
          const avg = (data[i] + data[i+1] + data[i+2]) / 3;
          data[i] = avg;
          data[i+1] = avg;
          data[i+2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
      }
    }
  
    filterBrightness(value) {
      console.log("filterBrightness")
      const data = this.state.originalData.data;
      const newImgData = this.state.newImageData;
      const newData = newImgData.data;
      for (let i=0; i<data.length; i += 4) {
        newData[i] = Math.max(0, Math.min(255, data[i] - Math.round(255 * -(value/100)))); // r
        newData[i+1] = Math.max(0, Math.min(255, data[i+1] - Math.round(255 * -(value/100)))); // g
        newData[i+2] = Math.max(0, Math.min(255, data[i+2] - Math.round(255 * -(value/100)))); // b
        newData[i+3] = data[i+3]; // a
      }
      let ctx = document.getElementById("image-canvas").getContext('2d');
      ctx.putImageData(newImgData, 0, 0);
    }
  
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
			const imageData = document.getElementById("image-canvas").toDataURL();
			let tempLink = document.createElement('a');
			tempLink.download = 'edited_image.png';
			tempLink.href = imageData;
			document.body.appendChild(tempLink);
			tempLink.click();
			document.body.removeChild(tempLink);
    }
  
    // Edit options: grayscale, saturation, brightness, contrast
    // Provide slider a pre-slider edit ctx relative to which brightness is modified by the slider
    render() {
      console.log(this.state);
	
      return (
        <div id="editor"> 
          <button id="editor-upload" >Upload</button>
          <button id="editor-download" onClick={this.handleDownload}>Download</button>
          <button id="edit-photo" onClick={this.doEdit}>Grayscale</button>
          <ThemeProvider theme={theme}>
            <Typography id="brightness-label" color="primary.contrastText" >Brightness</Typography>
            <Slider 
              id="brightness-slider" 
              aria-label="Brightness slider" 
              value={this.state.brightnessValue} 
              min={0} 
              max={100} 
              step={20} 
              marks 
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
              step={20} 
              marks 
              valueLabelDisplay="auto" 
              onChangeCommitted={this.handleContrast}
            />
          </ThemeProvider>
  
        </div>
      );
    }
  }