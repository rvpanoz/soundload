import React from 'react';
import AppProgress from '../common/AppProgress';
import Related from './Related';

const {remote, ipcRenderer, clipboard} = require('electron')
const {Menu, MenuItem} = remote
const menu = new Menu();
const menuItem = new MenuItem({
  label: 'Paste',
  click: () => {
    let text = clipboard.readText();
    //copy text to input
  }
})
let rightClickPosition = null;
menu.append(menuItem);

export default class Track extends React.Component {
  constructor(props) {
    super(props);
    console.log('track:render', props);
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
  componentDidMount() {
    let win = remote.getCurrentWindow();
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      rightClickPosition = {
        x: e.x,
        y: e.y
      }
      menu.popup(win)
    }, false);
  }
  componentWillUnmount() {
    window.removeEventListener('contextmenu', () => {});
  }
  download(e) {
    e.preventDefault();
    let element = e.target,
      id = element.dataset.id,
      title = element.dataset.title.replace(/[^a-zA-Z]+/, '');
    ipcRenderer.send('download-file', title, id);
  }
  render() {
    let track = this.props.track;
    if (!track) {
      return null;
    }
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
                <a href="#artist-overview" aria-controls="artist-overview" role="tab" data-toggle="tab" aria-expanded="true">Overview</a>
              </li>
              <li role="presentation" className="">
                <a href="#related-tracks" aria-controls="related-tracks" role="tab" data-toggle="tab" aria-expanded="false">Related Tracks</a>
              </li>
            </ul>
            <div className="track__navigation__friends">
              <a href="#">
                <img src="http://zblogged.com/wp-content/uploads/2015/11/17.jpg" alt=""/></a>
            </div>
          </div>
        </div>
        <div className="track__content"></div>
      </div>
    )
  }
}
