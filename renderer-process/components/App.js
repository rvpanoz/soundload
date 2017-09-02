import electron from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';

const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

//configuration
import config from '../../config';

//app components
import Empty from './common/Empty';
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
      active_track: null,
      related_tracks: null
    }
    ipcRenderer.on('resolve-reply', (event, response) => {
      if(response.errors) {
        let error = response.errors[0];
        let dialog = remote.dialog;
        dialog.showMessageBox({
          type: 'error',
          title: 'Error',
          message: error.error_message,
          buttons: [],
          callback() {
            this.onCloseError();
          }
        });
        return;
      }

      this.setState({
        active_track: response
      });
    });
  }
  onCloseError() {
    console.log('error closed');
  }
  serialize(form) {
    let obj = {};
		let elements = form.querySelectorAll("input");

		for( let i = 0; i < elements.length; ++i ) {
			let element = elements[i];
			let name = element.name;
			let value = element.value;
			if( name ) {
				obj[ name ] = value;
			}
		}
		return obj;
  }
  resolveUrl(e) {
    e.preventDefault();
    let form = e.target, formData, url;

    formData = this.serialize(form);
    url = formData['search-input'];

    if(url.length) {
      ipcRenderer.send('resolve', url);
    } else {
      ipcRenderer.send('resolve', config.testUrl);
    }
  }
  render() {
    let _Track = (this.state.active_track === null) ? <Empty message="No track loaded."/> : <Track track={this.state.active_track}/>
    return (
      <div>
        <Header onSubmit={this.resolveUrl}/>
        {_Track}
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
