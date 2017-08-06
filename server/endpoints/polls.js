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
        });
    
    router.route('/polls')
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
    
    router.route('/polls/:id')
        .get(async (req, res) => {
            try {
                const result = await pollsRepository.findPoll(req.params.id);
                res.json(result);
            } catch (error) {
                if (error === 'poll not found') {
                    res.json({ error });
                } else {
                    res.sendStatus(500);
                }
            }
            
        });
    
    return router;
};

module.exports = pollsEndpointFactory;