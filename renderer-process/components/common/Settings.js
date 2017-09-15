/**
 * Settings page
 */

'use strict';

import React from 'react';
import {Link} from 'react-router-dom';
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
      <div className="page-content">
        <div className="settings-content">
          <div className="form-section">
            <div className="form-section__title">
              <h3>Output directory</h3>
              <span className="help-block">folder where downloaded tracks are saved</span>
            </div>
            <div className="form-section__content">
              <div className="row">
                <div className="col-lg-3 col-md-4 col-sm-5 col-xs-6">
                  <span className="text wp50" ref={(el) => {
                    this.textInput = el;
                  }}></span>
                </div>
                <div className="col-lg-1 col-md-3 col-sm-5 col-xs-6">
                  <button style={{marginTop: '15px'}} className="button-light apply" onClick={this.handleSelection}>change</button>
                </div>
              </div>
            </div>
          </div>
          <div className="actions">
            <Link to="/">Back</Link>
          </div>
        </div>
      </div>
    )
  }
}
