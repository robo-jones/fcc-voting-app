'use strict';

const express = require('express');
const config = require('./config.js');
const session = require('express-session');
const path = require('path');

const app = express();

if (config.nodeEnv === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

//wire up users repository
const userModel = require('../database/schemas/user.js');
const usersRepository = require('../repositories/user.js')(userModel);

//wire up users endpoint
const usersEndpoint = require('../endpoints/users.js')(usersRepository);
app.use('/api', usersEndpoint);

//session configuration
app.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false
}));

//passport configuration
const passportFactory = require('./passport.js');
const gitHubStrategy = require('../authentication/githubOAuth.js').gitHubStrategyFactory(usersRepository);
const passport = passportFactory(usersRepository);
passport.use(gitHubStrategy);
app.use(passport.initialize());
app.use(passport.session());

//wire up polls repository and endpoint
const pollsRepository = require('../repositories/polls.js')(require('../database/schemas/poll.js'));
const pollsEndpoint = require('../endpoints/polls.js')(pollsRepository);
app.use('/api', pollsEndpoint);

//wire up auth endpoint
const authEndpoint = require('../endpoints/auth.js')(passport);
app.use(authEndpoint);

//temporary stuff for front-end dev
app.use('/static', express.static(path.join(__dirname, '../static')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
if (config.nodeEnv !== 'test') {
    //including the client router requires the server-side code to be transpiled, which will break the associated unit tests
    const clientRouter = require('../react/clientRouter.js');
    app.get('*', clientRouter);
}

module.exports = app;