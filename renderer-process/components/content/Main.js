import React from 'react';
import {Route} from 'react-router-dom';

import Home from './Home';
import About from './About';
import Track from './Track';

export default class Main extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <section className="content">
        <div className="content__middle">
          <Route exact path='/' render={(props) => {
            return <Track {...props} track={this.props.track}/>
          }}/>
          <Route exact path='/about' component={About}/>
        </div>
      </section>
    )
  }
}
