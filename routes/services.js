var express = require('express');
var router = express.Router();
const serviceModel = require('../models/services.model')


/* GET home page. */
router.get('/', function(req, res) {
    let serviceObj = new serviceModel();
    serviceModel.find()
    .then(services=>{
        res.send({status:200, services: services});
    })    
});


/**Add new Service */
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

module.exports = router;
