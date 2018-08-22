class FormBuilder {
  constructor( url, body, method, headers ) {
    this.url = url;
    this.formBody = [];
    this.method = method;
    this.headers = headers;

    for ( var property in body ) {
      var encodedKey = encodeURIComponent( property );
      var encodedValue = encodeURIComponent( body[ property ] );
      this.formBody.push( encodedKey + "=" + encodedValue );
    }

    this.formBody = this.formBody.join( "&" );
  }

  set method( val ) {
    if ( val !== "POST" && val !== "GET" &&
      val !== "PUT" && val !== "DELETE" ) {
      alert( "method {" + val + "} is not of valid type" );
      return;
    }
    this._method = val;
  }

  get method() {
    return this._method;
  }

  send() {
    return fetch( this.url, {
      method: this.method,
      headers: this.headers,
      body: this.formBody,
    } );
  }
}

module.exports = FormBuilder;
