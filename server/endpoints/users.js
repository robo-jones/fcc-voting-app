'use strict';

const bodyParser = require('body-parser');

const usersEndpointFactory = (userRepository) => {
    const router = require('express').Router();
    
    router.route('/users/:id')
        .get(async (req, res) => {
            try {
                const userData = await userRepository.findUser(req.params.id);
                res.json(userData);
            } catch (err) {
                if (err.message === 'user not found') {
                    res.json({ error: 'user not found' });
                } else {
                    res.sendStatus(500);
                }
            } 
        });
    
    router.route('/users')
        .post(bodyParser.json(),
            async (req, res) => {
                const userDocument = {
                    userName: req.body.username
                };
                await userRepository.createUser(userDocument);
                res.redirect('/mypolls');
            });
    
    return router;
};

module.exports = usersEndpointFactory;