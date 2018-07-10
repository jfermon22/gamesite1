// helper utility to handle errors sendingerror codes and
const HttpStatus = require('http-status-codes');

export default function (response, code, message) {
  const error = {
    message,
    type: HttpStatus.getStatusText(code),
    code,
  };

  // TODO: implement logging of error
  console.error(error);
  response.status(code)
    .send(error);
}
