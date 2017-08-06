'use strict';

const bodyParser = require('body-parser');

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
        })
        .post(bodyParser.json(), async (req, res) => {
            if(req.isAuthenticated()) {
                try {
                    const newPollDocument = {
                        creator: req.user.id,
                        title: req.body.title,
                        options: req.body.options
                    };
                    const result = await pollsRepository.createPoll(newPollDocument);
                    res.redirect(`/view/${result.id}`);
                } catch (error) {
                    res.sendStatus(500);
                }
                
            } else {
                res.sendStatus(403);
            }
        });
    
    return router;
};

module.exports = pollsEndpointFactory;