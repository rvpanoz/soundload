import React from 'react';
import ReactDOM from 'react-dom';

class RelatedItem extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div></div>
    )
  }
}

export default class List extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    if (!this.props.tracks || this.props.tracks.length === 0) {
      return null;
    }

    return (
      <div>
        {this.props.tracks.map((track, idx) => <RelatedItem key={idx} {...track}/>)}
      </div>
    )
  }
}
