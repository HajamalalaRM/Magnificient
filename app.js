const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {ObjectId} = require("mongodb");

const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const servicesRouter = require('./routes/services');
const appointmentsRouter = require('./routes/appointments');

var mongoose = require('mongoose');
// const { connectToDb, getDb } = require('./db');

const app = express();



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/services', servicesRouter);
app.use('/appointments', appointmentsRouter);


//--------------------------------------------------------------------
  mongoose.connect('mongodb://127.0.0.1:27017/tp1')
  .then(()=>{
    app.listen(3000, ()=>{
      console.log('app listening on port 3000');
    })
  })
  .catch(err=>{
    console.log("Cannot connect to the database")
  })


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next();
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
  next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;


