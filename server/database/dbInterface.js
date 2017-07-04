'use strict';

const mongoose = require('mongoose');
const config = require('../config/config.js').mongodb;

const dbUrl = `mongodb://${config.user}:${config.password}@${config.host}:${config.port}/${config.db}`;

mongoose.Promise = global.Promise;

mongoose.connect(dbUrl, { useMongoClient: true });