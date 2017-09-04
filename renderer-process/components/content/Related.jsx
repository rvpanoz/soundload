import electron from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';

const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

class RelatedItem extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    let artwork_url = this.props.artwork_url;
    if (artwork_url) {
      this.el.style.backgroundImage = `url(${artwork_url})`;
    }
  }
  render() {
    return (
      <div className="item" ref={(el) => {
        this.el = el;
      }}>
        <div className="overlay">
          <div className="title">{this.props.title}</div>
        </div>
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
  componentWillMount() {
    let active_track = this.props.track;

    ipcRenderer.on('fetch-related-reply', (event, tracks) => {
      this.setState({tracks: tracks});
    });

    if (active_track && active_track.id) {
      ipcRenderer.send('fetch-related', active_track.id);
    }
  }
  componentDidUpdate() {
    if(this.list) {
      this.list.style.opacity = 1;
    }
  }
  render() {
    let tracks = this.state.tracks;
    if (!tracks || !tracks.length) {
      return null;
    }

    return (
      <div className="title-list" ref={(el) => {
        this.list = el;
      }}>
        <div className="title">
          <h1>Related tracks</h1>
        </div>
        <div className="titles-wrapper">
          {tracks.map((track, idx) => <RelatedItem key={idx} {...track}/>)}
        </div>
      </div>
    )
  }
  componentWillReceiveProps(nextProps) {

  }
}
