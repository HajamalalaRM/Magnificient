const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    password: String,
    email: String,
    contact: String,
    role: Number
});

const userModel = mongoose.model('Users', userSchema);

module.exports = userModel;