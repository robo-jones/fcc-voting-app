'use strict';

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
    
    return router;
};

module.exports = usersEndpointFactory;