import Express from 'express';
import compression from 'compression';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';

// Import required modules
import parties from './routes/v1/party.routes';
import routes from './routes';
import initDb from './initDb';
import serverConfig from './config';

// Initialize the Express App
const app = new Express();

// define a constant for the API we are using
// const ROUTES_VERSION = '1';

// Set native promises as mongoose promise
mongoose.Promise = global.Promise;

// MongoDB Connection
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(serverConfig.mongoURL, (error) => {
    if (error) {
      console.error('Please make sure Mongodb is installed and running!'); // eslint-disable-line no-console
      throw error;
    }

    initDb();
  });
}

// Apply body Parser and server public assets and routes
app.use(compression());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(Express.static(path.resolve(__dirname, '../dist/client')));

// define route paths
app.use('/', routes);
app.use('/v1/parties', parties);

// start app
app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log( `\n-----------------------------------------------------------------------` ); // eslint-disable-line
    console.log( `MERN is running on port: ${serverConfig.port}! ` ); // eslint-disable-line
    console.log( `-----------------------------------------------------------------------\n` ); // eslint-disable-line
  }
});

export default app;
