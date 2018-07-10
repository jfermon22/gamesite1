const databaseLocation = 'mongodb://jfermon:jeferm22@ds015325.mlab.com:15325/app1_db';
const config = {
  mongoURL: process.env.MONGO_URL || databaseLocation,
  port: process.env.PORT || 8000,
};

export default config;
