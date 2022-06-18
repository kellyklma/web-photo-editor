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

class Header extends React.Component {
  render() {
    return (
      <p>web photo editor</p>
    );
  }
}

class Content extends React.Component {
  constructor(props) {
    super(props);
    this.browseFiles = this.browseFiles.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.displayImage = this.displayImage.bind(this);
    this.dropHandler = this.dropHandler.bind(this);
    this.dragOverHandler = this.dragOverHandler.bind(this);
    this.state = {
      imgURL: ""
    };
  }
  
  uploadImage(event) {
    const fileInput = document.getElementById("browse-files");
    const uploadedFiles = fileInput.files;
    if (uploadedFiles.length > 0) {
      const uploadedFile = uploadedFiles[0];
      this.displayImage(uploadedFile);
    }
  }

  displayImage(file) {
    console.log(file);
    const imageTypes = ['image/jpg','image/jpeg','image/png','image/raw','image/cr2','image/nef','image/bmp','image/tif','image/tiff'];
    if (file && imageTypes.includes(file['type'])) {
      document.getElementsByClassName("drop")[0].style.display = "none";
      this.setState( {imgURL : URL.createObjectURL(file)} ); // Setting state triggers re-render
    }
  }

  // Recognize drop event on target element
  dropHandler(event) {
    console.log("Drop handler");
    event.preventDefault();
    let file;
    if (event.dataTransfer.items) {
      if (event.dataTransfer.items[0].kind === 'file') {
        file = event.dataTransfer.items[0].getAsFile();
        console.log("file name: " + file.name);
      }
      else {
        file = event.dataTransfer.files[0];
        console.log("name: " + file.name);
      }
      this.displayImage(file);
    }
  }

  // Turns off browser's default drag behavior over the target element
  dragOverHandler(event) {
    console.log("Dragover handler");
    event.preventDefault();
  }

  browseFiles(event) {
    event.preventDefault();
    document.getElementById("browse-files").click();
  }

  render() {
    return (
      <div className="content">
        <div className="drop" onDrop={this.dropHandler} onDragOver={this.dragOverHandler}>
          <p>drag and drop a file to edit</p>
          <input type="file" id="browse-files" name="file" accept=".jpg,.jpeg,.png,.raw,.cr2,.nef,.bmp,.tif,.tiff" onChange={this.uploadImage}/>
          <button id="custom-upload" onClick={this.browseFiles}>browse</button>
        </div>
        { (this.state.imgURL !== "") && <UploadedImage imageURL={this.state.imgURL}/>}
        { (this.state.imgURL !== "") && <Editor />}
      </div>
    );
  }
}

class UploadedImage extends React.Component {
  constructor(props) {
    super(props);
    this.handleImageLoaded = this.handleImageLoaded.bind(this);
  }

  handleImageLoaded() {
    let myImg = document.getElementById("image-upload");
    let imgCanvas = document.getElementById("image-canvas");
    imgCanvas.width = myImg.naturalWidth;
    imgCanvas.height = myImg.naturalHeight;
    imgCanvas.naturalWidth = myImg.naturalWidth;
    imgCanvas.naturalHeight = myImg.naturalHeight;

    let ctx = imgCanvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(myImg, 0, 0, myImg.naturalWidth, myImg.naturalHeight);
    this.setState(); // Trigger re-render of UploadedImage to view newly drawn image
  }

  render() {
    return (
      <div id="previews">
        <img id="image-upload" src={this.props.imageURL} alt="original upload" onLoad={this.handleImageLoaded}/>
        {/* <img id="image-upload-2" src={this.props.imageURL} alt="uploaded image" /> */}
        <canvas id="image-canvas" alt="edited upload"></canvas>
      </div>
    );
  }
}

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.doEdit = this.doEdit.bind(this);
    this.filterBrightness = this.filterBrightness.bind(this);
    this.handleBrightness = this.handleBrightness.bind(this);
    this.handleContrast = this.handleContrast.bind(this);
    this.setOriginalData = this.setOriginalData.bind(this);
    this.state = {
      setOriginal: false,
      originalData: null,
      newImageData: null,
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
    console.log("handling brightness");
    this.setState( { brightnessValue : newBrightness } );
    // Call function that runs all filters
    if (!this.state.setOriginal) {
      this.setOriginalData();
    }
  }

  handleContrast(event, newContrast) {
    console.log("handleContrast");
    this.setState( { contrastValue: newContrast });
    if (!this.state.setOriginal) {
      this.setOriginalData();
    }
  }

  setOriginalData() {
    console.log("setting original");
    // run all filtering functions on ORIGINAL IMAGE DATA in a designated order using state variables (input settings)
    let myImg = document.getElementById("image-upload");
    let imgCanvas = document.getElementById("image-canvas");
    if (myImg && imgCanvas && myImg.naturalWidth === imgCanvas.width) { // Ensure canvas image has been drawn first
      // Save original image data to state variable
      let ctx = imgCanvas.getContext('2d');
      let imgData = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height)
      let newData = new Uint8ClampedArray(imgData.data);
      let newImgData = new ImageData(newData, imgData.width, imgData.height, { colorspace: "srgb" });
      this.setState({ originalData: imgData, setOriginal: true, newImageData: newImgData });
    }
  }

  // Edit options: grayscale, saturation, brightness, contrast
  // Provide slider a pre-slider edit ctx relative to which brightness is modified by the slider
  render() {
    console.log(this.state);
    if (this.state.setOriginal) {
      // Runs upon state changes after original image data has been obtained
      // call filtering functions here
      this.filterBrightness(this.state.brightnessValue);
      // any later filters run will use "newImageData" as the original to edit off of
      this.filterContrast(this.state.contrastValue);
    }

    return (
      <div id="editor"> 
        <button id="edit-photo" onClick={this.doEdit}>Grayscale</button>
        <ThemeProvider theme={theme}>
          <Typography id="brightness-label" color="primary.contrastText" gutterBottom>Brightness</Typography>
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
          <Typography id="contrast-label" color="primary.contrastText" gutterBottom>Contrast</Typography>
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

function App() {
  return (
    <div className="App"> 
      <header className="App-header">
        <Header />
      </header>
      <Content />
    </div>
  );
}

export default App;
