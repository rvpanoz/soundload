import React from 'react';

/**
 * [Loader description]
 * @param {[type]} props [description]
 */
const Loader = (props) => {
  let is_loading = props.isLoading;
  return (
    <div id="loader" className={(is_loading)
      ? 'show'
      : 'hide'}>
      <p>Loading data..</p>
      <div className="line"></div>
      <div className="line"></div>
      <div className="line"></div>
      <div className="line"></div>
    </div>
  )
}

export default Loader;
