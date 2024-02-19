var express = require('express');
var router = express.Router();
// var mongoose = require('mongoose');

const userModel = require('../models/users.model')

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

/* User Registration */
router.post('/signup', async function(req, res) {
  try{
    userEmailNotExist(req.body.email)
    .then(async (emailNotExist) => {
        if(emailNotExist){
          let userObj = new userModel(req.body);
          let d = await userObj.save();
          res.send({status:201, message: 'User addded successfully', id: d._id});
        }else{
          res.status(500).json({error: 'Sign up error',cause:'email already exist'})
        }
      })    
  }catch(err){
    console.error("Error checking email existence:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

/* User Authentification */
router.post('/signin',(req, res)=>{
  userModel.findOne(req.body)
    .then((user)=>{      
      if( user !== null){
        res.status(200).json({id: user._id});
      }else{
        res.status(200).json({error: "Sign in error",cause:"user not exist"});
      }
    })
    .catch((err)=>{
      res.status(500).json({error: "Sign in error"})
    })
});

/* GET home page. */
router.get('/list', function(req, res) {
  userModel.find({role:2})
  .then(users=>{
      res.send({status:200, users: users});
  })    
});



function userEmailNotExist(email){
  return new Promise((resolve, reject) => {
   userModel.findOne({email:email})
   .then((user) => {
    resolve(user == null);
  })
  .catch((error) => {
    console.error("Error checking email existence:", error);
    reject(error);
  });
  
  });
}

module.exports = router;
