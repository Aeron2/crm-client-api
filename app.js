const dotenv = require('dotenv');
// require('dotenv').config();
dotenv.config({ path: './config.env' });
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const port = process.env.PORT || 3001;

//API security
app.use(helmet());

//Handle cors setup
app.use(cors());

//mongo db connection
const mongoose = require('mongoose');
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('DB connection successful!'))
  .catch((error) => {
    console.log('kyo bhai kyo error de rha h');
  });

if (process.env.NODE_ENV !== 'production') {
  const mDB = mongoose.connection;

  mDB.on('open', () => {
    console.log('mongo is connected');
  });
  mDB.on('error', (error) => {
    console.log(error);
  });
  // Logger
  app.use(morgan('tiny'));
}

//set body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Loadf Rourter
const userRouter = require('./src/routers/userRouter');
const ticketRouter = require('./src/routers/ticketRouter');

// useRouters
app.use('/v1/user', userRouter);
app.use('/v1/ticket', ticketRouter);

//setting port

//EROOR HANDLER

const handleError = require('./src/utils/errorHandler');

app.use('*', (req, res, next) => {
  const error = new Error('Resourse not found');
  error.status = 404;
  next(error);
});

app.use('*', (error, req, res, next) => {
  handleError(error, res);
});

//APP LISTEN

app.listen(port, () => {
  console.log(`API is ready on http:localhost:${port}`);
});
