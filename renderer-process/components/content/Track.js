import config from '../../../config';
import React from 'react';
import AppProgress from '../common/AppProgress';

import Search from './Search';
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

class Track extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active_track: null,
      show_progress: false,
      active_url: null,
      progressPercentage: 0
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.download = this.download.bind(this);

    ipcRenderer.on('download-file-error', function(event, errorMsg) {
      console.error(errorMsg);
    });
    ipcRenderer.on('download-file-reply', function(event, tags) {
      console.error(tags);
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
    }, false)

    ipcRenderer.on('resolve-reply', (event, track) => {
      if (track.errors && typeof track.errors === 'object') {
        let error_message = track.errors[0].error_message;
        console.error(error_message);
        return;
      }
      this.setState((prevState, props) => {
        return {active_track: track}
      });
    });

    ipcRenderer.on('progress-file-reply', (event, percentage) => {
      console.log(percentage);
    });

    this.handleSubmit();
  }
  componentWillUnmount() {
    window.removeEventListener('contextmenu', () => {});
  }
  handleSubmit(e) {
    let url, form;
    if(e) {
      e.preventDefault();
      form = e.target;
      url = form.querySelector('input').value;
    }
    if (!url || !url.length)
      url = config.testUrl;
    ipcRenderer.send('resolve', url);
    return;
  }
  download(e) {
    e.preventDefault();
    let element = e.target,
      id = element.dataset.id,
      title = element.dataset.title.replace(/[^a-zA-Z]+/, '');
    ipcRenderer.send('download-file', title, id);
  }
  render() {
    let track = this.state.active_track;
    if (!track) {
      return (
        <div>
          <div className="title">
            <h2>Discover</h2>
          </div>
          <Search onSubmit={this.handleSubmit}/>
        </div>
      )
    }

    return (
      <div className="track">
        <div className="title">
          <h2>Discover</h2>
        </div>
        <Search onSubmit={this.handleSubmit}/>
        <div className="track-details hero" id="hero">
          <div className="content">
            <h2>{track.title}</h2>
            <img className="logo" src={track.artwork_url}/>
            <div className="button-wrapper">
              <a href="#" className="button" data-primary="true">Play</a>
              <a href="#" className="button btn-download" data-title={track.title} data-id={track.id} onClick={this.download}>Download</a>
            </div>
            <div className="overlay" style={{
              display: 'none'
            }}></div>
            <AppProgress percentage={this.state.progressPercentage}/>
          </div>
        </div>
        <div className="related-list">
          <Related track={track}/>
        </div>
      </div>
    )
  }
}

export default Track;
