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
  componentDidMount() {
    this.searchInput.focus();
  }
  render() {
    return (
      <section className="header">
        <div className="search">
          <form onSubmit={this.props.resolve}>
            <div className="search-bar">
              <input type="search" ref={(el) => {
                this.searchInput = el;
              }} name="search-input" className="form-control search-input" placeholder="Type a soundcloud track url"/>
              <button id="search-button" className="button-icon">
                <i className="fa fa-search"></i>
              </button>
            </div>
          </form>
        </div>
        <div className="navigation">
          <div className="navigation__actions">
            <ul>
              <li className="navigation__list__item">
                <Link to="/">
                  <i className="fa fa-home"></i>
                </Link>
              </li>
              <li className="navigation__list__item">
                <a href="#" onClick={this.props.showSettings}>
                  <i className="fa fa-cog"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    )
  }
}
