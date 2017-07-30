'use strict';

const express = require('express');
const config = require('./config.js');
const session = require('express-session');

const app = express();

if (config.nodeEnv === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

//wire up users endpoint
const userModel = require('../database/schemas/user.js');
const userRepository = require('../database/interfaces/user.js')(userModel);
const userEndpoint = require('../endpoints/users.js')(userRepository);
app.use(userEndpoint);

//session configuration
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false
}));

module.exports = app;