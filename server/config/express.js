'use strict';

const express = require('express');
const config = require('./config.js');

const app = express();

if (config.nodeEnv === 'development') {
    const morgan = require('morgan');
    app.use(morgan('short'));
}

//dependency injection
const userModel = require('../database/schemas/user.js');
const userRepository = require('../database/interfaces/user.js')(userModel);
const userEndpoint = require('../endpoints/users.js')(userRepository);

app.use(userEndpoint);

module.exports = app;