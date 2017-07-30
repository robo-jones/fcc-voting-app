'use strict';

const passportFactory = (userRepository) => {
    const passport = require('passport');
    
    //enable user info in sessions
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userRepository.findUser(id);
            done(undefined, user);
        } catch (err) {
            done(err, undefined);
        }
    });
    
    return passport;
};

module.exports = passportFactory;