var express = require('express');
var router = express.Router();
const appointmentModel = require('../models/appointments.model')


/* GET home page. */
router.get('/', function(req, res) {
    let appointmentObj = new appointmentModel();
    appointmentModel.find()
    .then(services=>{
        res.send({status:200, services: services});
    })    
});


/**Add new Service */
router.post('/add',function(req, res) {
    let appointmentObj = new appointmentModel(req.body);
    appointmentObj.save()
    .then(d=>{
        res.send({status:201, message: 'Appointment addded successfully', id: d._id});
    })
    .catch(err=>{
        console.log(err);
    })
});

module.exports = router;
