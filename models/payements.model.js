const mongoose = require('mongoose');

const payementSchema = mongoose.Schema({
    datepay: Date,
    coast: Number,
    pay: Number,
    status: Boolean,
    idappointment:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointments"
    },
    userClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    userEmpId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    servicesId:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services"
    }],
});

const payementModel = mongoose.model('Payements', payementSchema);

module.exports = payementModel;