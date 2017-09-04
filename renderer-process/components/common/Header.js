import React from 'react';
import ReactDOM from 'react-dom';

//Logo
const Logo = (props) => {
  return (
    <div className="logo" id="logo">
      <svg>
        <text x="50" y="25" fill="white" fontFamily="Roboto" fontSize="25">Soud</text>
      </svg>
    </div>
  )
}

// Search
class Search extends React.Component {
  render() {
    return (
      <form onSubmit={this.props.onSubmit} id="search" className="search">
        <input type="search" name="search-input" placeholder="Type a soundcloud track url"/>
      </form>
    );
  }
};

//Header
class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <header className="header">
        <Logo/>
        <Search onSubmit={this.props.onSubmit}/>
      </header>
    )
  }
}

export default Header;
