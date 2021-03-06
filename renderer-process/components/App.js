/**
 * App Component
 *
 */

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

const config = remote.getGlobal('config');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show_loader: false,
      show_settings: false,
      active_track: null
    }

    //bind method's context to this
    this.resolve = this.resolve.bind(this);
    this.showSettings = this.showSettings.bind(this);
    this.setActiveTrack = this.setActiveTrack.bind(this);

    //ipc 'resolve-reply and resolve-reply-error' event handlers
    ipcRenderer.on('resolve-reply', (event, track) => {
      this.setState((prevState, props) => {
        return {show_loader: false, active_track: track, show_settings: false}
      });
    });

    ipcRenderer.on('resolve-reply-error', (event, error) => {
      let error_message = error[0].error_message;
      console.error(error_message);
      this._clearState();
    });
  }
  _clearState() {
    this.setState({
      show_loader: false,
      show_settings: false,
      active_track: null
    }, () => {
      console.info('state cleared');
    });
  }
  componentWillUnmount() {
    ipcRenderer.send('clear-cache');
  }
  resolve(e) {
    e.preventDefault();
    let form = e.target;
    let url = form.querySelector('input').value;

    if (!url || !url.length) {
      console.info('Resolve: Url is missing');
      return;
    }
    this.setState({show_loader: true, active_track: null, show_settings: false});
    ipcRenderer.send('resolve', url);
  }
  setActiveTrack(track) {
    if (!track) {
      throw new Error('setActiveTrack failed: Track is undefined');
    }
    this.setState({
      active_track: track
    }, () => {
      ipcRenderer.send('fetch-related', track.id);
      window.scrollTo(0, 0);
    });
  }
  showSettings(e) {
    e.preventDefault();
    this.setState((prevState) => {
      show_settings : !prevState.show_settings
    });
  }
  render() {
    return (
      <div className="app-content">
        <AppLoader isVisible={this.state.show_loader}/>
        <Header resolve={this.resolve} showSettings={this.showSettings}/>
        <Main track={this.state.active_track} setActiveTrack={this.setActiveTrack}/>
        <AppPlayer track={this.state.active_track}/>
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
