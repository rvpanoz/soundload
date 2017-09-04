import React from 'react';
import AppProgress from '../common/AppProgress';
import Related from './Related';

const {remote, ipcRenderer, clipboard} = require('electron')
const {Menu, MenuItem} = remote

let rightClickPosition = null

// Search
class Search extends React.Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    if(this.props.active_url) {
      this.textInput.value = this.props.active_url;
    }
  }
  render() {
    return (
      <form onSubmit={this.props.onSubmit}>
        <div className="search-bar">
          <input ref={(input)=>{
              this.textInput = input;
            }} type="search" name="search-input" className="search-input" placeholder="Type a soundcloud track url"/>
          <button id="search-button" className="button-icon">
            <i className="fa fa-search"></i>
          </button>
        </div>
      </form>
    );
  }
};

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

    const menu = new Menu();
    const menuItem = new MenuItem({
      label: 'Paste',
      click: () => {
        let text = clipboard.readText();
        this.setState({
          active_url: text
        });
      }
    })

    menu.append(menuItem);

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
  }
  componentWillUnmount() {
    window.removeEventListener('contextmenu', () => {});
  }
  handleSubmit(e) {
    e.preventDefault();

    let path = '';
    let form = e.target;
    let url = form.querySelector('input').value;

    if (!url.length)
      return
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
        <Search onSubmit={this.handleSubmit} url={this.state.active_url}/>
        <div className="track-details hero" id="hero">
          <div className="content">
            <img className="logo" src={track.artwork_url}/>
            <h2>{track.title}</h2>
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
          <Related track={this.track}/>
        </div>
      </div>
    )
  }
}

Track.defaultProps = {
  track: null
}

export default Track;
