/**
 * Track component
 */

'use strict';

import {remote, ipcRenderer, clipboard} from 'electron';
import React from 'react';
import AppProgress from '../common/AppProgress';
import Related from './Related';

export default class Track extends React.Component {
  constructor(props) {
    super(props);
    this.parseDate = this.parseDate.bind(this);
    this.parseDuration = this.parseDuration.bind(this);
    this.download = this.download.bind(this);
    ipcRenderer.on('download-file-error', function(event, error_message) {
      console.error(error_message);
    });
    ipcRenderer.on('download-file-reply', function(event, tags) {
      console.error(tags);
    });
    ipcRenderer.on('progress-file-reply', (event, percentage) => {
      console.log(percentage);
    });
  }
  componentDidMount() {}
  componentWillUnmount() {
    ipcRenderer.removeAllListeners(['download-file', 'download-file-error', 'download-file-reply', 'progress-file-reply']);
  }
  download(e) {
    e.preventDefault();
    let element = e.target,
      id = element.dataset.id,
      title = element.dataset.title.replace(/[^a-zA-Z]+/, '');
    ipcRenderer.send('download-file', title, id);
    return false;
  }
  parseDate(per) {
    let moment = require('moment');
    let track = this.props.track,
      created_at;

    created_at = track.created_at;
    return moment(created_at).format(per.toUpperCase());
  }
  parseDuration() {
    let duration = this.props.track.duration / 1000; //get seconds
    let min, h;

    min = (duration / 60).toFixed(2);
    h = (min / 60).toFixed(2);

    return {
      min, h
    }
  }
  render() {
    let track = this.props.track;
    if (!track) {
      return null;
    }
    console.log(track);
    return (
      <div className="track">
        <div className="track__header">
          <div className="track__info">
            <div className="profile__img">
              <img src={track.artwork_url} alt={track.title}/>
            </div>
            <div className="track__info__meta">
              <div className="track__info__type">User</div>
              <div className="track__info__name">{track.user.username}</div>
              <div className="track__info__actions">
                <button className="button-dark">
                  <i className="fa fa-play"></i>
                  Play
                </button>
                <button className="button-light" onClick={this.download}>
                  <i className="fa fa-download"></i>
                  Download
                </button>
              </div>
            </div>
          </div>
          <div className="track__listeners">
            <div className="track__listeners__count">{track.favoritings_count}</div>
            <div className="track__listeners__label">favorites</div>
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
            <div className="track__navigation__friends">
              <a href="#">
                <img src={track.artwork_url} alt={track.title}/></a>
            </div>
          </div>
        </div>
        <div className="track__content">
          <div className="tab-content">
            <div role="tabpanel" className="tab-pane active" id="track-overview">
              <div className="overview">
                <div className="overview__track">
                  <div className="section-title">Track details</div>
                  <div className="track-details">
                    <div className="track-details__song">
                      <div className="track-details__song__title">{track.title}</div>
                      <div className="track-details__song__date">
                        <span className="day">{this.parseDate('d')}/</span>
                        <span className="month">{this.parseDate('m')}/</span>
                        <span className="year">{this.parseDate('yyyy')}</span>
                      </div>
                      <hr/>
                      <div className="track-details__song__desc">{track.description}</div>
                    </div>
                  </div>
                </div>
                <div className="overview__track-info">
                  <div className="overview__track-info__box">
                    <div className="box">
                      <span className="number">
                        <i className="fa fa-clock-o"></i>&nbsp;&nbsp;{this.parseDuration().min}&nbsp;<small>min</small>
                      </span>
                    </div>
                  </div>
                  <div className="overview__track-info__box">
                    <div className="box">
                      <span className="number">
                        <i className="fa fa-heart"></i>&nbsp;&nbsp;{track.favoritings_count}&nbsp;<small>favorites</small>
                      </span>
                    </div>
                  </div>
                  <div className="overview__track-info__box">
                    <div className="box">
                      <span className="number">
                        <i className="fa fa-comment"></i>&nbsp;&nbsp;{track.comment_count}&nbsp;<small>comments</small>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div role="tabpanel" className="tab-pane" id="related-tracks">
              <Related track={track}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
