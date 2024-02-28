const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
    name: String,
    coast: Number,
    durationMinute: Number,
    commission: Number
});

const serviceModel = mongoose.model('Services', serviceSchema);

module.exports = serviceModel;