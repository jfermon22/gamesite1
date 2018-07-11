import Express from 'express';
import compression from 'compression';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
// React And Redux Setup
import { Provider } from 'react-redux';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import Helmet from 'react-helmet';
import { configureStore } from '../client/store';
import intlWrapper from '../client/modules/Intl/IntlWrapper';
// Import required modules
import routes from '../client/routes';
import { fetchComponentData } from './util/fetchData';
import parties from './routes/v1/party.routes';
import initDb from './initDb';
import serverConfig from './config';

// Initialize the Express App
const app = new Express();
// Set Development modes checks
const isDevMode = process.env.NODE_ENV === 'development' || false;
const isProdMode = process.env.NODE_ENV === 'production' || false;
// define a constant for the API we are using
const ROUTES_VERSION = '1';

// Run Webpack dev server in development mode
if (isDevMode) {
  // Webpack Requirements
  // eslint-disable-next-line global-require
  const webpack = require('webpack');
  // eslint-disable-next-line global-require
  const config = require('../webpack.config.dev');
  // eslint-disable-next-line global-require
  const webpackDevMiddleware = require('webpack-dev-middleware');
  // eslint-disable-next-line global-require
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath,
    watchOptions: {
      poll: 1000,
    },
  }));
  app.use(webpackHotMiddleware(compiler));
}

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
app.use(`/v${ROUTES_VERSION}`, parties);

// Render Initial HTML
const renderFullPage = (html, initialState) => {
  void initialState;
  const head = Helmet.rewind();

  // Import Manifests
  // const assetsManifest = process.env.webpackAssets && JSON.parse(process.env.webpackAssets);
  // const chunkManifest = process.env.webpackChunkAssets && JSON.parse(process.env.webpackChunkAssets);

  return `
    <!doctype html>
    <html>
      <head>
        ${head.base.toString()}
        ${head.title.toString()}
        ${head.meta.toString()}
        ${head.link.toString()}
        ${head.script.toString()}
        <link href='https://fonts.googleapis.com/css?family=Lato:400,300,700' rel='stylesheet' type='text/css'/>
        <body>
        <form>
          <label>Party Code</label>
          <input type="text" name="partyCode" required=true length=3/>
          <label>Name</label>
          <input type="text" name="name" required=true/>
          <input type="submit" value="Submit" />
        </form>
      </body>
    </html>
  `;
};

const renderError = (err) => {
  const softTab = '&#32;&#32;&#32;&#32;';
  const errTrace = isProdMode
    ? `:<br><br><pre style="color:red">${softTab}${err.stack.replace(/\n/g, `<br>${softTab}`)}</pre>`
    : '';
  return renderFullPage(`Server Error${errTrace}`, {});
};

// Server Side Rendering based on routes matched by React-router.
app.use((req, res, next) => {
  match({
    routes,
    location: req.url,
  }, (err, redirectLocation, renderProps) => {
    if (err) {
      return res.status(500)
        .end(renderError(err));
    }

    if (redirectLocation) {
      return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    }

    if (!renderProps) {
      return next();
    }

    const store = configureStore();

    return fetchComponentData(store, renderProps.components, renderProps.params)
      .then(() => {
        const initialView = renderToString(
          <Provider store={store}>
            <intlWrapper>
              <RouterContext {...renderProps} />
            </intlWrapper>
          </Provider>
        );
        const finalState = store.getState();

        res
          .set('Content-Type', 'text/html')
          .status(200)
          .end(renderFullPage(initialView, finalState));
      })
      .catch(error => next(error));
  });
});

// start app
app.listen(serverConfig.port, (error) => {
  if (!error) {
    console.log( `\n-----------------------------------------------------------------------` ); // eslint-disable-line
    console.log( `MERN is running on port: ${serverConfig.port}! ` ); // eslint-disable-line
    console.log( `-----------------------------------------------------------------------\n` ); // eslint-disable-line
  }
});

export default app;
