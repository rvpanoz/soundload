import config from '../../../config';
import React from 'react';

export default class AppPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      preload: 'none',
      src: ''
    }
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);
  }
  play(e) {
    if(e) {
      e.preventDefault();
    }
    let playPromise = this.audioEl.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('track is playing..');
      }).catch(function(error) {
        throw new Error(error);
      });
    }
  }
  componentDidUpdate(props) {
    if(props.tracks && props.track.stream_url) {
      this.setState({
        src: props.track.stream_url + "?client_id=" + config.client_id
      }, () => {
        this.audioEL.pause();
        this.audioEl.load();
      })
    }
  }
  componentDidMount() {
    this.audioEl.addEventListener('canplay', () => {
      console.log('can play audio');
    });
  }
  componentWillUnmount() {
    this.audioEl.removeAllListeners('canplay');
    this.audioEl.remove();
  }
  stop(e) {
    if (e) {
      e.preventDefault();
    }
    let audio = this.audioEl;
    audio.pause();
    audio.currentTime = 0;
  }
  render() {
    return (
      <section className="current-track">
        <audio preload={this.state.preload} ref={(audio) => {
          this.audioEl = audio;
        }} src={this.props.track ? this.props.track.stream_url + "?client_id=" + config.client_id : ''}></audio>
        <div className="current-track__actions">
          <a href="#" onClick={this.play}>
            <i className="fa fa-play"></i>
          </a>
          <a href="#" onClick={this.stop}>
            <i className="fa fa-stop"></i>
          </a>
        </div>
        <div className="current-track__progress">
          <div className="current-track__progress__start">0:00</div>
          <div className="current-track__progress__bar"></div>
          <div className="current-track__progress__finish">0:00</div>
        </div>
        <div className="current-track__options">
          <span className="controls"></span>
        </div>
      </section>
    )
  }
}
