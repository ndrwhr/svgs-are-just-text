import React, { Component } from 'react';
import './App.css';

import Opening from './slides/opening';
import BasicShapes from './slides/basic_shapes';
import Lines from './slides/lines';
import Tiger from './slides/tiger';
import JS from './slides/javascript';
import Physics from './slides/physics';
import CSS01 from './slides/css01';
import CSS02 from './slides/css02';
import CSS03 from './slides/css03';
import CSS04 from './slides/css04';
import Closing from './slides/closing';

/*
.scrollIntoView({
  behavior: 'smooth',
  block: 'start',
})
*/

class App extends Component {
  render() {
    return (
      <div className="App">
        <Opening/>

        <BasicShapes/>
        <Lines/>
        <Tiger/>
        <JS/>
        <Physics/>
        <CSS01/>
        <CSS02/>
        <CSS03/>
        <CSS04/>
        <Opening/>
        <Closing/>
      </div>
    );
  }
}

export default App;
