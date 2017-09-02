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
    this.el.style.backgroundImage = artwork_url;
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
    ipcRenderer.on('fetch-related-reply', (event, response) => {
      this.setState({tracks: response});
      this.list.style.opacity = 1;
    });
  }
  componentDidUpdate() {
    let active = this.props.track;
    if (active && active.id && !this.state.tracks.length) {
      ipcRenderer.send('fetch-related', active.id);
    }
  }
  render() {
    this.tracks = this.state.tracks;

    if (!this.tracks || !this.tracks.length) {
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
          {this.state.tracks.map((track, idx) => <RelatedItem key={idx} {...track}/>)}
        </div>
      </div>
    )
  }
}
