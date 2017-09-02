import React from 'react';

/**
 * [AppMessage description]
 * @param {[type]} props [description]
 */
const AppMessage = (props) => {
  let is_visible = props.isVisible;
  return (
    <div id="app-message" className={(is_visible)
      ? 'show'
      : 'hide'}>
      <p className="text-danger">{props.message}</p>
    </div>
  )
}

export default AppMessage;
