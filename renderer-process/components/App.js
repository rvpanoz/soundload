import config from '../../config';
import electron from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import {PropTypes} from 'prop-types';
import {
  HashRouter as Router
} from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.min';

const ipcRenderer = electron.ipcRenderer;

//app components
import AppMessage from './common/AppMessage';
import AppLoader from './common/AppLoader';
import Header from './common/Header';
import Main from './content/Main';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.init();
  }
  init() {
    this.state = {
      show_loader: false,
      show_message: false,
      app_message: ''
    }
  }
  render() {
    return (
      <div>
        <AppLoader isVisible={this.state.show_loader}/>
        <AppMessage isVisible={this.state.show_message} message={this.state.app_message} />
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
      return {show_loader: false}
    });
  }
}

// https://github.com/reactjs/react-router-tutorial/tree/master/lessons/12-navigating
App.contextTypes = {
  router: PropTypes.object
};

ReactDOM.render(
  <Router><App/></Router>, document.getElementById('app'));
