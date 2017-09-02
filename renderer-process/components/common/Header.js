import React from 'react';
import ReactDOM from 'react-dom';

//Logo
const Logo = (props) => {
  return (
    <div className="logo" id="logo">
      <svg>
        <text x="50" y="25" fill="white" fontFamily="Roboto" fontSize="25">Soupp</text>
      </svg>
    </div>
  )
}

// Search
const Search = (props) => {
  return (
    <form onSubmit={props.onSubmit} id="search" className="search">
      <input type="search" name="search-input" placeholder="Type a soundload url..."/>
    </form>
  );
};

//header layout
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
