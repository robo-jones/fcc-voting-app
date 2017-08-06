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
    
    describe('/polls', () => {
        describe('POST', () => {
            let app, authenticated;
            const testUser = {
                id: '12345'
            };
            const testPoll = {
                title: 'someTitle',
                options: ['1', '2']
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
                app.get('/view/:id', (req, res) => { res.sendStatus(200) });
            });
            
            it('should return a 403 if there is no logged in user', async () => {
                const fakePollsRepository = {};
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).post('/polls/mypolls').send(testPoll);
                    expect(response).to.have.status(403);
                } catch(response) {
                    expect(response).to.have.status(403);
                }
            });
            
            it('should create a poll with the provided form data and the logged in user\'s id', async () => {
                authenticated = true;
                
                const createPollSpy = sinon.spy();
                const fakePollsRepository = {
                    createPoll: (document) => {
                        createPollSpy(document);
                        return Promise.resolve({ id: '67890' });
                    }
                };
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                await chai.request(app).post('/polls/mypolls').send(testPoll);
                expect(createPollSpy).to.have.been.calledWith({
                    creator: testUser.id,
                    title: testPoll.title,
                    options: testPoll.options
                });
            });
            
            it('should redirect to the created poll\'s page upon success', async () => {
                authenticated = true;
                const fakePollsRepository = {
                    createPoll: () => (Promise.resolve({ id: '67890' }))
                };
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                const response = await chai.request(app).post('/polls/mypolls').send(testPoll);
                expect(response).to.redirect;
                expect(response.redirects[0].endsWith('/view/67890')).to.be.true;
            });
            
            it('should respond with a 500 error if something goes wrong', async () => {
                authenticated = true;
                
                const fakePollsRepository = {
                    createPoll: () => (Promise.reject('error!'))
                };
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).post('/polls/mypolls').send(testPoll);
                    expect(response).to.have.status(500);
                } catch(response) {
                    expect(response).to.have.status(500);
                }
            });
        });
    });
});