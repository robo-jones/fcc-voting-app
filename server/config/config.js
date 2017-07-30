'use strict';

const server = {
    port: process.env.PORT
};

const mongodb = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    db: process.env.DB,
    dbUrl: `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB}`
};

const githubOauth = {
    clientId: process.env.GITHUB_KEY,
    clientSecret: process.env.GITHUB_SECRET
};

const session = {
    secret: process.env.SESSION_SECRET
};

const nodeEnv = process.env.NODE_ENV;

module.exports = {
    server,
    mongodb,
    githubOauth,
    session,
    nodeEnv
};