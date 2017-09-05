import React from 'react';
import {
  Route
} from 'react-router-dom';

import Settings from '../common/Settings';
import Home from './Home';
import About from './About';
import Track from './Track';

export default class Main extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="app-content container">
        <Route exact path='/' component={Track}/>
        <Route path='/track' component={Track}/>
        <Route path='/settings' component={Settings}/>
        <Route path='/about' component={About}/>
      </div>
    )
  }
}
