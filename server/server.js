'use strict';

const app = require('./config/express.js');
const config = require('./config/config.js').server;

const server = app.listen(config.port);

module.exports = server;