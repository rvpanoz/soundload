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
    ipcRenderer.send('set-output-path');
  }
  setInputVal(event, path) {
    if (this.textInput) {
      this.textInput.value = path;
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
      <div className="container">
        <div className="settings">
          <div className="panel panel-warning">
            <div className="panel-heading">Settings</div>
            <div className="panel-body">
              <form>
                <div className="row">
                  <div className="col-sm-4">
                    <label htmlFor="output-dir">Output directory</label>
                    <div className="input-group">
                      <input ref={(el) => {
                        this.textInput = el;
                      }} type="text" className="form-control" name="output-dir" id="output-dir" disabled/>
                      <span className="input-group-addon" onClick={this.handleSelection}>
                        <i className="fa fa-arrow-right" title="Click to set output path"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
