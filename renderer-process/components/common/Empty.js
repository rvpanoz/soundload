import React from 'react';

export default class Empty extends React.Component {
  render() {
    return (
      <div className="track-details hero" id="hero">
        <div className="content">
          <div className="empty">{this.props.message}</div>
        </div>
      </div>
    )
  }
}
