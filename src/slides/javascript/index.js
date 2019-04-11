import React from 'react';

import Slide from '../../Slide';

import './styles.css';

const Thing = ({percent}) => {
  const angle = -95 * (0.5 - percent);

    const lineLength = 70;
    const offset = (100 - lineLength) / 2;

    return (
      <svg viewBox="0 0 100 100" className="transform-controls__icon">
        <line
          className="transform-controls__icon-line"
          x1={7}
          y1={100 - offset}
          x2={100 - 7}
          y2={100 - offset}
        />

        <line
          className="transform-controls__icon-line transform-controls__icon-line--light"
          x1={50}
          y1={offset}
          x2={50}
          y2={100 - offset}
        />

        <g transform={`rotate(${angle}, 50, ${100 - offset})`}>
          <line
            className="transform-controls__icon-line"
            x1={50}
            y1={offset}
            x2={50}
            y2={100 - offset}
            strokeLinecap="butt"
          />
          <polygon
            points={`50,${offset - 5} 62,${offset + 13 - 5} 37,${offset +
              13 -
              5}`}
          />
        </g>
      </svg>
    );
}

export default class JS extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      percent: 0.5,
    };

    this.onMouseMove = this.onMouseMove.bind(this);
  }

  onMouseMove(evt) {
    this.setState({ percent: evt.pageX / window.innerWidth });
  }

  render() {
    return (
      <Slide>
        <div style={{width: '100%'}} onMouseMove={this.onMouseMove}>
          <Thing percent={this.state.percent}/>
        </div>
      </Slide>
    )
  }
}
