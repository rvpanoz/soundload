/**
 * Track component
 */

'use strict';

import {remote, ipcRenderer} from 'electron';
import React from 'react';
import moment from 'moment';
import AppProgress from '../common/AppProgress';
import Related from './Related';

export default class Track extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      percentage: 0,
      show_progress: false
    }
    //bind methods
    this.parseDate = this.parseDate.bind(this);
    this.parseDuration = this.parseDuration.bind(this);
    this.parseArtworkUrl = this.parseArtworkUrl.bind(this);
    this.download = this.download.bind(this);
  }
  componentDidMount() {
    ipcRenderer.on('download-file-error', (event, error_message) => {
      this.downloadBtn.disabled = false;
    });
    ipcRenderer.on('download-file-reply', (event) => {
      this.downloadBtn.disabled = false;
    });
  }
  componentDidUpdate(prevProps, prevState) {
    let itemCenter = this.refs.center;
    if (itemCenter) {
      setTimeout(() => {
        itemCenter.style.left = '50%';
      }, 1000)
    }
  }
  componentWillUnmount() {
    ipcRenderer.removeAllListeners(['download-file', 'download-file-reply', 'download-file-error']);
  }
  download(e) {
    e.preventDefault();
    let element = e.target,
      id = element.dataset.id,
      title = element.dataset.title;

    //disable button until download has finished
    this.downloadBtn.disabled = true;

    if (!title || !id)
      return;
    title = title.replace(/[^a-zA-Z]+/, ' ');
    ipcRenderer.send('download-file', title, id);
    return false;
  }
  parseArtworkUrl(w, h) {
    let url = this.props.track.artwork_url;
    return url.replace('large.jpg', `t${w}x${h}.jpg`);
  }
  parseDate() {
    let created_at = this.props.track.created_at;
    return moment(created_at, 'YYYY/MM/DD h:m:i').format('DD/MM/YYYY');
  }
  parseDuration() {
    let duration = this.props.track.duration / 1000; //get seconds
    let min,
      h;

    min = parseInt(duration / 60);
    h = (min / 60).toFixed(2);
    return {min, h}
  }
  render() {
    let styleCenter,
      track = this.props.track;
    if (!track) {
      return null;
    }
    styleCenter = {
      backgroundImage: 'url(' + track.artwork_url + ')'
    }

    return (
      <div className="track page-content">
        <div className="track__header">
          <div className="track__progress">
            <AppProgress isVisible={this.state.show_progress}/>
          </div>
          <div className="track__info">
            <div className="track__info__meta">
              <div className="track__info__name">{track.title}</div>
              <div className="track__info__actions">
                <button ref={(btn) => {
                  this.downloadBtn = btn;
                }} className="button-light" data-id={track.id} data-title={track.title} onClick={this.download}>
                  <i className="fa fa-download"></i>
                  Download
                </button>
              </div>
            </div>
          </div>
          <div className="track__listeners">
            <div className="track__listeners__count">{track.download_count}</div>
            <div className="track__listeners__label">downloads</div>
          </div>
          <div className="track__navigation">
            <ul className="nav nav-tabs" role="tablist">
              <li role="presentation" className="active">
                <a href="#track-overview" aria-controls="track-overview" role="tab" data-toggle="tab" aria-expanded="true">Overview</a>
              </li>
              <li role="presentation" className="">
                <a href="#related-tracks" aria-controls="related-tracks" role="tab" data-toggle="tab" aria-expanded="false">Related Tracks</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="track__content">
          <div className="tab-content">
            <div role="tabpanel" className="tab-pane active" id="track-overview">
              <div className="track-info">
                <div className="row">
                  <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <div className="ui-item clearfix">
                      <img src={this.parseArtworkUrl(300, 300)} alt={track.title}/>
                      <div className="ui-content">
                        <h3>{track.title}</h3>
                        <div className="ui-genre">
                          <span>{track.genre}</span>
                        </div>
                        <p>{track.description}</p>
                        <div className="ui-stats">
                          <div className="stat">
                            <i className="fa fa-heart"></i>&nbsp;{track.favoritings_count}
                          </div>
                          <div className="stat">
                            <i className="fa fa-retweet"></i>&nbsp;{track.reposts_count}
                          </div>
                          <div className="stat">
                            <i className="fa fa-comment"></i>&nbsp;{track.comment_count}
                          </div>
                          <div className="stat">
                            <i className="fa fa-download"></i>&nbsp;{track.download_count}
                          </div>
                          <div className="stat">
                            <i className="fa fa-clock-o"></i>&nbsp;{this.parseDuration().min}min
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div role="tabpanel" className="tab-pane" id="related-tracks">
              <Related track={track} setActiveTrack={this.props.setActiveTrack}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
