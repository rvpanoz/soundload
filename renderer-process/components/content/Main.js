/**
 * Main component
 * the routes of the app are defined in this component
 */

import React from 'react';
import {Route} from 'react-router-dom';
import Home from './Home';
import About from './About';
import Track from './Track';
import Settings from '../common/Settings';

export default class Main extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <section className="content">
        <div className="content__middle">
          <Route exact path='/' render={(props) => {
            return <Track {...props} track={this.props.track} onPlay={this.props.onPlay} setActiveTrack={this.props.setActiveTrack}/>
          }}/>
        <Route exact path='/settings' component={Settings}/>
        </div>
      </section>
    )
  }
}
