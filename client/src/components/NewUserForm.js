import React, { Component } from 'react';

class NewUserForm extends Component {
  state = {}

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
    return (
      <form>
        <label>
           Party Code :
           <input type="text" partyId="partyId"/>
        </label>
        <div/>
        <label>
          Name :
          <input type="text" username="username"/>
        </label>
        <div/>
        <input type="submit" value="Submit"/>
      </form>
    );
  }
}
export default NewUserForm;
