var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');

const payementModel = require('../models/payements.model')
const appointmentModel = require('../models/appointments.model');
const userModel = require('../models/users.model');
const serviceModel = require('../models/services.model');
const offerModel = require('../models/offers.model');
const transactionModel = require('../models/transactions.model');


router.post('/transactions', function(req,res){
    transactionModel.aggregate([        
        {
            $match:{
                validated: false,
                type: "money request"
            }
        },
        {
          $lookup: {
            from: "users",
            localField: "iduser",
            foreignField: "_id",
            as: "users"
          }
        }
      ]).then(data=>{
        res.send({data:data});
      })
      .catch(err=>{
        console.log(err);
      })
});
/**Payement */
router.post('/pay', function(req, res) {
    const idappointment = req.body.idappointment;
    let pay = req.body.pay;
    getDetailsServicesCoastWithOffer(idappointment)
    .then(async data=>{
        if(data){
            let data1 = data[0];            
            let payement = new payementModel();
            
            payement.datepay = new Date();
            payement.coast = data1.coastSumFinal;
            payement.pay = pay;

            getPayementByAppointmentId(idappointment)
            .then(async payed=>{                
                let rest = pay-payement.coast;            
                if(payed.length>0)rest += payed[0].totalpay;
                console.log("REST: ",rest);
                if(rest>=0){
                    let appointment = await appointmentModel.findById(idappointment);
                    payement.status = true;
                    appointment.status = "payed";
                    appointment.save();
                }else{
                    payement.status = false;
                }
                payement.idappointment = idappointment;
                payement.userClientId = data1.userClientId;
                payement.userEmpId = data1.userEmpId;

                payement.servicesId = data1.discountedServices.map(d =>new mongoose.Types.ObjectId(d._id));
    
                payement.save()
                .then(d=>{
                    res.send({status:201, message: 'Payement effectued successfully', id: d._id});
                })        
            })
            .catch(err=>{
                console.log(err);
            })
        }else{
            res.send({status:200, message: 'Payement error: appointment not found'});
        }
    })
    .catch(err=>{
        console.log(err)
    })   
});


/**Payement by the client online */
router.post('online_payement', function(req,res){
    const idappointment = req.body.idappointment;
    let pay = req.body.pay;
    let user = userModel.findById(req.body.iduser);    
    if(user.compte>=pay){
        user.compte = user.compte-pay;
        getDetailsServicesCoastWithOffer(idappointment)
        .then(async data=>{
            if(data){
                let data1 = data[0];            
                let payement = new payementModel();
                
                payement.datepay = new Date();
                payement.coast = data1.coastSumFinal;
                payement.pay = pay;

                getPayementByAppointmentId(idappointment)
                .then(async payed=>{                
                    let rest = pay-payement.coast;            
                    if(payed.length>0)rest += payed[0].totalpay;
                    console.log("REST: ",rest);
                    if(rest>=0){
                        let appointment = await appointmentModel.findById(idappointment);
                        payement.status = true;
                        appointment.status = "payed";
                        appointment.save();
                    }else{
                        payement.status = false;
                    }
                    payement.idappointment = idappointment;
                    payement.userClientId = data1.userClientId;
                    payement.userEmpId = data1.userEmpId;
                    payement.servicesId = data1.services.map(d =>new mongoose.Types.ObjectId(d._id));
        
                    user.save();
                    payement.save()
                    .then(d=>{
                        res.send({status:201, message: 'Payement effectued successfully', id: d._id});
                    })        
                })
                .catch(err=>{
                    console.log(err);
                })
            }else{
                res.send({status:200, message: 'Payement error: appointment not found'});
            }
        })
        .catch(err=>{
            console.log(err)
        })   
    }else{
        res.send({status:200, message: 'Payement error: not enough mondey'});
    }
});

/**Waitting for payement, set status to unpayed */
router.post('/waitting_payement', function(req, res) {
    getDetailsServicesCoastWithOffer(req.body.idappointment)
    .then(data=>{
        console.log("DATA :",data);
        appointmentModel.findById(req.body.idappointment)
        .then(appointment=>{
            if(appointment){
                appointment.status = "unpayed";
                appointment.save();                   
                res.send({status:200, data: data});
            }
        });
    })
    .catch(err=>{
        console.log(err);
    })
});


async function getPayementByAppointmentId(idappointment){
    try{
        return payementModel.aggregate([
            {
                $match: {
                    idappointment: new mongoose.Types.ObjectId(idappointment)
                }
            },{
                $group:{
                        _id: "$idappointment",
                        totalpay: {$sum: "$pay"}
                }
            }
        ]);
    }catch(err){
        console.log(err);
    }
};

async function getDetailsServicesCoastWithOffer(idappointment) {
    try {
        const d = await appointmentModel.aggregate([
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
                    services: { $push: "$appointments_services._id" }
                }
            }
        ]);

        const dt = d[0].datetime;

        const d1 = await offerModel.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $lte: ["$start", new Date(dt)] },
                            { $gte: ["$end", new Date(dt)] }
                        ]
                    }
                }
            }
        ]);

        const offersSpecial = d1.map(element => element.name);

        const appointmentStrings = d[0].services.map(id => id.toString());
        const offerStrings = d1.length > 0 ? d1[0].services.map(id => id.toString()) : [];

        const matchingElements = appointmentStrings.filter(id => offerStrings.includes(id));

        // const percentage = 0;
        const percentage = d1.length > 0 ? d1[0].percentage: 0;
        console.log(d1);

        const lastdata = await appointmentModel.aggregate([
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
                    services: { $push: "$appointments_services._id" },
                    coastSum: { $sum: "$appointments_services.coast" },
                    discountedServices: {
                        $push: {
                            $cond: [
                                { $in: ["$appointments_services._id", matchingElements.map(id => new mongoose.Types.ObjectId(id)) ] },
                                { _id: "$appointments_services._id", coast: { $subtract: ["$appointments_services.coast", { $multiply: ["$appointments_services.coast", { $divide: [percentage, 100] }] }] } }, 
                                { _id: "$appointments_services._id", coast: "$appointments_services.coast" } 
                            ]
                        }
                    }
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
                    discountedServices: 1,
                    coastSumFinal: { $sum: "$discountedServices.coast" },
                    offers: offersSpecial
                }
            }
        ]);
          
        return lastdata;
    } catch (err) {
        console.error(err);
        throw err;
    }
};


module.exports = router;