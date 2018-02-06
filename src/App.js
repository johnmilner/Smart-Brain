import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

const app = new Clarifai.App({
  apiKey: 'fedae956b51f4f0c96143a119a66f7fe'
});

const particlesOptions = {
  particles: {
    line_linked: {
      shadow: {
        enable: true,
        color: "#3CA9D1",
        blur: 5
      }
    }
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: []
    }
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    let arr = [];
    let box;
    for (var i = 0; i < clarifaiFace.length; i++) {
      let val = clarifaiFace[i].region_info.bounding_box;
      box = {
        leftCol: val.left_col * width,
        topRow: val.top_row * height,
        rightCol: width - (val.right_col * width),
        bottomRow: height - (val.bottom_row * height)
     }
     arr.push(box);
    }
    return arr;
   }
  
  displayFaceBox = (box) => {
    console.log(box);

    // for(var i in box) {
    //   this.setState({box: box[i]});
    // }

    // for(var i = 0; i < box.length; i++) {
    //   this.setState({box: box[i]}); 
    //   console.log(box[i])
    // }

    // for(var i in box) {
    //   this.setState({ box: [...this.state.box, box[i]]})
    // }
    this.setState({box: box});
  }

  onInputChange = (event) => {
    console.log('check');
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models.predict(
       Clarifai.FACE_DETECT_MODEL, 
       this.state.input)
    .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
    .catch(err => console.log(err));
    }

  render() {
      return (
        <div className="App">
          <Particles className='particles' params={particlesOptions} />
          <Navigation />
          <Logo />
          <Rank />
          <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onButtonSubmit={this.onButtonSubmit}/>
          <FaceRecognition 
          box={this.state.box}
          imageUrl={this.state.imageUrl}/>
          
        </div>
      );
  }
}

export default App;
