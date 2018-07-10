import SessionTracker from './models/sessionTracker';
import Party from './models/party';

export default function() {
  /*SessionTracker.count().exec()
    .then(count => {
      if (count) {
        //if theres something in the database remove it so we can reinit
        SessionTracker.remove({}, (err, res) => {
          if (err) {
            console.log(err);
          }
        });
      }

      // create a new session tracker obj
      const session1 = new SessionTracker({
        currentId: 0
      });

      SessionTracker.create(session1, (error) => {
        if (error) {
          console.log(error);
        }
      });
    }, reason => {
      console.log(err);
    });
*/
  //clear out the party database
  Party.remove({}, (err, res) => {
    if (err) {
      console.log(err);
    }
  });
}
