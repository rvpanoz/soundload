import electron from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import {PropTypes} from 'prop-types';

import {
  HashRouter as Router,
  Route
} from 'react-router-dom';

const ipcRenderer = electron.ipcRenderer;

//configuration
import config from '../../config';

import 'bootstrap/dist/js/bootstrap.min';

//app components
import AppMessage from './common/AppMessage';
import AppLoader from './common/AppLoader';
import Header from './common/Header';
import Settings from './common/Settings';
import Home from './content/Home';
import About from './content/About';
import Track from './content/Track';

class Main extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="app-content container">
        <Route exact path='/' component={Track}/>
        <Route path='/track' component={Track}/>
        <Route path='/settings' component={Settings}/>
        <Route path='/about' component={About}/>
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.init();
  }
  init() {
    this.state = {
      show_loader: false,
      show_message: false,
      app_message: '',
      active_track: null
    }
  }
  render() {
    return (
      <div>
        <AppLoader isVisible={this.state.show_loader}/>
        <AppMessage message={this.state.app_message} isVisible={this.state.show_message}/>
        <Header/>
        <Main />
      </div>
    )
  }
  showMessage(message) {
    this.setState((prevState, props) => {
      return {show_message: true, app_message: message}
    });
  }
  hideMessage() {
    this.setState((prevState, props) => {
      return {show_message: false, app_message: ''}
    });
  }
  hideLoader() {
    this.setState((prevState, props) => {
      return {show_loader: false, active_track: null}
    });
  }
}

// https://github.com/reactjs/react-router-tutorial/tree/master/lessons/12-navigating
App.contextTypes = {
  router: PropTypes.object
};

ReactDOM.render(
  <Router><App/></Router>, document.getElementById('app'));
