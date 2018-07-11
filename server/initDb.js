import Party from './models/party';

export default function () {
  // clear out the party database
  Party.remove({}, (err, res) => {
    if (err) {
      // TODO: add some logging
      // console.log(err);
    } else {
      void res;
    }
  });
}
