import React from 'react';

export default class AppProgress extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log('progrees render');
    let is_visible = this.props.isVisible;
    return (
      <div className={(is_visible)
        ? 'show'
        : 'hide'}>
        <div className="progress">
          <div ref={(el) => {
            this.progressBar = el;
          }} className="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style={{
            width: '0%'
          }}>
            <span className="sr-only">60% Complete</span>
          </div>
        </div>
      </div>
    )
  }
}
