const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
    time: Date,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    serviceId:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services"
    }]
});

const appointmentModel = mongoose.model('appointments', appointmentSchema);

module.exports = appointmentModel;