'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise; //mongoose uses its own built-in promise library, and then yells at you for not overriding it

module.exports = mongoose;