import React from 'react';

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
