const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    password: String,
    email: String,
    contact: String,
    role: Number,
    employepreferences:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],
    servicespreferences:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Services"
    }],
    compte: Number
});

const userModel = mongoose.model('Users', userSchema);

module.exports = userModel;