var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');



const payementModel = require('../models/payements.model')
const appointmentModel = require('../models/appointments.model')

router.post('/pay', function(req, res) {    
    const idappointment = req.body.idappointment;
    let pay = req.body.pay;
    getDetailsServicesCoast(idappointment)
    .then(data=>{
        if(data){
            data1 = data[0];            
            let payement = new payementModel();
            payement.datepay = new Date();
            payement.coast = data1.coastSum;

            payement.pay = pay;
            let reste = pay-payement.coast;            
            if(reste>=0){
                payement.status = true;
            }else{
                payement.status = false;
            }
            payement.idappointment = idappointment;
            payement.userClientId = data1.userClientId;
            payement.userEmpId = data1.userEmpId;
            payement.servicesId = data1.services.map(d =>new mongoose.Types.ObjectId(d._id));            

            payement.save()
            .then(d=>{
                res.send({status:201, message: 'Payement effectued successfully', id: d._id});
            })        
        }else{
            res.send({status:200, message: 'Payement error: appointment not found'});
        }
        
    })
    .catch(err=>{
        console.log(err)
    })
    // let date = new Date();
    
    // payementModel.find()
    // .then(payement=>{
    //     res.send({status:200, payements: payement});
    // })    
});

async function getDetailsServicesCoast(idappointment){
    try{

        return appointmentModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(idappointment)
                }
            },
            {
                $lookup: {
                    from: "services",
                    localField: "servicesId",
                    foreignField: "_id",
                    as: "appointments_services"
                }
            },
            {
                $unwind: "$appointments_services"
            },
            {
                $group: {
                    _id: "$_id",
                    userClientId: { $first: "$userClientId" },
                    userEmpId: { $first: "$userEmpId" },
                    datetime: { $first: "$datetime" },
                    status: { $first: "$status" },
                    description: { $first: "$description" },
                    dateFin: { $first: "$dateFin" },
                    coastSum: { $sum: "$appointments_services.coast" },
                    services:  {$push: "$appointments_services"}
                }
            },
            {
                $project: {
                    _id: 1,
                    userClientId: 1,
                    userEmpId: 1,
                    datetime: 1,
                    status: 1,
                    description: 1,
                    dateFin: 1,
                    coastSum: 1,
                    services: 1
                }
            }
        ]);
    }catch(err){
        console.log(err);
    }
}

module.exports = router;