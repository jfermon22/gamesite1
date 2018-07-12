# specify the node base image with your desired version node:<version>
FROM node:8

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install -g nodemon

# Install app dependencies
COPY .babelrc index.js nodemon.json package*.json webpack.config.server.js webpack.config.babel.js ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8000
CMD [ "npm", "start" ]
