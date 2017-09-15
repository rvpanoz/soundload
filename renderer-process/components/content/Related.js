import _ from 'lodash';
import electron from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';

const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

class ListItem extends React.Component {
  constructor(props) {
    super(props);
    this.parseSize = this.parseSize.bind(this);
    this.parseDuration = this.parseDuration.bind(this);
    this.setActiveTrack = this.setActiveTrack.bind(this);
  }
  parseDuration() {
    let duration = this.props.duration;
    let minutes = (duration/1000)/60;
    return parseInt(minutes);
  }
  parseSize() {
    let size = this.props.original_content_size;
    let size_in_mb = size / (1024 * 1024);
    return size_in_mb.toFixed(2);
  }
  setActiveTrack() {
    let track = {};
    for (let z in this.props) {
      let prop = this.props[z];
      if (_.isFunction(prop)) {
        continue;
      } else {
        track[z] = this.props[z];
      }
    }
    return this.props.setActiveTrack(track);
  }
  render() {
    return (
      <div className="media-card">
        <div className="media-card__header h-group">
          <div className="media-card__image" style={{
            backgroundImage: `url(${ (this.props.artwork_url)
              ? this.props.artwork_url
              : ""})`
          }}>
            <i className="fa fa-play"></i>
          </div>
          <div className="media-card__favorites">
            <span className="number big">
              <i className="fa fa-heart"></i>&nbsp;{this.props.likes_count}
            </span>
          </div>
        </div>
        <div className="media-card__title">
          <a onClick={this.setActiveTrack}>{this.props.title}</a>
        </div>
        <div className="media-card__footer">
          <div className="h-group">
            <span className="number small h-group__item wp25">
              <i className="fa fa-retweet"></i>&nbsp;{this.props.reposts_count}
            </span>
            <span className="number small h-group__item wp35">
              <i className="fa fa-clock-o"></i>&nbsp;{this.parseDuration()}&nbsp;min
            </span>
            <span className="number small genre h-group__item wp35" style={{textAlign: 'right'}}>
              {this.props.genre}
            </span>
          </div>
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
    this.sortBy = this.sortBy.bind(this);
    this._onFetch = this._onFetch.bind(this);
  }
  _onFetch(event, tracks) {
    this._tracks = tracks;
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
  sortBy(e) {
    e.preventDefault();
    let element = e.target;
    let field = element.dataset.field;
    let tracks = this.state.tracks;

    tracks = _.orderBy(tracks, [field], ['desc']);
    this.setState({tracks: tracks});
  }
  render() {
    let tracks = this.state.tracks;
    if (!tracks) {
      return null;
    }

    return (
      <div className="related-tracks">
        <div>
          <div className="dropdown">
            <button className="dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Sort by&nbsp;<i className="fa fa-chevron-down"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-left" aria-labelledby="dropdownMenu1">
              <li>
                <a href="#" onClick={this.sortBy} data-field="likes_count">Likes</a>
              </li>
              <li>
                <a href="#" onClick={this.sortBy} data-field="original_content_size">Size</a>
              </li>
              <li>
                <a href="#" onClick={this.sortBy} data-field="duration">Duration</a>
              </li>
              <li>
                <a href="#" onClick={this.sortBy} data-field="reposts_count">Reposts</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="media-cards">
          {tracks.map((track, idx) => <ListItem setActiveTrack={this.props.setActiveTrack} key={idx} {...track}/>)}
        </div>
      </div>
    )
  }
}
