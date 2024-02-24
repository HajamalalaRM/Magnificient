var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

const appointmentModel = require('../models/appointments.model')
const serviceModel = require('../models/services.model')

/* List all appointments. */
router.get('/', function(req, res) {
    let appointmentObj = new appointmentModel();
    appointmentModel.find()
    .then(services=>{
        res.send({status:200, services: services});
    })    
});


/**Add new appointments
 * 
 * datetime
 * userClientId
 * userEmpId
 * servicesId
 * status
 * description
 */
router.post('/add',function(req, res) {
    const dateString = req.body.datetime;
    let appointmentObj = new appointmentModel(req.body);
    const [year, month, day, hour, minute] = dateString.split(/[-T:]/);
    const dt = new Date(Date.UTC(year, month - 1, day, hour, minute));

    appointmentObj.datetime = new Date(dt);
    getSumMinutesServices(req.body.servicesId)
    .then(async sum => {
        let dtemp = new Date(dt);
        dtemp.setMinutes(dtemp.getMinutes()+sum);
        appointmentObj.dateFin = new Date(dtemp);

        await verrifAppointmentDurationConflit(appointmentObj.userEmpId,appointmentObj.datetime,appointmentObj.dateFin)
        .then(data=>{
            console.log("Data : "+data);
            if(!data[0].superpose){
                appointmentObj.save()     
                .then(d=>{
                        res.send({status:201, message: 'Appointment addded successfully', id: d._id});
                })
            }else{
                res.send({status:200, message: "appointment superposition",data:data[0]});
            }
        })
        .catch(err=>{
            console.log(err);
        })
    })
    .catch(err=>{
        console.log(err);
    })
});

/**Update appointments
 * 
 * idappointment
 */
router.post('/update/:data',(req,res)=> {
    const param = req.params.data;
    appointmentModel.findById(req.body.idappointment)
    .then(appointment=>{
        if(appointment){
            if(param=="execute"||param=="cancel"){
                appointment.status = req.body.status;
                appointment.save();
                if(param=='execute'){
                    res.send({status:201, message: 'Appointment updated successfully'});
                }else{
                    res.send({status:201, message: 'Appointment canceled successfully'});
                }
            }else{
                res.send({status:200, message: 'need execute or cancel'});
            }
        }
    });
});

/**Verify if the appointments overlaps  */
async function verrifAppointmentDurationConflit(idemp,datetime,datefin){
    try{
        const date1 = new Date(datetime);
        const date2 = new Date(datefin);       
        return appointmentModel.aggregate([
        {
            $match: {
            userEmpId: new mongoose.Types.ObjectId(idemp),
            datetime: {
                $gte: new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()), // Start of day for date1
                $lt: new Date(date1.getFullYear(), date1.getMonth(), date1.getDate() + 1) // Start of next day for date1
            }
            }
        },
        {
            $project: {
            datetime: 1,
            dateFin: 1,
            date1: date1,
            date2: date2,
            superpose: {
                $cond: [	      	
                    {
                        $or: [	      	
                            { $and: [{$gte:[date1,"$datetime"]},{$lte:[date1,"$dateFin"]}]},
                            { $and: [{$gte:[date2,"$datetime"]},{$lte:[date2,"$dateFin"]}]},
                            { $and: [{$lte:[date1,"$datetime"]},{$gte:[date2,"$dateFin"]}]}
                        ]
                    },
                    true,false
                    ]
                }
            }                  
        }
        ])
    }catch(err){
        console.log(err);
    }
}
/**Sum the service of the duration */
async function getSumMinutesServices(idServices) {
    try {
      const totalDuration = await serviceModel.aggregate([
        { 
            $match: {
                 _id: { 
                    $in: idServices.map(id =>new mongoose.Types.ObjectId(id)) 
                } 
            } 
        },{ 
            $group: { 
                _id: null, 
                totalDuration: { 
                    $sum: '$durationMinute' 
                } 
            } 
        } 
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
