/**
 * Settings page
 */

'use strict';

import React from 'react';
import {ipcRenderer} from 'electron';

export default class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.handleSelection = this.handleSelection.bind(this);
    this.setInputVal = this.setInputVal.bind(this);
  }
  handleSelection(e) {
    e.preventDefault();
    e.stopPropagation();
    ipcRenderer.send('set-output-path');
    return false;
  }
  setInputVal(event, path) {
    console.log(path);
    if (this.textInput) {
      this.textInput.innerHTML = path;
    }
  }
  componentWillMount() {
    ipcRenderer.send('get-output-path');
  }
  componentDidMount() {
    ipcRenderer.on('get-output-path-reply', this.setInputVal);
    ipcRenderer.on('set-output-path-reply', this.setInputVal);
  }
  componentWillUnmount() {
    ipcRenderer.removeAllListeners(['get-output-path-reply', 'set-output-path-reply']);
  }
  render() {
    return (
      <div className="settings" style={{
        right: this.props.position
      }}>
        <div className="form-section">
          <div className="form-section__title">
            <h3>Output directory</h3>
          </div>
          <div className="form-section__content">
            <div className="row">
              <div className="col-md-9">
                <span className="text wp100 bg-black" ref={(el) => {
                  this.textInput = el;
                }}></span>
              <a href="#" className="text apply" onClick={this.handleSelection}>change</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
