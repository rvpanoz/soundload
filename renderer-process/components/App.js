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
import Related from './content/Related';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.init();
    this.resolveUrl = this.resolveUrl.bind(this);
  }
  init() {
    this.state = {
      show_loader: false,
      show_message: false,
      app_message: '',
      active_track: null
    }

    /** ipc events **/
    ipcRenderer.on('resolve-reply', (event, response) => {
      this.hideMessage();
      if (response.errors && typeof response.errors === 'object') {
        let error_message = response.errors[0].error_message;
        this.showMessage(error_message, 'error');
        this.hideLoader();
        return;
      }

      setTimeout(() => {
        this.setState((prevState, props) => {
          return {show_loader: false, active_track: response}
        });
      }, 1500)
    });

    ipcRenderer.on('download-file-error', function(event, errorMsg) {
      console.error(errorMsg);
    });

    ipcRenderer.on('progress-file-reply', (event, downloaded) => {
      console.log('downloaded ' + downloaded);
    });
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
  componentDidUpdate() {
    let active = this.state.active_track;
    if(active) {

    }
  }
  resolveUrl(e) {
    e.preventDefault();
    let form = e.target,
      formData = this.serialize(form),
      url = formData['search-input'];
    this.setState({show_loader: true, active_track: null});
    if (url.length) {
      ipcRenderer.send('resolve', url);
    } else {
      ipcRenderer.send('resolve', config.testUrl);
    }
  }
  download(e) {
    let fileName;
    let element = e.target,
      trackId,
      trackTitle;
    trackId = element.dataset.id;
    trackTitle = element.dataset.title;
    ipcRenderer.send('download-file', trackTitle, trackId);
  }
  render() {
    return (
      <div>
        <AppLoader isVisible={this.state.show_loader}/>
        <AppMessage message={this.state.app_message} isVisible={this.state.show_message}/>
        <Header onSubmit={this.resolveUrl}/>
        <Track track={this.state.active_track} download={this.download}/>
        <Related track={this.state.active_track}/>
      </div>
    )
  }
}

ReactDOM.render(
  <App/>, document.getElementById('app'));
