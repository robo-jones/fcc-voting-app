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
            
            it('should return a 401 error if there is no logged in user', async () => {
                const fakePollsRepository = {
                    findPollsByUser: () => {}
                };
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).get('/polls/mypolls');
                    expect(response).to.have.status(401);
                } catch(response) {
                    expect(response).to.have.status(401);
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
        describe('GET', () => {
            let app, fakePollsRepository;
            const testPolls = ['somePoll', 'someOtherPoll'];
            
            beforeEach(() => {
                fakePollsRepository = {
                    findAllPolls: () => { return Promise.resolve(testPolls); }
                };
                app = express();
            });
            
            it('should retrieve all polls from the repository', async () => {
                const findSpy = sinon.spy(fakePollsRepository, 'findAllPolls');
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                await chai.request(app).get('/polls');
                expect(findSpy).to.have.been.called;
            });
            
            it('should return all of the polls', async () => {
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                const response = await chai.request(app).get('/polls');
                expect(response.body).to.deep.equal(testPolls);
            });
        });
        
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
            
            it('should return a 401 if there is no logged in user', async () => {
                const fakePollsRepository = {};
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).post('/polls').send(testPoll);
                    expect(response).to.have.status(401);
                } catch(response) {
                    expect(response).to.have.status(401);
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
                
                await chai.request(app).post('/polls').send(testPoll);
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
                
                const response = await chai.request(app).post('/polls').send(testPoll);
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
                    const response = await chai.request(app).post('/polls').send(testPoll);
                    expect(response).to.have.status(500);
                } catch(response) {
                    expect(response).to.have.status(500);
                }
            });
        });
    });
    
    describe('/polls/:id', () => {
        describe('GET', () => {
            let app;
            const requestId = '12345';
            const testPoll = {
                id: '12345',
                creator: '67890',
                options: 'some options'
            };
            
            beforeEach(() => {
                app = express();
            });
            
            it('should search for a poll with the provided id', async () => {
                const fakePollsRepository = {
                    findPoll: () => {}
                };
                const findSpy = sinon.spy(fakePollsRepository, 'findPoll');
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                await chai.request(app).get(`/polls/${requestId}`);
                
                expect(findSpy).to.have.been.calledWith(requestId);
            });
            
            it('should return the poll document, if it was found', async () => {
                const fakePollsRepository = {
                    findPoll: () => (Promise.resolve(testPoll))
                };
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                const response = await chai.request(app).get(`/polls/${requestId}`);
                
                expect(response.body).to.deep.equal(testPoll);
            });
            
            it('should return a \'poll not found\' error if the poll does not exist', async () => {
                const fakePollsRepository = {
                    findPoll: () => (Promise.reject('poll not found'))
                };
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                const response = await chai.request(app).get(`/polls/${requestId}`);
                
                expect(response.body.error).to.equal('poll not found');
            });
            
            it('should return a 500 error if any other error occurs', async () => {
                const fakePollsRepository = {
                    findPoll: () => (Promise.reject(new Error('oh no!')))
                };
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).get(`/polls/${requestId}`);
                    expect(response).to.have.status(500);
                } catch(response) {
                    expect(response).to.have.status(500);
                }
            });
        });
        
        describe('DELETE', () => {
            let app, authenticated, fakePollsRepository;
            const testUser = {
                id: '12345'
            };
            const requestId = '67890';
            
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
                app.get('/mypolls', (req, res) => { res.sendStatus(200) });
                
                fakePollsRepository = {
                    findPoll: () => (Promise.resolve({ creator: testUser.id })),
                    deletePoll: () => (Promise.resolve({ id: requestId }))
                };
            });
            
            it('should return a 401 error if there is no user logged in', async () => {
                const fakePollsRepository = {};
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).delete(`/polls/${requestId}`);
                    expect(response).to.have.status(401);
                } catch(response) {
                    expect(response).to.have.status(401);
                }
            });
            
            it('should search for the provided poll to obtain the creator id', async () => {
                authenticated = true;
                
                const findSpy = sinon.spy(fakePollsRepository, 'findPoll');
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                await chai.request(app).delete(`/polls/${requestId}`);
                expect(findSpy).to.have.been.calledWith(requestId);
            });
            
            it('should return a 403 error if a user tries to delete a poll that is not theirs', async () => {
                authenticated = true;
                
                const changeableUserMiddleware = (req, res, next) => {
                    req.user.id = '54321';
                    next();
                };
                app.all('*', changeableUserMiddleware); //since this middleware is mounted here, it will overwrite the default req.user.id in the beforeEach() block
                
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).delete(`/polls/${requestId}`);
                    expect(response).to.have.status(403);
                } catch(response) {
                    expect(response).to.have.status(403);
                }
            });
            
            it('should delete the poll, if it was created by the logged in user', async () => {
                authenticated = true;
                
                const deleteSpy = sinon.spy(fakePollsRepository, 'deletePoll');
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                await chai.request(app).delete(`/polls/${requestId}`);
                expect(deleteSpy).to.have.been.calledWith(requestId);
            });
            
            it('should return a \'successfullyDeleted: id\' message if the poll was deleted', async () => {
                authenticated = true;
                
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                const response = await chai.request(app).delete(`/polls/${requestId}`);
                expect(response.body).to.deep.equal({ successfullyDeleted: requestId });
            });
            
            it('should return a \'poll not found\' error if the poll does not exist', async () => {
                authenticated = true;
                
                fakePollsRepository.findPoll = () => (Promise.reject('poll not found'));
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                const response = await chai.request(app).delete(`/polls/${requestId}`);
                
                expect(response.body.error).to.equal('poll not found');
            });
            
            it('should return a 500 error if an error occurs with findPoll()', async () => {
                authenticated = true;
                
                sinon.stub(fakePollsRepository, 'findPoll').rejects(new Error('oh noes'));
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).delete(`/polls/${requestId}`);
                    expect(response).to.have.status(500);
                } catch(response) {
                    expect(response).to.have.status(500);
                }
            });
            
            it('should return a 500 error if an error occurs with deletePoll()', async () => {
                authenticated = true;
                
                sinon.stub(fakePollsRepository, 'deletePoll').rejects(new Error('oh noes'));
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).delete(`/polls/${requestId}`);
                    expect(response).to.have.status(500);
                } catch(response) {
                    expect(response).to.have.status(500);
                }
            });
        });
    });
    
    describe('/polls/byuser/:id', () => {
        describe('GET', () => {
            let app, fakePollsRepository;
            const requestId = '12345';
            const testPolls = ['somePoll', 'someOtherPoll'];
            
            beforeEach(() => {
                app = express();
                fakePollsRepository = {
                    findPollsByUser: () => (Promise.resolve(testPolls))
                };
            });
            
            it('should search for polls with the provided user id', async () => {
                const findSpy = sinon.spy(fakePollsRepository, 'findPollsByUser');
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                await chai.request(app).get(`/polls/byuser/${requestId}`);
                
                expect(findSpy).to.have.been.calledWith(requestId);
            });
            
            it('should return the found polls', async () => {
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                const response = await chai.request(app).get(`/polls/byuser/${requestId}`);
                expect(response.body).to.deep.equal(testPolls);
            });
        });
    });
    
    describe('/polls/:id/vote', () => {
        describe('POST', () => {
            //All requests are set up with an 'X-Forwarded-For' header, since this app is designed to be deployed behind a proxy
            let app, fakePollsRepository, authenticated;
            const requestIP = '1.2.3.4';
            const requestId = '12345';
            const requestOption = 0;
            const fakeAuthMiddleware = (req, res, next) => {
                req.isAuthenticated = () => {return authenticated;};
                req.user = {
                    id: testUser.id
                };
                next();
            };
            const testUser = { id: '67890' };
            
            beforeEach(() => {
                authenticated = false;
                fakePollsRepository = {
                    vote: () => {}
                };
                app = express();
                app.all('*', fakeAuthMiddleware);
            });
            
            it('should attempt to vote for the provided option on the specified poll', async () => {
                const voteSpy = sinon.spy(fakePollsRepository, 'vote');
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                await chai.request(app).post(`/polls/${requestId}/vote`).set('X-Forwarded-For', requestIP).send({ option: requestOption });
                expect(voteSpy).to.have.been.calledWith(requestId, requestOption);
            });
            
            it('should attempt to vote with the request\'s IP if there is no logged in user', async () => {
                const voteSpy = sinon.spy(fakePollsRepository, 'vote');
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                await chai.request(app).post(`/polls/${requestId}/vote`).set('X-Forwarded-For', requestIP).send({ option: requestOption });
                expect(voteSpy).to.have.been.calledWith(requestId, requestOption, requestIP);
            });
            
            it('should attempt to vote with a logged in user\'s id', async()=> {
                authenticated = true;
                const voteSpy = sinon.spy(fakePollsRepository, 'vote');
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                await chai.request(app).post(`/polls/${requestId}/vote`).set('X-Forwarded-For', requestIP).send({ option: requestOption });
                expect(voteSpy).to.have.been.calledWith(requestId, requestOption, testUser.id);
            });
            
            it('should return a \'poll not found\' error if the poll does not exist', async () => {
                fakePollsRepository.vote = () => (Promise.reject('poll not found'));
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                const response = await chai.request(app).post(`/polls/${requestId}/vote`).set('X-Forwarded-For', requestIP).send({ option: requestOption });
                
                expect(response.body.error).to.equal('poll not found');
            });
            
            it('should return a \'user has already voted\' error if the requesting user/IP has already voted on the poll', async () => {
                fakePollsRepository.vote = () => (Promise.reject('user has already voted'));
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                const response = await chai.request(app).post(`/polls/${requestId}/vote`).set('X-Forwarded-For', requestIP).send({ option: requestOption });
                
                expect(response.body.error).to.equal('user has already voted');
            });
            
            it('should return a 500 error if any other error occurs', async () => {
                fakePollsRepository.vote = sinon.stub.rejects();
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).post(`/polls/${requestId}/vote`).set('X-Forwarded-For', requestIP).send({ option: requestOption });
                    expect(response).to.have.status(500);
                } catch (response) {
                    expect(response).to.have.status(500);
                }
            });
        });
    });
    
    describe('/polls/:id/options', () => {
        describe('POST', () => {
            let app, fakePollsRepository, authenticated;
            const newOption = 'kittens!';
            const fakeAuthMiddleware = (req, res, next) => {
                req.isAuthenticated = () => {return authenticated;};
                req.user = {
                    id: testUser.id
                };
                next();
            };
            const testUser = { id: '67890' };
            const fakePoll = {
                id: '12345',
                creator: testUser.id,
                options:[{
                    name: 'option 1',
                    votes: 0
                }]
            };
            
            beforeEach(() => {
                authenticated = false;
                fakePollsRepository = {
                    addOption: (id, option, userId) => {
                        if(id !== fakePoll.id) { return Promise.reject('poll not found'); }
                        if (userId !== fakePoll.creator) { return Promise.reject('not authorized'); }
                        const returnDocument = JSON.parse(JSON.stringify(fakePoll));
                        returnDocument.options.push({ name: option, votes: 0 });
                        return Promise.resolve(returnDocument);
                    }
                };
                app = express();
                app.all('*', fakeAuthMiddleware);
            });
            
            it('should return a 401 error if there is no user logged in', async () => {
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).post(`/polls/${fakePoll.id}/options`).send({ option: newOption });
                    expect(response).to.have.status(401);
                } catch(response) {
                    expect(response).to.have.status(401);
                }
            });
            
            it('should attempt to add the provided option to the requested poll', async () => {
                authenticated = true;
                const addOptionSpy = sinon.spy(fakePollsRepository, 'addOption');
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                await chai.request(app).post(`/polls/${fakePoll.id}/options`).send({ option: newOption });
                expect(addOptionSpy).to.have.been.calledWith(fakePoll.id, newOption);
            });
            
            it('should return a 403 error if a user tries to add an option to a poll that is not theirs', async () => {
                authenticated = true;
                const changeableUserMiddleware = (req, res, next) => {
                    req.user.id = '54321';
                    next();
                };
                app.all('*', changeableUserMiddleware); //since this middleware is mounted here, it will overwrite the default req.user.id in the beforeEach() block
                
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).post(`/polls/${fakePoll.id}/options`).send({ option: newOption });
                    expect(response).to.have.status(403);
                } catch(response) {
                    expect(response).to.have.status(403);
                }
            });
            
            it('should return a \'poll not found\' error if the poll cannot be found', async () => {
                authenticated = true;
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                const response = await chai.request(app).post(`/polls/54321/options`).send({ option: newOption });
                expect(response.body.error).to.equal('poll not found');
            });
            
            it('should return the updated poll object, if the update was successful', async () => {
                const expectedDocument = JSON.parse(JSON.stringify(fakePoll));
                expectedDocument.options.push({ name: newOption, votes: 0 });
                authenticated = true;
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                const response = await chai.request(app).post(`/polls/${fakePoll.id}/options`).send({ option: newOption });
                expect(response.body).to.deep.equal(expectedDocument);
            });
            
            it('should return a 500 error if another problem occurs', async () => {
                authenticated = true;
                sinon.stub(fakePollsRepository, 'addOption').rejects();
                const fakePollsEndpoint = pollsEndpointFactory(fakePollsRepository);
                app.use(fakePollsEndpoint);
                
                try {
                    const response = await chai.request(app).post(`/polls/${fakePoll.id}/options`).send({ option: newOption });
                    expect(response).to.have.status(500);
                } catch (response) {
                    expect(response).to.have.status(500);
                }
            });
        });
    });
});