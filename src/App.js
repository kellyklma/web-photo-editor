import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
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
      // this.setStateimgURL = URL.createObjectURL(uploadedFiles[0]);
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
          <p>Drag and drop a file to edit</p>
          <input type="file" id="browse-files" name="file" accept=".jpg,.jpeg,.png,.raw,.cr2,.nef,.bmp,.tif,.tiff" onChange={this.displayImage}/>
          <button id="custom-upload" onClick={this.browseFiles}>Browse</button>
        </div>
        {<UploadedImage texts="hihihi" imageURL={this.state.imgURL}/>}
      </div>
    );
  }
}

class UploadedImage extends React.Component {
  render() {
    console.log("show uploaded image");
    console.log(this.props.imageURL);
    return (
      <div>
        { (this.props.imageURL !== "") && <img src={this.props.imageURL} alt="uploaded image" />}
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
