'use strict';

const GitHubStrategy = require('passport-github2').Strategy;
const config = require('../config/config.js');

const gitHubStrategyFactory = (userRepository) => {
    return new GitHubStrategy({
        clientID: config.githubOauth.clientId,
        clientSecret: config.githubOauth.clientSecret,
        callback: config.githubOauth.callback
    }, gitHubAuthFunctionFactory(userRepository));
};

const gitHubAuthFunctionFactory = (userRepository) => {
    const gitHubAuthFunction = (accessToken, refreshToken, profile, done) => {
        process.nextTick(async () => {
            try {
                const user = await userRepository.findUserByGithub(profile);
                done(null, user);
            } catch (err) {
                if (err === 'user not found') {
                    //if there was no user in the database, then create a new one
                    const newUserDocument = {
                        userName: profile.displayName || profile.username,
                        github: {
                            id: profile.id,
                            username: profile.username,
                            displayName: profile.displayName
                        }
                    };
                    
                    const newUser = await userRepository.createUser(newUserDocument);
                    done(null, newUser);
                } else {
                    done(err, null);
                }
            }
        });
    };
    
    return gitHubAuthFunction;
};

module.exports = {
    gitHubStrategyFactory,
    gitHubAuthFunctionFactory
};