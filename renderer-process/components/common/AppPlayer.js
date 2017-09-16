import {remote} from 'electron';
import React from 'react';
import moment from 'moment';

const config = remote.getGlobal('config');

export default class AppPlayer extends React.Component {
  constructor(props) {
    super(props);
    let initialTime = moment.utc(0).format("HH:mm:ss");
    this.state = {
      percentage: 0,
      duration: 0,
      volume: 1.0,
      fftSize: 256,
      preload: 'auto',
      is_playing: false,
      src: '',
      track_time: initialTime,
      track_duration: initialTime
    }
    this.updateProgress = this.updateProgress.bind(this);
    this.play = this.play.bind(this);
    this.seek = this.seek.bind(this);
    this.seekForward = this.seekForward.bind(this);
    this.seekBackward = this.seekBackward.bind(this);
    this.stop = this.stop.bind(this);
    this.adjustVolume = this.adjustVolume.bind(this);
  }
  play(e) {
    let audioSrc = this.refs.audioElement.src;
    if (!/soundcloud.com/.test(audioSrc))
      return;

    let audioRef = this.refs.audioElement;
    let playButton = this.refs.playButton;
    let is_playing = this.state.is_playing;

    if (is_playing) {
      audioRef.pause();
      playButton.classList.remove('fa-pause');
      playButton.classList.add('fa-play');
      this.setState({is_playing: false});
      return;
    }

    let playPromise = audioRef.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        playButton.classList.remove('fa-play');
        playButton.classList.add('fa-pause');
        this.setState({is_playing: true});
      }).catch(function(error) {
        throw new Error(error);
      });
    }
  }
  adjustVolume(e) {
    let volumeSlider = this.refs.volumeSlider;
    volumeSlider.style.height = `${ 120}px`;
    volumeSlider.style.opacity = 1;
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
      let end_time = this.refs.audioElement.duration * 1000;
      let formatted_duration = moment.utc(moment.duration(end_time).asMilliseconds()).format("HH:mm:ss");
      this.setState({duration: duration, track_duration: formatted_duration});
    });
    this.refs.audioElement.addEventListener('timeupdate', this.updateProgress, arguments);
  }
  componentWillUnmount() {
    this.refs.audioElement.removeAllListeners('canplay', 'timeupdate');
  }
  seek(control) {
    let audioRef = this.refs.audioElement;
    let is_playing = this.state.is_playing;

    if (is_playing) {
      let percent = 60;
      let duration = this.state.duration;
      let currentTime = audioRef.currentTime;

      if (control.classList.contains('fa-backward')) {
        percent = percent * -1;
      }
      this.setState({
        percentage: percent / 100
      }, () => {
        audioRef.currentTime += percent;
      });
    }
  }
  seekForward(e) {
    let control = this.refs.forwardButton;
    this.seek(control);
  }
  seekBackward(e) {
    let control = this.refs.backwardButton;
    this.seek(control);
  }
  stop() {
    this.refs.audioElement.pause();
    this.refs.audioElement.currentTime = 0;
    this.setState({
      percentage: 0
    }, () => {
      this.refs.playButton.classList.remove('fa-pause')
      this.refs.playButton.classList.add('fa-play');
    });
  }
  updateProgress() {
    if (!this.refs.audioElement)
      return;

    let duration = this.state.duration;
    let currentTime = this.refs.audioElement.currentTime;
    let timeNow = moment.duration(currentTime * 1000);
    let track_time = moment.utc(timeNow.asMilliseconds()).format("HH:mm:ss");
    let percentage = Math.floor(currentTime * 100 / duration);

    this.setState({track_time: track_time, percentage: percentage});
  }
  render() {
    return (
      <section className="current-track">
        <audio preload={this.state.preload} ref="audioElement" src={this.props.track
          ? this.props.track.stream_url + "?client_id=" + config.client_id
          : ''}></audio>
        <div className="current-track__actions">
          <a href="#">
            <i className="fa fa-backward" ref="backwardButton" onClick={this.seekBackward}></i>
          </a>
          <a href="#" className="big">
            <i className="fa fa-play" ref="playButton" onClick={this.play}></i>
          </a>
          <a href="#" className="big">
            <i className="fa fa-stop" ref="stopButton" onClick={this.stop}></i>
          </a>
          <a href="#">
            <i className="fa fa-forward" ref="forwardButton" onClick={this.seekForward}></i>
          </a>
        </div>
        <div className="current-track__progress">
          <div className="current-track__progress__start">{this.state.track_time}</div>
          <div className="current-track__progress__bar">
            <div ref="progress" style={{
              width: this.state.percentage + "%"
            }}></div>
          </div>
          <div className="current-track__progress__finish">{this.state.track_duration}</div>
        </div>
        <div className="current-track__options">
          <span className="controls">
            <div className="volume">
              <i className="fa fa-volume-up" style={{
                cursor: 'pointer'
              }}></i>
            </div>
          </span>
        </div>
      </section>
    )
  }
}
