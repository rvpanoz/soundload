import electron from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';

const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

class ListItem extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="media-card">
        <div className="media-card__image" style={{
          backgroundImage: `url(${(this.props.artwork_url) ? this.props.artwork_url : ""})`
        }}>
          <i className="fa fa-play"></i>
        </div>
        <a className="media-card__footer">{this.props.title}</a>
      </div>
    )
  }
}

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tracks: []
    }
  }
  componentDidMount() {
    let active_track = this.props.track;
    if (active_track && active_track.id) {
      ipcRenderer.send('fetch-related', active_track.id);
      ipcRenderer.on('fetch-related-reply', (event, tracks) => {
        this.setState({tracks: tracks});
      });
    }
  }
  render() {
    let tracks = this.state.tracks;
    if (!tracks || !tracks.length) {
      return null;
    }

    return (
      <div className="media-cards">
        {tracks.map((track, idx) => <ListItem key={idx} {...track}/>)}
      </div>
    )
  }
}
