import electron from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';

const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

//configuration
import config from '../../config';

//app components
import AppMessage from './common/AppMessage';
import AppLoader from './common/AppLoader';
import Header from './common/Header';
import Track from './content/Track';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.init();
    this.resolve = this.resolve.bind(this);
  }
  init() {
    this.state = {
      show_loader: false,
      show_message: false,
      app_message: '',
      active_track: null
    }

    /** ipc events **/
    ipcRenderer.on('resolve-reply', (event, track) => {
      if (track.errors && typeof track.errors === 'object') {
        let error_message = track.errors[0].error_message;
        // this.showMessage(error_message, 'error');
        // this.hideLoader();
        console.error(error_message);
        return;
      }
      this.setState((prevState, props) => {
        return {show_loader: true, active_track: track}
      });
    });
  }
  componentWillReceiveProps(nextProps) {
    console.log('App', nextProps);
  }
  resolve(e) {
    e.preventDefault();
    let form = e.target,
      formData = this.serialize(form),
      url = formData['search-input'];

    if (url.length) {
      this.setState({
        show_loader: true
      });
      ipcRenderer.send('resolve', url);
    } else {
      ipcRenderer.send('resolve', config.testUrl);
      // this.showMessage('Please type the URL');
    }
    return;
  }
  render() {
    return (
      <div className="app-content">
        <AppLoader isVisible={this.state.show_loader}/>
        <AppMessage message={this.state.app_message} isVisible={this.state.show_message}/>
        <Header onSubmit={this.resolve}/>
        <Track track={this.state.active_track}/>
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
  serialize(form) {
    let obj = {};
    let elements = form.querySelectorAll("input");

    for (let i = 0; i < elements.length; ++i) {
      let element = elements[i];
      let name = element.name;
      let value = element.value;
      if (name) {
        obj[name] = value;
      }
    }
    return obj;
  }
}

ReactDOM.render(
  <App/>, document.getElementById('app'));
