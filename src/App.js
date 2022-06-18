import './App.css';
import React from 'react';
// import Slider from '@mui/material/Slider';
// import Typography from '@mui/material/Typography';
import Editor from './Editor.js';


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
    this.handleImageLoaded = this.handleImageLoaded.bind(this);

    this.state = {
      imgURL: "",
      originalImageData: null,
      newImageData: null
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

  handleImageLoaded(event) {
    let myImg = document.getElementById("image-upload");
    let imgCanvas = document.getElementById("image-canvas");
    imgCanvas.width = myImg.naturalWidth;
    imgCanvas.height = myImg.naturalHeight;
    imgCanvas.naturalWidth = myImg.naturalWidth;
    imgCanvas.naturalHeight = myImg.naturalHeight;

    let ctx = imgCanvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(myImg, 0, 0, myImg.naturalWidth, myImg.naturalHeight);
    let imgData = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height)
    let newData = new Uint8ClampedArray(imgData.data);
    let newImgData = new ImageData(newData, imgData.width, imgData.height, { colorspace: "srgb" });
    this.setState({ originalImageData: imgData, newImageData: newImgData }); // Trigger re-render of UploadedImage to view newly drawn image and display editor
  }

  render() {
    return (
      <div className="content">
        <div className="drop" onDrop={this.dropHandler} onDragOver={this.dragOverHandler}>
          <p>drag and drop a file to edit</p>
          <input type="file" id="browse-files" name="file" accept=".jpg,.jpeg,.png,.raw,.cr2,.nef,.bmp,.tif,.tiff" onChange={this.uploadImage}/>
          <button id="custom-upload" onClick={this.browseFiles}>browse</button>
        </div>
        { (this.state.imgURL !== "") && 
          <div id="previews">
            <img id="image-upload" src={this.state.imgURL} alt="original upload" onLoad={this.handleImageLoaded}/>
            <canvas id="image-canvas" alt="edited upload"></canvas>
          </div>
        }
        { (this.state.originalImageData) && (this.state.newImageData) && <Editor originalImageData={this.state.originalImageData} newImageData={this.state.newImageData}/>}
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
