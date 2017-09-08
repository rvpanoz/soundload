import _ from 'lodash';
import electron from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';

const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

class ListItem extends React.Component {
  constructor(props) {
    super(props);
    this.setActiveTrack = this.setActiveTrack.bind(this);
  }
  setActiveTrack() {
    let track = {};
    for(let z in this.props) {
      let prop = this.props[z];
      if(_.isFunction(prop)) {
        continue;
      } else {
        track[z] = this.props[z];
      }
    }
    return this.props.setActiveTrack(track);
  }
  render() {
    console.log(this.props);
    return (
      <div className="media-card">
        <div className="media-card__header h-group">
          <div className="media-card__image" style={{
            backgroundImage: `url(${(this.props.artwork_url) ? this.props.artwork_url : ""})`
          }}>
            <i className="fa fa-play"></i>
          </div>
          <div className="media-card__favorites">
            <span className="number small">
              <i className="fa fa-heart"></i><br/>{this.props.likes_count}
            </span>
          </div>
        </div>

        <a onClick={this.setActiveTrack} className="media-card__footer">{this.props.title}</a>
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
    this._onFetch = this._onFetch.bind(this);
  }
  _onFetch(event, tracks) {
    this.setState({tracks: tracks});
  }
  shouldComponentUpdate() {
    let active_track = this.props.track;
    return (active_track && active_track.id);
  }
  componentDidMount() {
    ipcRenderer.send('fetch-related', this.props.track.id);
    ipcRenderer.on('fetch-related-reply', this._onFetch);
  }
  componentWillUnmount() {
    ipcRenderer.removeAllListeners('fetch-related-reply');
  }
  render() {
    let tracks = this.state.tracks;
    if (!tracks) {
      return null;
    }

    return (
      <div className="media-cards">
        {tracks.map((track, idx) => <ListItem setActiveTrack={this.props.setActiveTrack} key={idx} {...track}/>)}
      </div>
    )
  }
}
