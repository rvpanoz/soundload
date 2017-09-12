import config from '../../config';
import {remote, ipcRenderer} from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import {PropTypes} from 'prop-types';
import {HashRouter as Router} from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.min';

//app components
import AppMessage from './common/AppMessage';
import AppLoader from './common/AppLoader';
import AppPlayer from './common/AppPlayer';
import Header from './common/Header';
import Settings from './common/Settings';
import Main from './content/Main';

class App extends React.Component {
  constructor(props) {
    super(props)

    //set initial state
    this.state = {
      show_loader: false,
      show_message: false,
      app_message: '',
      active_track: null,
      source: null,
      app_settings_position: -350,
      playing: false
    }

    //bind method context to this
    this.resolve = this.resolve.bind(this);
    this.showSettings = this.showSettings.bind(this);
    this.setActiveTrack = this.setActiveTrack.bind(this);

    //ipc 'resolve-reply' event handler
    ipcRenderer.on('resolve-reply', (event, error, track) => {
      if (error || (track.errors && typeof track.errors === 'object')) {
        let error_message = error[0].error_message || track.errors[0].error_message;
        this._clearState();
        return;
      }
      this.setState((prevState, props) => {
        return {show_loader: false, active_track: track, source: track.stream_url}
      });
    });
  }
  _clearState() {
    this.setState({
      show_loader: false,
      active_track: null,
    }, () => {

    });
  }
  componentDidMount() {
    /** __DEV__ **/
    let Menu = remote.Menu;
    let MenuItem = remote.MenuItem;
    let rightClickPosition = null

    const menu = new Menu()
    const menuItem = new MenuItem({
      label: 'Inspect Element',
      click: () => {
        remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
      }
    })

    menu.append(menuItem);
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      rightClickPosition = {
        x: e.x,
        y: e.y
      }
      menu.popup(remote.getCurrentWindow());
    }, false)
    /** __DEV__  **/

    window.addEventListener('beforeunload', function() {
      ipcRenderer.send('clear-cache');
    });
  }
  resolve(e) {
    let url,
      form;
    if (e) {
      e.preventDefault();
      form = e.target;
      url = form.querySelector('input').value;
    }
    if (!url || !url.length)
      url = config.testUrl;

    this.setState({show_loader: true, active_track: null, app_settings_position: -350});
    ipcRenderer.send('resolve', url);
  }
  setActiveTrack(track) {
    if(!track) return;
    this.setState({
      active_track: track
    }, () => {
      ipcRenderer.send('fetch-related', track.id);
      $('.content').animate({
        scrollTop: 0
      }, 1000);
    });
  }
  showSettings(e) {
    e.preventDefault();
    this.setState(function(prevState, props) {
      return {
        app_settings_position: (prevState.app_settings_position < 0) ? 0 : -350
      };
    });
  }
  render() {
    return (
      <div className="app-content">
        <AppLoader isVisible={this.state.show_loader}/>
        <Header resolve={this.resolve} showSettings={this.showSettings}/>
        <Main track={this.state.active_track} setActiveTrack={this.setActiveTrack}/>
        <AppPlayer track={this.state.active_track}/>
        <Settings position={this.state.app_settings_position}/>
      </div>
    )
  }
}

// https://github.com/reactjs/react-router-tutorial/tree/master/lessons/12-navigating
App.contextTypes = {
  router: PropTypes.object
};

ReactDOM.render(
  <Router><App/></Router>, document.getElementById('app'));
