import electron from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';

const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

//configuration
import config from '../../config';

//app components
import Empty from './common/Empty';
import AppLoader from './common/AppLoader';
import Header from './common/Header';
import Track from './content/Track';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.init();
    this.resolveUrl = this.resolveUrl.bind(this);
  }
  init() {
    this.state = {
      show_loader: false,
      error_message: '',
      active_track: null,
      related_tracks: null
    }

    /** ipc events **/
    ipcRenderer.on('resolve-reply', (event, response) => {
      if (response.errors) {
        let error = response.errors[0];
        let dialog = remote.dialog;

        this.onCloseError();
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
      // $info.text(`Downloading ${downloaded}% of ${fileSize} MB`);
      // $progress.css({
      //   width: downloaded + "%"
      // });
    });
  }
  onCloseError() {
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
  resolveUrl(e) {
    e.preventDefault();
    let form = e.target,
      formData,
      url;

    formData = this.serialize(form);
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
    let element = e.target, trackId, trackTitle;
    trackId = element.dataset.id;
    trackTitle = element.dataset.title;
    ipcRenderer.send('download-file', trackTitle, trackId);
  }
  render() {
    console.log('app renderer');
    return (
      <div>
        <Header onSubmit={this.resolveUrl}/>
        <AppLoader isLoading={this.state.show_loader}/>
        <Track track={this.state.active_track} download={this.download}/>
      </div>
    )
  }
}

ReactDOM.render(
  <App/>, document.getElementById('app'));
