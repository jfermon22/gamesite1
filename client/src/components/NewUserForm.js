import React, {
  Component
} from 'react';
import FormBuilder from '../classes/FormBuilder';

class NewUserForm extends Component {

  constructor( props ) {
    super( props )
    this.state = {
      partyId: "",
      name: ""
    }

    this.updatePartyCode = this.updatePartyCode.bind( this );
    this.updateUserName = this.updateUserName.bind( this );
  }

  callApi = async () => {

    const url = '/v1/party/' + this.state.partyId + "/users/";
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded"
    }

    const formBuilder = new FormBuilder( url, this.state,
      "POST", headers );

    return await formBuilder.send();

    const response = await formBuilder.send();

    const body = await response.json();

    console.log( body );

    if ( response.status !== 201 )
      throw Error( body.message );

    return body;

  }

  handleClick( event ) {
    event.preventDefault();

    this
      .callApi()
      .then( res => {
        if ( res.ok ) {
          return res.json();
        } else {
          throw new Error( "Received failure code: " + res.status );
        }
      } )
      .then( data => {
           if (data.nModified ==1 )
             console.log( "Player successfully added")
      } )
      .catch( err => {
        console.log( err )
        this.setState( {
          response: err
        } )
      } );
  }

  updatePartyCode( evt ) {

    evt.target.value = evt.target.value.toUpperCase();

    this.setState( {
      partyId: evt.target.value
    } );
  }

  updateUserName( evt ) {

    evt.target.value = evt.target.value.toUpperCase();

    this.setState( {
      name: evt.target.value
    } );
  }

  render() {
    return ( <
      form >
      <
      label >
      Party Code:
      <
      input type = "text"
      onChange = {
        this.updatePartyCode
      }
      name = "partyId" / >
      <
      /label> <
      div / >
      <
      label >
      Name:
      <
      input type = "text"
      onChange = {
        this.updateUserName
      }
      name = "username" / >
      <
      /label> <
      div / >
      <
      button onClick = {
        this.handleClick.bind( this )
      } > Submit < /button> < /
      form >
    );
  }
}
export default NewUserForm;
