/**
 * Header component
 *
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router-dom';

export default class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <section className="header">
        <div className="search">
          <form onSubmit={this.props.resolve}>
            <div className="search-bar">
              <input type="search" name="search-input" className="form-control search-input" placeholder="Type a soundcloud track url"/>
              <button id="search-button" className="button-icon">
                <i className="fa fa-search"></i>
              </button>
            </div>
          </form>
        </div>
        <div className="navigation">
          <div className="navigation__actions">
            <ul>
              <li className="navigation-item">
                <Link to="/">
                  <i className="fa fa-home"></i>
                </Link>
              </li>
              <li className="navigation-item">
                <Link to="/settings">
                  <i className="fa fa-cog"></i>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>
    )
  }
}
