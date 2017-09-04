import React from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router-dom';

//Logo
const Logo = (props) => {
  return (
    <Link className="logo" id="logo" to='/'>
      <svg width="150" height="50">
        <text x="0" y="25" fill="#fff" fontFamily="Roboto" fontSize="35">SLo</text>
      </svg>
    </Link>
  )
}

//Header
class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <header className="header">
        <Logo />
        <div className="navigation">
          <ul>
            <li className="navigation-item">
              <Link to="settings">Settings</Link>
            </li>
            <li className="navigation-item">
              <Link to="about">About</Link>
            </li>
          </ul>

        </div>
      </header>
    )
  }
}

export default Header;
