// Content.js enables image file upload with drag-and-drop or file browser, displays the original image beside an editing canvas,
// and renders the editing toolbar upon successful image loading

import React from 'react';
import Editor from './Editor.js';

export default class Content extends React.Component {
    constructor(props) {
      super(props);
      this.dropHandler = this.dropHandler.bind(this);
      this.dragOverHandler = this.dragOverHandler.bind(this);
      this.browseFiles = this.browseFiles.bind(this);
      this.uploadImage = this.uploadImage.bind(this);
      this.displayImage = this.displayImage.bind(this);
      this.handleImageLoaded = this.handleImageLoaded.bind(this);

      this.state = {
        imgURL: "",
        originalImageData: null,
        worker: this.props.worker
      };
    }
      
    // Turns off browser's default drag behavior over the target element to allow seamless drag-and-drop of image to edit
    dragOverHandler(event) {
      event.preventDefault();
    }

    // Upon drop event on target element, confirms that dropped file is a file and calls displayImage function to display the dropped file
    dropHandler(event) {
      event.preventDefault();
      let file;
      if (event.dataTransfer.items) {
        if (event.dataTransfer.items[0].kind === 'file') {
          file = event.dataTransfer.items[0].getAsFile();
        }
        else {
          file = event.dataTransfer.files[0];
        }
        this.displayImage(file);
      }
    }

    // Upon click of browse button, displays file browser to allow selection of image to edit
    browseFiles(event) {
      event.preventDefault();
      document.getElementById("browse-files").click();
    }
  
    // Upon selection of image from file browser, confirms that a file was uploaded and calls displayImage function to display the selected file
    uploadImage(event) {
      const fileInput = document.getElementById("browse-files");
      const uploadedFiles = fileInput.files;
      if (uploadedFiles.length > 0) {
        const uploadedFile = uploadedFiles[0];
        this.displayImage(uploadedFile);
      }
    }
  
    // Determines whether dropped file is an allowed image type, and if so hides image dropper view and sets state variable to render the image
    displayImage(file) {
      const imageTypes = ['image/jpg','image/jpeg','image/png','image/raw','image/cr2','image/nef','image/bmp','image/tif','image/tiff'];
      if (file && imageTypes.includes(file['type'])) {
        document.getElementsByClassName("drop")[0].style.display = "none";
        this.setState( {imgURL : URL.createObjectURL(file)} ); // Change to state triggers re-render: if same image uploaded, do nothing
      }
    }
  
    // Upon loading of new image, draws the image onto onscreen canvas to display editing progress. Saves new image data to state variable.
    handleImageLoaded(event) {
      let myImg = document.getElementById("image-upload");
      let imgCanvas = document.getElementById("image-canvas");
			if (this.state.originalImageData) { // Indicates upload of new image to overwrite existing image
				let ctx = imgCanvas.getContext("2d");
				ctx.clearRect(0, 0, imgCanvas.width, imgCanvas.height);
			}
      imgCanvas.width = myImg.naturalWidth;
      imgCanvas.height = myImg.naturalHeight;
      imgCanvas.naturalWidth = myImg.naturalWidth;
      imgCanvas.naturalHeight = myImg.naturalHeight;
      let ctx = imgCanvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(myImg, 0, 0, myImg.naturalWidth, myImg.naturalHeight);
      let imgData = ctx.getImageData(0, 0, imgCanvas.width, imgCanvas.height);
      this.setState({ originalImageData: imgData }); // Trigger re-render of UploadedImage to view newly drawn image and display editor
    }
  
    render() {
      return (
        <div className="content">
          <div className="drop" onDrop={this.dropHandler} onDragOver={this.dragOverHandler}>
            <p>Drag and drop an image to edit</p>
            <input type="file" id="browse-files" name="file" accept=".jpg,.jpeg,.png,.raw,.cr2,.nef,.bmp,.tif,.tiff" onChange={this.uploadImage}/>
            <button id="custom-upload" onClick={this.browseFiles}>browse</button>
          </div>
          { (this.state.imgURL !== "") && 
            <div id="previews">
              <img id="image-upload" src={this.state.imgURL} alt="original upload" onLoad={this.handleImageLoaded}/>
              <canvas id="image-canvas" alt="edited upload"></canvas>
            </div>
          }
          { (this.state.originalImageData) && <Editor originalImageData={this.state.originalImageData} worker={this.state.worker}/>}
        </div>
      );
    }
  }