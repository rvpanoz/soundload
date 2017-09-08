import React from 'react';

export default class AppPlayer extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <section className="current-track">
        <div className="current-track__actions">
          <a href="#">
            <i className="fa fa-play"></i>
          </a>
          <a href="#">
            <i className="fa fa-pause"></i>
          </a>
        </div>
        <div className="current-track__progress">
          <div className="current-track__progress__start">0:00</div>
          <div className="current-track__progress__bar"></div>
          <div className="current-track__progress__finish">0:00</div>
        </div>
        <div className="current-track__options">
          <span className="controls">
            
          </span>
        </div>
      </section>
    )
  }
}
