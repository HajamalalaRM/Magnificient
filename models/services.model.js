const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
    name: String,
    coast: Number,
    durationMinute: Number
});

const serviceModel = mongoose.model('Services', serviceSchema);

module.exports = serviceModel;