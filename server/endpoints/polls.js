'use strict';

const pollsEndpointFactory = (pollsRepository) => {
    const router = require('express').Router();
    
    router.route('/polls/mypolls')
        .get(async (req, res) => {
            if(req.isAuthenticated()) {
                const polls = await pollsRepository.findPollsByUser(req.user.id);
                res.json({
                    userId: req.user.id,
                    polls: polls
                });
            } else {
                res.sendStatus(403);
            }
        });
    
    return router;
};

module.exports = pollsEndpointFactory;