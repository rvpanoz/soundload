import config from '../../../config';
import React from 'react';
import moment from 'moment';

export default class AppPlayer extends React.Component {
  constructor(props) {
    super(props);
    let initialTime = moment.utc(0).format("HH:mm:ss");
    this.state = {
      percentage: 0,
      duration: 0,
      volume: 0.0,
      fftSize: 256,
      preload: 'auto',
      src: '',
      track_time: initialTime,
      track_duration: initialTime
    }
    this.updateProgress = this.updateProgress.bind(this);
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);
  }
  play(e) {
    if (e) {
      e.preventDefault();
    }

    let audioSrc = this.refs.audioElement.src;
    if (!/http/.test(audioSrc))
      return;

    let playPromise = this.refs.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('track is playing..');
      }).catch(function(error) {
        throw new Error(error);
      });
    }
  }
  componentDidUpdate(props) {
    if (props.tracks && props.track.stream_url) {
      this.setState({
        src: props.track.stream_url + "?client_id=" + config.client_id
      });
    }
  }
  componentDidMount() {
    this.audioCtx = new(window.AudioContext || window.webkitAudioContext)(); //create audio context using HTML5 API
    this.analyser = this.audioCtx.createAnalyser(); //create analyser using HTML5 API
    this.audioSrc = this.audioCtx.createMediaElementSource(this.refs.audioElement); //create audio source using HTML5 API

    this.audioSrc.connect(this.analyser); //connect audio source with analyser
    this.analyser.connect(this.audioCtx.destination); //connect analyser with audio contxt destination

    this.analyser.fftSize = this.state.fftSize;
    this.refs.audioElement.volume = this.state.volume;

    this.refs.audioElement.addEventListener('canplay', () => {
      let duration = this.refs.audioElement.duration;
      let currentTime = this.refs.audioElement.currentTime;

      //end time
      let end_time = this.refs.audioElement.duration * 1000;
      let formatted_duration = moment.utc(moment.duration(end_time).asMilliseconds()).format("HH:mm:ss");
      this.setState({
        duration:duration,
        track_duration: formatted_duration
      });
    });
    this.refs.audioElement.addEventListener('timeupdate', this.updateProgress, arguments);
  }
  componentWillUnmount() {
    this.refs.audioElement.removeAllListeners('canplay', 'timeupdate');
  }
  stop(e) {
    if (e) {
      e.preventDefault();
    }
    this.refs.audioElement.pause();
    this.refs.audioElement.currentTime = 0;
  }
  updateProgress() {
    if (!this.refs.audioElement)
      return;

      let duration = this.state.duration;
      let currentTime = this.refs.audioElement.currentTime;
      let timeNow = moment.duration(currentTime * 1000);
      let track_time = moment.utc(timeNow.asMilliseconds()).format("HH:mm:ss");
      let percentage = Math.floor(currentTime * 100 / duration);

      this.setState({
        track_time: track_time,
        percentage: percentage
      });
  }
  render() {
    return (
      <section className="current-track">
        <audio preload={this.state.preload} ref="audioElement" src={this.props.track
          ? this.props.track.stream_url + "?client_id=" + config.client_id
          : ''}></audio>
        <div className="current-track__actions">
          <a href="#" onClick={this.play}>
            <i className="fa fa-play"></i>
          </a>
          <a href="#" onClick={this.stop}>
            <i className="fa fa-stop"></i>
          </a>
        </div>
        <div className="current-track__progress">
          <div className="current-track__progress__start">{this.state.track_time}</div>
          <div className="current-track__progress__bar">
            <div ref="progress" style={{width: this.state.percentage + "%"}}></div>
          </div>
          <div className="current-track__progress__finish">{this.state.track_duration}</div>
        </div>
        <div className="current-track__options">
          <span className="controls"></span>
        </div>
      </section>
    )
  }
}
