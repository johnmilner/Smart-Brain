import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
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
      box: [],
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
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
    .then(response => {
      if (response) {
        fetch('http://localhost:3001/image', {
          method: 'put',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
              id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries: count}))
        })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    
    })
    .catch(err => console.log(err));
    }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState({isSignedIn: false})
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    } 
      this.setState({route: route});
    
  }

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
      return (
        <div className="App">
          <Particles className='particles' params={particlesOptions} />
          <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />

          { route === 'home' 
          ? <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries}  />
          <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onButtonSubmit={this.onButtonSubmit}/>
          <FaceRecognition 
          box={box}
          imageUrl={imageUrl}/>
          </div>
          : (
          route === 'signin' 
          ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
          }
        </div>
      );
  }
}

export default App;
