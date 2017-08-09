'use strict';

const app = require('./config/express.js');
const config = require('./config/config.js');
const mongoose = require('./config/mongoose.js');

const server = app.listen(config.server.port);

if (config.nodeEnv !== 'test') {
    mongoose.connect(config.mongodb.dbUrl, { useMongoClient: true });
    console.log(`server listening on port ${config.server.port}`);
}

module.exports = server;