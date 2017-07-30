'use strict';

const authEndpointFactory = (passport) => {
    const router = require('express').Router();
    
    router.route('/auth/github')
        .get(passport.authenticate('github', { scope: [ 'user:email' ] }),
        (req, res) => {
            //this will never be called, since passport will redirect to GitHub to authenticate
        });
        
    router.route('/auth/github/callback')
        .get(passport.authenticate('github', { failureRedirect: '/login' }),
        (req, res) => {
            res.redirect('/mypolls');
        });
        
    router.route('/auth/logout')
        .get((req, res) => {
            req.logout();
            res.redirect('/');
        });
        
    return router;
};

module.exports = authEndpointFactory;