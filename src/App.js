import React from 'react';
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

*/

export default class App extends React.Component {

  handleKeyPress = ({key}) => {
    if (key === 'ArrowLeft') {
      this.scrollTo(-1);
    } else if (key === 'ArrowRight') {
      this.scrollTo(1);
    }
  }

  scrollTo(direction) {
    const slides = Array.from(document.querySelectorAll('.App > div'));
    const tops = slides.map(slide => slide.getBoundingClientRect().top);

    const currentScroll = document.body.scrollTop + (window.innerHeight / 2);

    const currentIndex = tops.findIndex((elTop) => elTop >= currentScroll) - 1;

    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), slides.length - 1);



    slides[nextIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  componentDidMount() {
    document.body.addEventListener('keyup', this.handleKeyPress);
  }

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
