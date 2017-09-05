import config from '../../config';
import electron from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import {PropTypes} from 'prop-types';
import {HashRouter as Router} from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.min';

const ipcRenderer = electron.ipcRenderer;

//app components
import AppMessage from './common/AppMessage';
import AppLoader from './common/AppLoader';
import AppPlayer from './common/AppPlayer';
import Header from './common/Header';
import Main from './content/Main';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      show_loader: false,
      show_message: false,
      app_message: '',
      active_track: null
    }
    this.resolve = this.resolve.bind(this);
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
  resolve(e) {
    let url,
      form;
    if (e) {
      e.preventDefault();
      form = e.target;
      url = form.querySelector('input').value;
    }
    if (!url || !url.length)
      url = "https://soundcloud.com/renzone/louie-vega-feat-julie-mcknight-diamond-life-richard-earnshaw";
    this.setState({show_loader: true, active_track: null});
    ipcRenderer.send('resolve', url);
  }

  render() {
    return (
      <div>
        <AppLoader isVisible={this.state.show_loader}/>
        <AppMessage isVisible={this.state.show_message} message={this.state.app_message}/>
        <Header resolve={this.resolve}/>
        <Main track={this.state.active_track}/>
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
