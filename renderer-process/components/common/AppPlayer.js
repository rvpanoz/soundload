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
            <a href="#" className="control">
              <i className="fa fa-refresh"></i>
            </a>
            <a href="#" className="control volume">
              <i className="ion-volume-high"></i>
              <div id="song-volume" className="noUi-target noUi-ltr noUi-horizontal noUi-background">
                <div className="noUi-base">
                  <div className="noUi-origin noUi-stacking" style={{left: '90%'}}>
                    <div className="noUi-handle noUi-handle-lower"></div>
                  </div>
                </div>
              </div>
            </a>
          </span>
        </div>
      </section>
    )
  }
}
