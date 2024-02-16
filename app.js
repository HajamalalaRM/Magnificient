const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {MongoClient, ObjectId} = require("mongodb");

const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const { connectToDb, getDb } = require('./db');

const app = express();



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);
app.use('/users', usersRouter);


//--------------------------------------------------------------------
let db
connectToDb((err)=>{  
  if(!err){
    app.listen(3000, ()=>{
      console.log('app listening on port 3000');
    })
    db = getDb();
  }
})

app.post('/signup',(req, res)=>{
  const utilisateur = req.body;
  emailNotExist(req.body.email)
    .then((emailNotExist) => {
      console.log("eee: " + emailNotExist);
      // Use the result of emailNotExist as needed
      if(emailNotExist){
        db.collection('utilisateurs')
          .insertOne(utilisateur)
          .then(result => {
            res.status(201).json(result)
          })
          .catch(error =>{
            res.status(500).json({error: 'Sign up error',cause:'erreur db'})
          })
      }else{
        res.status(201).json({error: 'Sign up error',cause:'email already exist'})
      }
    })
    .catch((error) => {
      console.error("Error checking email existence:", error);
      res.status(500).json({ error: "An error occurred" });
    });
});

app.post('/signin',(req, res)=>{
  console.log("REQUEST SIGNIN")
  db.collection('utilisateurs')
    .find(req.body)
    .toArray()
    .then((user)=>{
      if(user.length>0){
        res.status(201).json({id: user[0]._id});
      }else{
        res.status(201).json({error: "Sign in error",cause:"user not exist"});
      }
    })
    .catch((err)=>{
      res.status(500).json({error: "Sign in error"})
    })
});


app.post('/appointment',(req, res)=>{
  db.collection('appointments')
    .insertOne({
      date: new Date("2024-02-17T10:00:00Z"),
      idUtilisateur: "65cb2902145eb2388401f79a",
      description: "test"
    })
    .then(result => {
      res.status(201).json(result)
    })
    .catch(error =>{
      res.status(500).json({error: 'Sign up error',cause:'erreur db'})
    })     
});

app.get('/appointments',(req,res)=>{
  console.log("REQUEST APPOINTMENTS")
  db.collection("appointments").aggregate([
    {
      $lookup: {
        from: "utilisateurs",
        localField: "idUtilisateur",
        foreignField: "_id",
        as: "user_appointments"
      }
    },
    {
      $match: {
        "user_appointments._id": new ObjectId("65cb2902145eb2388401f79a")
      }
    }
  ])
  .toArray()
  .then(result=>{
    console.log(result)
      res.status(201).json(result);        
    })
  .catch((err)=>{
    res.status(500).json({error: "Sign in error"})
  })
});

function emailNotExist(eml) {
  return new Promise((resolve, reject) => {
    db.collection('utilisateurs')
      .find({ email: eml })
      .toArray()
      .then((user) => {
        console.log("usr: " + user.length);
        console.log("tr: " + (user.length == 0));
        resolve(user.length == 0);
      })
      .catch((error) => {
        console.error("Error checking email existence:", error);
        reject(error);
      });
  });
}

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


