/**
 * Track component
 */

'use strict';

import {remote, ipcRenderer} from 'electron';
import React from 'react';
import AppProgress from '../common/AppProgress';
import Related from './Related';

export default class Track extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      percentage: 0,
      show_loader: false
    }
    //bind methods
    this.parseDate = this.parseDate.bind(this);
    this.parseDuration = this.parseDuration.bind(this);
    this.download = this.download.bind(this);
  }
  componentWillUnmount() {
    ipcRenderer.removeAllListeners(['download-file']);
  }
  download(e) {
    e.preventDefault();
    let element = e.target,
      id = element.dataset.id,
      title = element.dataset.title;

    if (!title || !id)
      return;
    title = title.replace(/[^a-zA-Z]+/, '');
    ipcRenderer.send('download-file', title, id);
    return false;
  }
  parseDate() {
    let moment = require('moment');
    let track = this.props.track,
      created_at;

    created_at = track.created_at;
    return moment(created_at).format('DD/MM/YYYY');
  }
  parseDuration() {
    let duration = this.props.track.duration / 1000; //get seconds
    let min,
      h;

    min = (duration / 60).toFixed(2);
    h = (min / 60).toFixed(2);
    return {min, h}
  }
  render() {
    let track = this.props.track;
    if (!track) {
      return null;
    }
    return (
      <div className="track page-content">
        <div className="track__header">
          <div className="track__progress">
            <AppProgress isVisible={this.state.show_loader}/>
          </div>
          <div className="track__info">
            <div className="profile__img">
              <img src={track.artwork_url} alt={track.title}/>
            </div>
            <div className="track__info__meta">
              <div className="track__info__type">Title</div>
              <div className="track__info__name">{track.title}</div>
              <div className="track__info__actions">
                <button className="button-dark">
                  <i className="fa fa-play"></i>
                  Play
                </button>
                <button className="button-light" data-id={track.id} data-title={track.title} onClick={this.download}>
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
            <div className="track__navigation__friends">
              {this.parseDate()}
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
                      <div className="track-details__song__date"></div>
                      <br/>
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
                        <i className="fa fa-heart"></i>&nbsp;&nbsp;{track.favoritings_count || track.likes_count}&nbsp;<small>favorites</small>
                      </span>
                    </div>
                  </div>
                  <div className="overview__track-info__box">
                    <div className="box">
                      <span className="number">
                        <i className="fa fa-retweet"></i>&nbsp;&nbsp;{track.reposts_count}&nbsp;<small>reposts</small>
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
              <Related track={track} setActiveTrack={this.props.setActiveTrack}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
