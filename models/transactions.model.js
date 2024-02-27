const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    iduser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    coast: Number,
    type: String,
    datetime: Date,
    validated: Boolean
});

const transactionModel = mongoose.model('Transactions', transactionSchema);
module.exports = transactionModel;