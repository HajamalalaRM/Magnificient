const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// const cors = require('cors');
// const mongoose =  require('mongoose');
const MongoClient = require("mongodb").MongoClient;

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const { connectToDb, getDb } = require('./db');

const app = express();

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);



//Connection a la bdd
// mongoose.connect('mongodb://127.0.0.1:27017/tp1');
// const db = mongoose.connection;
// // Gestion des erreurs de connexion à la base de données
// db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB :'));
// db.once('open', () => {
//   console.log('Connecté à la base de données MongoDB');
// });

// const filmSchema = new mongoose.Schema({
//   title: String,
//   genre: String,
//   releaseYear: Number,
//   director: String,
//   actors: [String],
//   rating: Number,
// });

// const Film = mongoose.model('film', filmSchema);

// app.get('/films', async (req, res) => {
//   try {
//     // Utiliser le modèle Mongoose pour sélectionner tous les documents de la collect'ion
//     const films = await Film.find();
//     console.log(films);
//     res.json(films);
    
//   } catch (error) {
//     console.error('Erreur lors de la récupération des films :', error);
//     res.status(500).json({ error: 'Erreur lors de la récupération des films' });
//   }
// });


//--------------------------------------------------------------------
let db
connectToDb((err)=>{  
  if(!err){
    app.listen(3000, ()=>{
      console.log('app listening on port 3000');
    })
    db = getDb()
  }
})

app.post('/singin',(req, res)=>{
  const utilisateur = req.body;
  db.collection('utilisateurs')
    .insertOne(utilisateur)
    .then(result => {
      res.status(201).json(result)
    })
    .catch(err =>{
      res.status(500).json({err: 'Signin error'})
    })
});

app.post('/singup',(req, res)=>{
  const utilisateur = req.body;
  console.log(utilisateur)
  db.collection('utilisateurs')
    .findOne(utilisateur)
    // .count()
    .then(result => {
      console.log(result);
      res.status(201).json(result)
    })
    .catch(err =>{
      res.status(500).json({err: 'Signin error'})
    })
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


// app.listen(PORT, () => {  
//   console.log(`Serveur Express en cours d'exécution sur le port ${PORT}`);
// });
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
