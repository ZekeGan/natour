// handling the error which like log the unknown variant
// it must defines at first, otherwise the error may happens before it defined.
process.on('uncaughtException', (err) => {
  console.log(`💥 ${err.name} | ${err.message}`);
  process.exit(1);
});

// config the .env
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// connect to the DB
const mongoose = require('mongoose');
mongoose
  .connect(process.env.DB_REMOTE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('[DB] connect successful');
  });

// activate the server
const app = require('./app');
const port = process.env.PORT || 7777;
const server = app.listen(port, () => {
  console.log(`🌐 server listen on port ${port}`);
});

// error handle outside the express
// handling the error which like connecting DB wrongly
process.on('unhandledRejection', (err) => {
  console.log(`💥 ${err.name} | ${err.message}`);
  server.close(() => {
    console.log('server has shot down because unhandledRejection Error.');
    process.exit(1);
  });
});
