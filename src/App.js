import './App.css';
import React from 'react';
// import { render } from '@testing-library/react';

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
      // console.log(this.state.imgURL);
      // console.log(uploadedFiles[0].name);
      // console.log(uploadedFiles[0].size); 
      this.displayImage(uploadedFile);
    }
  }

  displayImage(file) {
    document.getElementsByClassName("drop")[0].style.display = "none";
    this.setState( {imgURL : URL.createObjectURL(file)} ); // Setting state triggers re-render
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
    //const { loadImage, Image } = require('canvas');
    let myImg = document.getElementById("image-upload");
    let imgCanvas = document.getElementById("image-canvas");

    imgCanvas.width = myImg.naturalWidth;
    imgCanvas.height = myImg.naturalHeight;

    imgCanvas.naturalWidth = myImg.naturalWidth;
    imgCanvas.naturalHeight = myImg.naturalHeight;

    let ctx = imgCanvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(myImg, 0, 0, myImg.naturalWidth, myImg.naturalHeight);

    this.setState();
  }

  render() {
    return (
      <div id="previews">
        <img id="image-upload"  src={this.props.imageURL} alt="original upload" onLoad={this.handleImageLoaded}/>
        {/* <img id="image-upload-2" src={this.props.imageURL} alt="uploaded image" /> */}
        <canvas id="image-canvas"  alt="edited upload"></canvas>
      </div>
    );
  }
}

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.doEdit = this.doEdit.bind(this);
  }

  doEdit() {
    // Ensure image drawn to canvas
    let myImg = document.getElementById("image-upload");
    let imgCanvas = document.getElementById("image-canvas");
    // Check that they are equivalent? that imgCanvas has stuff?
  }
  render() {
    return (
      <div id="editor">
        <input type="number" id="edit-val" />
        <button id="edit-photo" onClick={this.doEdit}>Edit</button>
      </div>
    )
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
