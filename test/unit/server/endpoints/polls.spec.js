'use strict';

const chai = require('chai');
const sinon = require('sinon');
const express = require('express');
const pollsEndpointFactory = require('../../../../server/endpoints/polls.js');

const expect = chai.expect;

chai.use(require('chai-http'));
chai.use(require('sinon-chai'));

describe('Polls endpoint', () => {
    describe('/polls/mypolls', () => {
        describe('GET', () => {
            let app, authenticated;
            const testUser = {
                id: '12345'
            };
            
            const fakeAuthMiddleware = (req, res, next) => {
                req.isAuthenticated = () => {return authenticated;};
                req.user = {
                    id: testUser.id
                };
                next();
            };
            
            beforeEach(() => {
                authenticated = false;
                app = express();
                app.all('*', fakeAuthMiddleware);
            });
            
            it('should return the currently logged in user\'s id', async () => {
                authenticated = true;
                const firstUserId = '12345';
                const secondUserId = '67890';
                let userId = firstUserId;
                const changeableUserMiddleware = (req, res, next) => {
                    req.user.id = userId;
                next();
                };
                app.all('*', changeableUserMiddleware); //since this middleware is mounted here, it will overwrite the default req.user.id in the beforeEach() block
                const fakePollsRepository = {
                    findPollsByUser: () => {}
                };
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
            
                const firstResponse = await chai.request(app).get('/polls/mypolls');
                userId = secondUserId;
                const secondResponse = await chai.request(app).get('/polls/mypolls');
                
                expect(firstResponse.body.userId).to.equal(firstUserId);
                expect(secondResponse.body.userId).to.equal(secondUserId);
            });
            
            it('should return a 403 error if there is no logged in user', async () => {
                const fakePollsRepository = {
                    findPollsByUser: () => {}
                };
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).get('/polls/mypolls');
                    expect(response).to.have.status(403);
                } catch(response) {
                    expect(response).to.have.status(403);
                }
            });
            
            it('should get a list of the logged in user\'s polls from the repository', async () => {
                authenticated = true;
                
                const getPollsSpy = sinon.spy();
                const fakePollsRepository = {
                    findPollsByUser: getPollsSpy
                };
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                await chai.request(app).get('/polls/mypolls');
                expect(getPollsSpy).to.have.been.calledWith(testUser.id);
            });
            
            it('should pass the list of polls from the repository to the response', async() => {
                authenticated = true;
                
                const firstTestPolls = ['somePoll', 'someOtherPoll'];
                const secondTestPolls = ['somePoll', 'someOtherPoll', 'someThirdPoll'];
                let testPolls = firstTestPolls;
                const fakePollsRepository = {
                    findPollsByUser: () => { return Promise.resolve(testPolls); }
                };
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                const firstResponse = await chai.request(app).get('/polls/mypolls');
                testPolls = secondTestPolls;
                const secondResponse = await chai.request(app).get('/polls/mypolls');
                
                expect(firstResponse.body.polls).to.deep.equal(firstTestPolls);
                expect(secondResponse.body.polls).to.deep.equal(secondTestPolls);
            });
        });
    });
});