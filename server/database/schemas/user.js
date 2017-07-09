'use strict';

const mongoose = require('../../config/mongoose.js');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
        required: true
    }
});

const User = mongoose.model('user', userSchema);

module.exports = User;