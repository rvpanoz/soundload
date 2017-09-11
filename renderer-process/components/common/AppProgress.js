import {remote, ipcRenderer} from 'electron';
import React from 'react';

export default class AppProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      is_visible: false,
      size: 0,
      percentage: 0
    }
  }
  componentDidMount() {
    //ipc events
    ipcRenderer.on('download-file-error', (event, error_message) => {
      console.error(error_message);
      this.setState({is_visible: false, percentage: 0});
    });
    ipcRenderer.on('download-file-reply', (event) => {
      this.setState({is_visible: false, percentage: 0});
    });
    ipcRenderer.on('on-response-reply', (event, fileSize) => {
      this.setState((prevState) => {
        return {size: fileSize, is_visible: true}
      })
    })
    ipcRenderer.on('progress-file-reply', (event, percentage) => {
      setTimeout(() => {
        this.setState((prevState, props) => {
          return {percentage: percentage}
        })
      }, 1000);
    });
  }
  componentWillUnmount() {
    ipcRenderer.removeAllListeners(['on-response-reply', 'download-file-error', 'download-file-reply', 'progress-file-reply']);
  }
  render() {
    let is_visible = this.state.is_visible;

    return (
      <div className={(is_visible)
        ? 'progress show'
        : 'progress hide'}>
        <div ref={(el) => {
          this.el = el;
        }} className="progress-bar" role="progressbar" aria-valuenow={this.state.percentage} aria-valuemin="0" aria-valuemax="100" style={{
          width: `${this.state.percentage}%`
        }}>
          <span>{this.state.percentage}%</span>
        </div>
      </div>
    )
  }
}
