import config from '../../../config';
import React from 'react';
import moment from 'moment';

export default class AppPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      percentage: 0,
      preload: 'none',
      src: '',
      track_time: '0:00',
      track_duration: '0:00'
    }
    this.updateProgress = this.updateProgress.bind(this);
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);
  }
  play(e) {
    if(e) {
      e.preventDefault();
    }
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
    if(props.tracks && props.track.stream_url) {
      this.setState({
        src: props.track.stream_url + "?client_id=" + config.client_id
      }, () => {
        this.audioEL.pause();
        this.refs.audioElement.load();
      })
    }
  }
  componentDidMount() {
		this.audioCtx = new(window.AudioContext || window.webkitAudioContext)(); //create audio context using HTML5 API
		this.analyser = this.audioCtx.createAnalyser(); //create analyser using HTML5 API
		this.audioSrc = this.audioCtx.createMediaElementSource(this.refs.audioElement); //create audio source using HTML5 API

    this.audioSrc.connect(this.analyser); //connect audio source with analyser
		this.analyser.connect(this.audioCtx.destination); //connect analyser with audio contxt destination

		this.analyser.fftSize = 256;
		this.refs.audioElement.volume = 1.0;

    this.refs.audioElement.addEventListener('canplay', () => {
      console.log('can play audio');
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
    this.refs.audioElement.load(); //clear buffer
  }
  convertToMinutes(seconds) {
    return moment.duration(seconds,'seconds').minutes();
  }
  convertToHours(seconds) {
    return moment.duration(seconds,'seconds').asHours();
  }
  updateProgress () {
    if(!this.refs.audioElement) return;

		let currentTime = this.refs.audioElement.currentTime;
		let duration = this.refs.audioElement.duration;

    this.setState({
      track_duration: Math.floor(moment.duration(duration,'seconds').asHours()) + ':' + moment.duration(duration,'seconds').minutes() + ':' + moment.duration(duration,'seconds').seconds()
    });

		let current_milliseconds = currentTime * 1000;
		let timeNow = moment.duration(current_milliseconds);
		let t = moment.utc(timeNow.asMilliseconds()).format("HH:mm:ss");

		this.setState({
      track_time: t
    })

		if (currentTime > 0) {
			let value = Math.floor(currentTime * 100 / duration);
			this.setState({
        percentage: value
      });
		}
	}
  render() {
    return (
      <section className="current-track">
        <audio preload={this.state.preload} ref="audioElement" src={this.props.track ? this.props.track.stream_url + "?client_id=" + config.client_id : ''}></audio>
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
          <div className="current-track__progress__bar" style={{width: this.state.percentage + "px"}}></div>
        <div className="current-track__progress__finish">{this.state.track_duration}</div>
        </div>
        <div className="current-track__options">
          <span className="controls"></span>
        </div>
      </section>
    )
  }
}
