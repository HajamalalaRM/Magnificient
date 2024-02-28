var express = require('express');
var router = express.Router();
const userModel = require('../models/users.model')


/**Add new Service
 * name
 * coast
 * durationMinute
 */
router.post('/add',function(req, res) {
    let serviceObj = new serviceModel(req.body);
    serviceObj.save()
    .then(d=>{
        res.send({status:201, message: 'Service addded successfully', id: d._id});
    })
    .catch(err=>{
        console.log(err);
    })
});


/**Get employe appointments details
 * 
 * iduser
 */
router.post('/employe',(req,res)=>{
    const userId = req.body.iduser;
    if(userId){        
      userModel.aggregate([
        {
          $match: {
            role: 2,
            _id: new mongoose.Types.ObjectId(userId)
          }
        },
        {
          $lookup: {
            from: "appointments",
            localField: "_id",
            foreignField: "userEmpId",
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
            localField: "userappointments.userClientId",
            foreignField: "_id",
            as: "userappointments.clientDetails"
          }
        },
        {
          $sort: { "userappointments.datetime": 1 } 
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
            "userappointments.clientDetails._id": 1,
            "userappointments.clientDetails.name": 1
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
      ])
      .then(user=>{
        res.status(200).json({userappointments: user});
      })
    }else{
      res.status(200).json({status: 200,message: "Need iduser"});      
    }
  });
  
/**Update user */
router.post('/updateService',(req,res)=>{
    serviceModel.findOneAndUpdate({_id:req.body.idservice}, req.body,{ new: true })
    .then(updatedService => {
      res.status(200).json({updatedService: updatedService});
    })
    .catch(error => {
      res.status(200).json({error: "Can't update the service"});
    });
});



module.exports = router;
