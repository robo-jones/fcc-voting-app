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
                res.sendStatus(401);
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
                res.sendStatus(401);
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
        })
        .delete(async (req, res) => {
            if (req.isAuthenticated()) {
                try {
                    const poll = await pollsRepository.findPoll(req.params.id);
                    if (poll.creator !== req.user.id) {
                        res.sendStatus(403);
                    } else {
                        const result = await pollsRepository.deletePoll(req.params.id);
                        res.json({ successfullyDeleted: result.id });
                    }
                } catch (error) {
                    if (error === 'poll not found') {
                        res.json({ error });
                    } else {
                        res.sendStatus(500);
                    }
                }
                
            } else {
                res.sendStatus(401);
            }
        });
        
    router.route('/polls/byuser/:id')
        .get(async (req, res) => {
            const polls = await pollsRepository.findPollsByUser(req.params.id);
            res.json(polls);
        });
    
    router.route('/polls/:id/vote')
        .post(bodyParser.json(), async (req, res) => {
            let voter;
            if (req.isAuthenticated()) {
                voter = req.user.id;
            } else {
                voter = req.get('X-Forwarded-For').split(',')[0];
            }
            try {
                await pollsRepository.vote(req.params.id, req.body.option, voter);
                res.sendStatus(200);
            } catch (error) {
                if (error === 'poll not found' || error === 'user has already voted') {
                    res.json({ error });
                } else {
                    res.sendStatus(500);
                }
            }
        });
    
    router.route('/polls/:id/options')
        .post(bodyParser.json(), async (req, res) => {
            if (req.isAuthenticated()) {
                try {
                    const updatedPoll = await pollsRepository.addOption(req.params.id, req.body.option, req.user.id);
                    res.json(updatedPoll);
                } catch (error) {
                    if (error === 'poll not found') {
                        res.json( { error });
                    } else if (error === 'not authorized') {
                        res.sendStatus(403);
                    } else {
                        res.sendStatus(500);
                    }
                }
            } else {
                res.sendStatus(401);
            }
        });
    
    return router;
};

module.exports = pollsEndpointFactory;