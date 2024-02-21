var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');


const userModel = require('../models/users.model')

/* User Registration */
router.post('/signup', async (req, res)=> {
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

/**Get All employe */
router.get('/employes', (req, res)=>{
  userModel.find({role:2})
  .then(users=>{
    const userList = users.map(user => ({ _id: user._id, name: user.name }));
    res.status(200).json({status: 200,users: userList});  
  })    
});

/**Get All Users details */
router.get('/listAllUsers',(req, res)=>{
  userModel.find({},{_id:1, name:1, email:1, contact:1, employepreferences:1, servicespreferences:1, role:1})
  .then(users=>{
    console.log(users)
    res.status(200).json({status: 200,usersList: users});
  })
});

/**Get User details By Id */
router.get('/detailUser',(req, res)=>{
  userModel.findById(req.body.iduser,{_id:1, name:1, email:1, contact:1, employepreferences:1, servicespreferences:1, role:1})
  .then(user=>{    
    res.status(200).json({status: 200,userDetails: user});
  })
});

/**Get all employe free at this time */
router.get('/free',(req, res)=>{
  
});

/**Add prefered service for the specified user */
router.post('/addSrvPreference',(req,res)=>{
  userModel.findById(req.body.userid)
  .then(usr=>{    
    if(usr){
      if(!usr.servicespreferences.includes(req.body.srvprefere)){
        usr.servicespreferences.push(req.body.srvprefere);    
        usr.save();
        res.send({status:201, message: 'Preference addded successfully'});
      }else{
        res.status(200).json({error: "Add preference error",cause:"Preference already added"});
      }
    }else{
      res.status(200).json({error: "Add preference error",cause:"user not exist"});
    }
  })
  .catch(err=>{
    console.log(err);
  })  
});

/**Remove prefered service for specified user */
router.get('/removeSrvPreference',(req,res)=>{
  userModel.findById(req.body.userid)
  .then(usr=>{
    console.log(usr);
    if(usr){
      if(usr.servicespreferences.includes(req.body.srvprefere)){
        console.log("Includes")

        usr.servicespreferences.forEach(element => {
          // console.log(typeof element)
          // console.log(element.toString())
        });
        
        usr.servicespreferences = new usr.servicespreferences.filter(element=>{
          console.log("Element : "+element.toString()+"  "+element);
          console.log(typeof element.toString());
          console.log("Req : "+req.body.srvprefere.toString());
          console.log(typeof req.body.srvprefere.toString());
          element.toString()!== req.body.srvprefere.toString();
        });    
        console.log(usr.servicespreferences)
        // usr.save();
        // res.send({status:201, message: 'Preference removed successfully'});
      }else{
        res.status(200).json({error: "Remove preference error",cause:"Not prefered yet"});
      }
    }else{
      res.status(200).json({error: "Remove preference error",cause:"user not exist"});
    }
  })
})

/**Verify if the email exist */
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
