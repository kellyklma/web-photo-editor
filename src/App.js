import logo from './logo.svg';
import './App.css';
import React from 'react';
import { render } from '@testing-library/react';

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
    this.displayImage = this.displayImage.bind(this);
    this.state = {
      imgURL: ""
    };
  }
  
  displayImage(event) {
    document.getElementsByClassName("drop")[0].style.display = "none";
    const fileInput = document.getElementById("browse-files");
    const uploadedFiles = fileInput.files;
  
    if (uploadedFiles.length === 1) {
      this.setState( {imgURL : URL.createObjectURL(uploadedFiles[0])} );
      console.log(this.state.imgURL);
      console.log(uploadedFiles[0].name);
      console.log(uploadedFiles[0].size); 
    }
  }

  browseFiles(event) {
    event.preventDefault();
    document.getElementById("browse-files").click();
  }

  render() {
    return (
      <div className="content">
        <div className="drop">
          <p>drag and drop a file to edit</p>
          <input type="file" id="browse-files" name="file" accept=".jpg,.jpeg,.png,.raw,.cr2,.nef,.bmp,.tif,.tiff" onChange={this.displayImage}/>
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
    const { loadImage, Image } = require('canvas');
    // const myImg = loadImage(this.props.imageURL);
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
        <img id="image-upload"  src={this.props.imageURL} alt="uploaded image" onLoad={this.handleImageLoaded}/>
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
