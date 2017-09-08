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
      position: -350
    }

    //bind method contxt to this
    this.resolve = this.resolve.bind(this);
    this.showSettings = this.showSettings.bind(this);
    this.setActiveTrack = this.setActiveTrack.bind(this);

    //ipc event hanlder
    ipcRenderer.on('resolve-reply', (event, track) => {
      if (track.errors && typeof track.errors === 'object') {
        let error_message = track.errors[0].error_message;
        console.error(error_message);
        return;
      }
      setTimeout(() => {
        this.setState((prevState, props) => {
          return {show_loader: false, active_track: track}
        });
      }, config._wait);
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
    /** __DEV__ **/
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
      url = "https://soundcloud.com/mcslee/valentine-in-spades";

    this.setState({show_loader: true, active_track: null, position: -350});
    ipcRenderer.send('resolve', url);
  }
  setActiveTrack(track) {
    if(!track) return;
    this.setState({
      active_track: track
    });
  }
  showSettings(e) {
    e.preventDefault();
    this.setState(function(prevState, props) {
      return {
        position: (prevState.position < 0) ? 0 : -350
      };
    });
  }
  render() {
    console.log('App rendered');
    return (
      <div className="app-content">
        <AppLoader isVisible={this.state.show_loader}/>
        <Header resolve={this.resolve} showSettings={this.showSettings}/>
        <Main track={this.state.active_track} setActiveTrack={this.setActiveTrack}/>
        <AppPlayer track={this.state.active_track}/>
        <Settings position={this.state.position}/>
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
