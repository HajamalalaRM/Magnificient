var express = require('express');
var router = express.Router();
const appointmentModel = require('../models/appointments.model')
const serviceModel = require('../models/services.model')
const mongoose = require('mongoose');
// const moment = require('moment-timezone');
const cookieParser = require('cookie-parser');


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
    const dateString = req.body.datetime;
    let appointmentObj = new appointmentModel(req.body);
    const [year, month, day, hour, minute] = dateString.split(/[-T:]/);
    const dt = new Date(Date.UTC(year, month - 1, day, hour, minute));

    appointmentObj.datetime = new Date(dt);
    getSumServices(req.body.servicesId)
    .then(sum => {
        let dtemp = new Date(dt);
        dtemp.setMinutes(dtemp.getMinutes()+sum);
        appointmentObj.dateFin = new Date(dtemp);
        appointmentObj.save()
        .then(d=>{
            res.send({status:201, message: 'Appointment addded successfully', id: d._id});
        })
        .catch(err=>{
            console.log(err);
        })
    })
    .catch(err=>{
        console.log(err);
    })
    
   
});


async function getSumServices(idServices) {
    try {
      const totalDuration = await serviceModel.aggregate([
        { $match: { _id: { $in: idServices.map(id =>new mongoose.Types.ObjectId(id)) } } },
        { $group: { _id: null, totalDuration: { $sum: '$durationMinute' } } } 
      ]);
  
      return totalDuration.length > 0 ? totalDuration[0].totalDuration : 0; 
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

router.post('/test',function(req, res) {
    console.log(req.body)
});

module.exports = router;
