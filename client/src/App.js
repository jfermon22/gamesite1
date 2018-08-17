import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import NewUserForm from './components/NewUserForm.js';

class App extends Component {
  state = {
    response: 'Loading...'
  }

  componentDidMount() {
    this
      .callApi()
      .then( res => {
        this.setState( { response: res.message } )
      } )
      .catch( err => {
        console.log( err )
        this.setState( this.response = err )
      } );
  }

  callApi = async () => {
    const response = await fetch( '/v1' );
    const body = await response.json();

    if ( response.status !== 200 ) 
      throw Error( body.message );
    
    return body;

  }

  render() {
    return ( <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <h1 className="App-title">
          Welcome to React
        </h1>
      </header>
      <p className="App-intro">
        {this.state.response}
      </p>
      <NewUserForm/>
    </div > );
  }
}/* original code class App extends Component {
        render() {
          return ( <div className="App">
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo"/>
              <h1 className="App-title">Welcome to React</h1>
            </header>
            <p className="App-intro">
              To get started, edit
              <code>src/App.js</code>
              and save to reload.
            </p>
          </div> );
        }
      }
      */
export default App;
