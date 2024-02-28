const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    name: String,
    percentage: Number,    
    services:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services"
    }],
    start: Date,
    end: Date
});

const offerModel = mongoose.model('Offers', offerSchema);

module.exports = offerModel;