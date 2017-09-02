import React from 'react';
import electron from 'electron';
import AppProgress from '../common/AppProgress';

const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

class Track extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      progressPercentage: 0
    }
    this.download = this.download.bind(this);
    ipcRenderer.on('download-file-error', function(event, errorMsg) {
      console.error(errorMsg);
    });

    ipcRenderer.on('progress-file-reply', (event, downloaded) => {
      console.log('downloaded ' + downloaded);
    });
  }
  download(e) {
    let fileName;
    let element = e.target,
      trackId = element.dataset.id,
      trackTitle = element.dataset.title.replace(/[^a-zA-Z]+/, '');
    ipcRenderer.send('download-file', trackTitle, trackId);
  }
  render() {
    this.track = this.props.track;

    if (!this.track) {
      return null;
    }

    return (
      <div className="track-details hero" id="hero">
        <div className="content">
          <img className="logo" src={this.track.artwork_url}/>
          <h2>{this.track.title}</h2>
          <p className="desc">{this.track.description}</p>
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
    )
  }
}

export default Track;
