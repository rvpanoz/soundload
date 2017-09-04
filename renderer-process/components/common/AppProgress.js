import React from 'react';

export default class AppProgress extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    console.log('AppProgress:render');
    
    return (
      <div className="progress">
        <div ref={(el) => {
          this.el = el;
        }} className="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style={{
          width: `${this.props.percentage}%`
        }}>
          <span className="sr-only">{this.props.percentage}% Complete</span>
        </div>
      </div>
    )
  }
}
