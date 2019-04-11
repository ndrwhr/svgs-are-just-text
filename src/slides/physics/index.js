import React from 'react';

import Slide from '../../Slide';

/**
 * Some utility methods used throughout.
 * @type {Object}
 */
var Utils = {
  /**
   * Returns a random number between the provided min and max.
   *
   * @param {number} min
   * @param {number} max
   *
   * @return {number} A number between [min, max].
   */
  random: function(min, max){
      return (Math.random() * (max - min)) + min;
  },

  /**
   * Returns a random number between the provided min and max as an int.
   *
   * @param {number} min
   * @param {number} max
   *
   * @return {number} A number floor([min, max])
   */
  randomInt: function(min, max){
      return Math.floor(this.random(min, max));
  },

  /**
   * Returns a random element from the provided array.
   *
   * @param {Array} array
   *
   * @return {*} A random element from the provided array.
   */
  randomElement: function(array){
      return array[this.randomInt(0, array.length)];
  },

  /**
   * Paired down requestAnimationFrame Polyfill based off of Erik MÃķller'
   * polyfill; fixes from Paul Irish and Tino Zijdel.
   * https://gist.github.com/paulirish/1579671
   */
  requestAnimationFrame: (function(){
      var best = window.requestAnimationFrame;
      var lastTime = 0;
      var vendors = ['ms', 'moz', 'webkit', 'o'];
      for(var x = 0; x < vendors.length && !best; ++x){
          best = window[vendors[x]+'RequestAnimationFrame'];
      }

      if (!best){
          best = function(callback, element) {
              var currTime = new Date().getTime();
              var timeToCall = Math.max(0, 16 - (currTime - lastTime));
              var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
              lastTime = currTime + timeToCall;
              return id;
          };
      }

      return best;
  })()
};

/**
* Represents an individual ball inside the ball bit.
*/
var Ball = function(initiallyOffScreen){
  // Choose a random radius for the ball.
  this.radius = Utils.random(Ball.MIN_RADIUS, Ball.MAX_RADIUS);

  var radiusBuffer = this.radius + (Ball.MAX_RADIUS / 15);
  var offScreenWidth = (BallPit.CANVAS_WIDTH - BallPit.VISIBLE_CANVAS_WIDTH) / 2;
  var offScreenHeight = (BallPit.CANVAS_HEIGHT - BallPit.VISIBLE_CANVAS_HEIGHT) / 2;
  var x, y;

  // For balls that are not added initially generate their positions so
  // that they are off the edge of the visible canvas.
  if (initiallyOffScreen){
      x = Utils.random(radiusBuffer, offScreenWidth - radiusBuffer);
      if (Math.round(Math.random())) x += BallPit.CANVAS_WIDTH - offScreenWidth;

      y = Utils.random(radiusBuffer, offScreenHeight - radiusBuffer);
      if (Math.round(Math.random())) y += BallPit.CANVAS_HEIGHT - offScreenHeight;
  } else {
      // Choose a random position anywhere on the visible portion of the
      // canvas.
      x = Utils.random(radiusBuffer + offScreenWidth,
              BallPit.CANVAS_WIDTH - offScreenWidth - radiusBuffer);
      y = Utils.random(radiusBuffer + offScreenHeight,
              BallPit.CANVAS_HEIGHT - offScreenHeight - radiusBuffer);
  }

  this.x = this.previousX = x;
  this.y = this.previousY = y;

  // Set up the svg element.
  this.el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  this.el.setAttribute('r', this.radius);
  this.el.setAttribute('cx', 0);
  this.el.setAttribute('cy', 0);
  this.el.setAttribute('fill', Utils.randomElement([
    'LightBlue', 'LightCoral', 'LightPink',
    'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'PaleGoldenRod', 'PaleGreen',
    'PaleTurquoise', 'PaleVioletRed'
]));

  // Draw once to make sure the positioning is up to date.
  this.draw();
}
Ball.prototype = {
  /**
   * Moves and draws the ball.
   */
  update: function(){
      this.move();
      this.draw();
  },

  /**
   * Updates the balls position using some really simple physics.
   */
  move: function(){
      var acceleration = this.calulateAcceleration_();

      var tmpx = acceleration.x + ((this.x * (2 - Ball.DRAG)) -
              (this.previousX * (1 - Ball.DRAG)));
      this.previousX = this.x;
      this.x = tmpx;

      var tmpy = acceleration.y + ((this.y * (2 - Ball.DRAG)) -
              (this.previousY * (1 - Ball.DRAG)));
      this.previousY = this.y;
      this.y = tmpy;

      this.detectWallCollisions_();
  },

  /**
   * Updates this ball's svg circle.
   */
  draw: function(){
      this.el.setAttribute('transform', 'translate(' + this.x + ',' +
              this.y + ')');
  },

  /**
   * Updates the balls position to obey the bounds of the canvas.
   */
  detectWallCollisions_: function(){
      var adjust;

      // Adjust to container bounds horizontally.
      if (this.x <= this.radius || this.x >= BallPit.CANVAS_WIDTH -
              this.radius){
          if (this.x <= this.radius){
              adjust = -Ball.WALL_BOUNCE;
          } else {
              adjust = Ball.WALL_BOUNCE;
          }
          var tmpx = this.x;
          this.x = this.previousX;
          this.previousX = tmpx + adjust;
      }

      // Adjust to container bounds vertically.
      if (this.y <= this.radius || this.y >= BallPit.CANVAS_HEIGHT -
              this.radius){
          if (this.y <= this.radius){
              adjust = -Ball.WALL_BOUNCE;
          } else {
              adjust = Ball.WALL_BOUNCE;
          }
          var tmpy = this.y;
          this.y = this.previousY;
          this.previousY = tmpy + adjust;
      }
  },

  /**
   * Calculates the overall acceleration vector based on the size and
   * relative distance of every other ball.
   *
   * @return {Object} An object with both x and y acceleration to be used in
   *      both the
   */
  calulateAcceleration_: function(){
      var x, y, d, m, ball;
      var ax = 0;
      var ay = 0;

      // Calculate the acceleration from every other ball. This is a really
      // inefficient n^2 algorithm...
      for (var i = 0; i < BallPit.balls.length; i++){
          ball = BallPit.balls[i];

          if (ball === this) continue;

          x = ball.x - this.x;
          y = ball.y - this.y;
          d = Math.sqrt((x * x) + (y * y));

          m = 1;

          // If the two balls are touching turn the regular
          // attractive force into repulsion.
          if (d < (this.radius + ball.radius)) m = -Ball.REPULSION;
          ax += m * (x * (ball.radius / (d * d))) / Ball.MAGIC;
          ay += m * (y * (ball.radius / (d * d))) / Ball.MAGIC;
      }

      return {
          x: ax * Ball.DAMPENING,
          y: ay * Ball.DAMPENING
      };
  }
};

/**
* The minimum radius that a ball can be.
* @type {number}
*/
Ball.MIN_RADIUS = 0.1;

/**
* The maximum radius that a ball can be.
* @type {number}
*/
Ball.MAX_RADIUS = 1.2;

/**
* How disgusted each ball is with each other.
* @type {number}
*/
Ball.REPULSION = 30;

/**
* The restitution of the walls.
* @type {number}
*/
Ball.WALL_BOUNCE = 0.00005;

/**
* The amount of drag each ball should experience.
* @type {number}
*/
Ball.DRAG = 0.005;

/**
* How much to dampen the acceleration applied to each ball.
* @type {number}
*/
Ball.DAMPENING = 0.0025;

/**
* Magic constant used to scale the overall attractive force between any two
* balls.
* @type {number}
*/
Ball.MAGIC = 10;

/**
* The main controller for this whole dang thing. See start() to get started.
* @type {Object}
*/
var BallPit = {
  /**
   * The amount of canvas that is actually visible (horizontal).
   * @type {number}
   */
  VISIBLE_CANVAS_WIDTH: 45,

  /**
   * The amount of canvas that is actually visible (vertically).
   * @type {number}
   */
  VISIBLE_CANVAS_HEIGHT: 45,

  /**
   * The overall width of the ball-pit.
   * @type {number}
   */
  CANVAS_WIDTH: 50,

  /**
   * The overall height of the ball-pit.
   * @type {number}
   */
  CANVAS_HEIGHT: 50,

  /**
   * Reference to all of the balls.
   * @type {Array.<Ball>}
   */
  balls: [],

  /**
   * The number of balls the simulation should start with.
   * @type {number}
   */
  startNumBalls_: 25,

  /**
   * The maximum number of balls the simulation should allow. Any more than
   * this and the whole thing looks like hot mess.
   * @type {number}
   */
  maxNumBalls_: 100,

  /**
   * The number of frames since the last frame rate check.
   * @type {number}
   */
  frameCount_: 0,

  /**
   * The number of times the check returned lower that 60fps. See
   * ensureOptimalFrameRate below.
   * @type {number}
   */
  failedChecks_: 0,

  /**
   * How often (in ms) we should check on the frame rate.
   * @type {number}
   */
  checkRate_: 250,

  /**
   * Start the ball pit. The overall flow after some of the basic set up
   * is as follows:
   *      -   Call update an fast as possible using requestAnimationFrame.
   *          Usually around 60 frames/second.
   *      -   At the same time there is a function called every 250ms that
   *          checks the frame rate. If we're running at 60fps continue
   *          adding balls until the simulation begins to slow down (or we
   *          hit the max). At this point, just pop off the last ball to
   *          bring the simulation back up to 60fps.
   */
  start: function(svg){
      this.svg = svg;
      // Initialize the ball pit's container.
      this.container = document.querySelector('.ball-pit');
      // this.container.setAttribute('fill', );

      // Add a bunch of balls.
      this.balls = [];
      for (var i = 0, ball; i < this.startNumBalls_; i++) this.addBall();

      // Bind a copy of update so that we don't have to constantly do that at
      // run time. Note that update constantly calls requestAnimationFrame to
      // facilitate the run loop.
      this.update = this.update.bind(this);
      this.update();

      // Do the same thing for the frame rate checker.
      this.ensureOptimalFrameRate = this.ensureOptimalFrameRate.bind(this);
      setTimeout(this.ensureOptimalFrameRate, this.checkRate_);
  },

  /**
   * Adds another ball to the ball pit.
   */
  addBall: function(offScreen){
      var ball = new Ball(!!offScreen);
      this.container.appendChild(ball.el);
      this.balls.push(ball);
  },

  /**
   * A callback that will monitor the current frame rate and continue to
   * add balls until the performance decreases. Once a decrease has been
   * detected a number of times in a row, it will remove the last added ball
   * to hopefully bring everything back up to 60 frames per-second.
   */
  ensureOptimalFrameRate: function(){
      // Calculate the new frame rate and reset the frame counter.
      var newFrameRate = this.frameCount_ * (1000 / this.checkRate_);
      this.frameCount_ = 0;

      if (newFrameRate < 55){
          this.failedChecks_++;
      } else {
          this.failedChecks_ = 0;
          this.addBall(true /* Add off screen */);
      }

      if (this.balls.length < this.maxNumBalls_ && this.failedChecks_ < 5){
          // If we still haven't failed enough times then keep checking.
          setTimeout(this.ensureOptimalFrameRate, this.checkRate_);
      } else {
          // If we fail the frame rate check three times, remove a ball and
          // call it a day.
          this.balls.pop();
      }
  },

  /**
   * The main draw/move loop for the whole simulation.
   */
  update: function(){
      this.frameCount_++;

      // Update and redraw everything.
      var balls = this.balls;
      for (var i = 0; i < balls.length; i++){
          // Protect against accidentally removing a ball min run.
          if (balls[i]) balls[i].update();
      }

      // Request animation frame is expecting to be invoked on the window so
      // call it using call.
      Utils.requestAnimationFrame.call(null, this.update);
  }
};


export default class Physics extends React.Component {
  constructor(...args) {
    super(args);

    this.svg = React.createRef();
  }
  componentDidMount() {
    BallPit.start(this.svg);
  }

  render() {
    return (
      <Slide>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"
        preserveAspectRatio="xMidYMid slice" height="500px" width="500px" ref={this.svg}>
            <g class="ball-pit"></g>
        </svg>
      </Slide>
    )
  }
}
