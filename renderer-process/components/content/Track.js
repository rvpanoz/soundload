import React from 'react';

class Track extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log('track renderer');
    this.track = this.props.track;
    if (!this.track) {
      return null;
    }

    return (
      <div className="track-details hero" id="hero">
        <div className="content">
          <img className="logo" src={this.track.artwork_url}/>
          <h2>{this.track.title}</h2>
          <p className="desc">{this.track.description}</p>
          <div className="button-wrapper">
            <a href="#" className="button" data-primary="true">Play</a>
            <a href="#" className="button btn-download" data-title={this.track.title} data-id={this.track.id} onClick={this.props.download}>Download</a>
          </div>
          <div className="overlay" style={{display: 'none'}}></div>
        </div>
      </div>
    )
  }
}

export default Track;
