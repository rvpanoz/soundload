import React from 'react';

// Search
export default class Search extends React.Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    if(this.props.active_url) {
      this.textInput.value = this.props.active_url;
    }
  }
  render() {
    return (
      <form onSubmit={this.props.onSubmit}>
        <div className="search-bar">
          <input ref={(input)=>{
              this.textInput = input;
            }} type="search" name="search-input" className="form-control search-input" placeholder="Type a soundcloud track url"/>
          <button id="search-button" className="button-icon">
            <i className="fa fa-search"></i>
          </button>
        </div>
      </form>
    );
  }
};
