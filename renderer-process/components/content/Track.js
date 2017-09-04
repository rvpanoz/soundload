import React from 'react';
import electron from 'electron';
import AppProgress from '../common/AppProgress';

const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

import Related from './Related';

class Track extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show_progress: false,
      progressPercentage: 0
    }
    this.download = this.download.bind(this);

    //ipc events
    ipcRenderer.on('download-file-error', function(event, errorMsg) {
      console.error(errorMsg);
    });
  }
  componentDidMount() {
    ipcRenderer.on('progress-file-reply', (event, percentage) => {
      console.log(percentage);
      // this.setState({
      //   progressPercentage: percentage
      // });
    });
  }
  download(e) {
    let element = e.target,
      id = element.dataset.id,
      title = element.dataset.title.replace(/[^a-zA-Z]+/, '');

    ipcRenderer.send('download-file', title, id);
  }
  render() {
    this.track = this.props.track;
    if (!this.track) {
      return null;
    }

    return (
      <div className="track">
        <div className="track-details hero" id="hero">
          <div className="content">
            <img className="logo" src={this.track.artwork_url}/>
            <h2>{this.track.title}</h2>
            <div className="button-wrapper">
              <a href="#" className="button" data-primary="true">Play</a>
              <a href="#" className="button btn-download" data-title={this.track.title} data-id={this.track.id} onClick={this.download}>Download</a>
            </div>
            <div className="overlay" style={{
              display: 'none'
            }}></div>
          <AppProgress percentage={this.state.progressPercentage}/>
          </div>
        </div>
        <div className="related-list">
          <Related track={this.track}/>
        </div>
      </div>
    )
  }
}

Track.defaultProps = {
  track: null
}

export default Track;
