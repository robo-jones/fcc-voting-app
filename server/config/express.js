'use strict';

const express = require('express');
const config = require('./config.js');
const session = require('express-session');

const app = express();

if (config.nodeEnv === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

//wire up users repository
const userModel = require('../database/schemas/user.js');
const userRepository = require('../repositories/user.js')(userModel);

//wire up users endpoint
const userEndpoint = require('../endpoints/users.js')(userRepository);
app.use(userEndpoint);

//session configuration
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false
}));

//passport configuration
const passportFactory = require('./passport.js');
const gitHubStrategy = require('../authentication/githubOAuth.js').gitHubStrategyFactory(userRepository);
const passport = passportFactory(userRepository);
passport.use(gitHubStrategy);


module.exports = app;