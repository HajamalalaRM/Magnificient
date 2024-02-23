var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');


const userModel = require('../models/users.model')

/**  User Registration
 * 
 * name
 * password
 * email
 * contact
 * role
 */
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

/**  User Authentification
 * 
 * email
 * password
 */
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

/**Get User details By Id
 * 
 * idiser
 */
router.post('/detailUser',(req, res)=>{
  const userId = req.body.iduser;
  if(userId){
    userModel.aggregate([
      {
        $match: {
          role: 1,
          _id: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: "services",
          localField: "servicespreferences",
          foreignField: "_id",
          as: "preferred_services"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "employepreferences",
          foreignField: "_id",
          as: "employee_users"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          contact: 1,
          role: 1,
          preferred_services: 1,
          employee_users: 1
        }
      }
    ]).then(employes=>{
      res.status(200).json({employedetails: employes});
    })
  }else{
    res.status(200).json({status: 200,message: "Need date"});
  }    
});

/**Get user appointments details
 * 
 * iduser
 */
router.post('/userAppointment',(req,res)=>{
  const userId = req.body.iduser;
  if(userId){
        
    userModel.aggregate([
      {
        $match: {
          role: 1,
          _id: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: "appointments",
          localField: "_id",
          foreignField: "userClientId",
          as: "userappointments"
        }
      },
      {
        $unwind: "$userappointments"
      },
      {
        $lookup: {
          from: "services",
          localField: "userappointments.servicesId",
          foreignField: "_id",
          as: "userappointments.serviceDetails"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "userappointments.userEmpId",
          foreignField: "_id",
          as: "userappointments.empDetails"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          contact: 1,
          "userappointments._id": 1,
          "userappointments.datetime": 1,
          "userappointments.dateFin": 1,
          "userappointments.description": 1,
          "userappointments.status": 1,
          "userappointments.serviceDetails": 1,
          "userappointments.empDetails._id": 1,
          "userappointments.empDetails.name": 1
        }
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          email: { $first: "$email" },
          contact: { $first: "$contact" },
          userappointments: { $push: "$userappointments" }
        }
      }
    ]).then(user=>{
      res.status(200).json({userappointments: user});
    })
  }else{
    res.status(200).json({status: 200,message: "Need iduser"});      
  }

})

/**Get all employe available at this time */
router.post('/available',(req, res)=>{
  const specifiedDateTime = new Date(req.body.datetime);
  if(specifiedDateTime){
    userModel.aggregate([
      {
        $match: {
          role: 2 
        }
      },
      {
        $lookup: {
          from: "appointments",
          localField: "_id",
          foreignField: "userEmpId",
          as: "user_appointments"
        }
      },
      {
        $match: {
          $or: [
            {
              user_appointments: { $size: 0 } 
            },
            {
              $and: [
                { user_appointments: { $not: { $elemMatch: { datetime: { $lte: specifiedDateTime }, dateFin: { $gte: specifiedDateTime } } } } },
                { user_appointments: { $not: { $elemMatch: { datetime: { $lte: specifiedDateTime }, dateFin: { $gte: specifiedDateTime } } } } }
              ]
            }
          ]
        }
      }
    ])
    .then(employes=>{
      res.status(200).json({status: 200,employesList: employes});
    })
  }else{
    res.status(200).json({status: 200,message: "Need date"});
  }  
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
          console.log(typeof element)
          console.log(element.toString())
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
