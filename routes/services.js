var express = require('express');
var router = express.Router();
const serviceModel = require('../models/services.model')


/* GET home page. */
router.get('/list', function(req, res) {
    let serviceObj = new serviceModel();
    serviceModel.find()
    .then(services=>{
        res.send({status:200, services: services});
    })    
});

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

/**Remove service By id */
router.post('/removeService',(req,res)=>{
    serviceModel.findOneAndDelete({_id:req.body.idservice},{ new: true })
    .then(deletedService => {
      res.status(200).json({deletedService: deletedService});
    })
    .catch(error => {
      res.status(200).json({error: "Can't update the service"});  
    });
});


module.exports = router;
