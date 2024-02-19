const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema({
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
    datetime: Date,
    status: String,
    description: String
});

/**
 * in progress
 * canceled
 * finished
 */

const appointmentModel = mongoose.model('appointments', appointmentSchema);

module.exports = appointmentModel;