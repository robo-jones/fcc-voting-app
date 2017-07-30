'use strict';

const chai = require('chai');
const sinon = require('sinon');
const express = require('express');
const usersEndpointFactory = require('../../../../server/endpoints/users.js');

const expect = chai.expect;

chai.use(require('chai-http'));
chai.use(require('sinon-chai'));

describe('Users endpoint', () => {
    describe('/users/:id', () => {
        describe('GET', () => {
            let app, fakeUserRepo, usersEndpoint, userId;
            beforeEach(() => {
                app = express();
                fakeUserRepo = {
                    findUser: (id) => {
                        return Promise.resolve({
                            _id: id,
                            userName: 'foo'
                        });
                    }
                };
                usersEndpoint = usersEndpointFactory(fakeUserRepo);
                userId = '12345';
                
                app.use(usersEndpoint);
            });
            
            it('should fetch the correct user\'s info', async () => {
                const findUserSpy = sinon.spy(fakeUserRepo, 'findUser');
                
                await chai.request(app).get(`/users/${userId}`);
                return expect(findUserSpy).to.have.been.calledWith(userId);
            });
            
            it('should return a JSON', async () => {
                const response = await chai.request(app).get(`/users/${userId}`);
                expect(response).to.be.json;
            });
            
            it('should return the user data for the posted user id', async () => {
                const response = await chai.request(app).get(`/users/${userId}`);
                expect(response.body._id).to.equal(userId);
            });
            
            it('should return an error if the user does not exist', async () => {
                const findUserStub = sinon.stub(fakeUserRepo, 'findUser');
                findUserStub.rejects(new Error('user not found'));
                
                const response = await chai.request(app).get(`/users/${userId}`);
                expect(response).to.be.json;
                expect(response.body.error).to.equal('user not found');
            });
            
            it('should return a 500 error if something else goes wrong', async () => {
                const findUserStub = sinon.stub(fakeUserRepo, 'findUser');
                findUserStub.rejects(new Error('something else went wrong'));
                
                try {
                    const response = await chai.request(app).get(`/users/${userId}`);
                    expect(response).to.have.status(500);
                } catch (response) {
                    expect(response).to.have.status(500);
                }
                
            });
        });
    });
    
    describe('/users', () => {
        describe('POST', () => {
            let app, fakeUserRepo, usersEndpoint, userId;
            beforeEach(() => {
                userId = '12345';
                app = express();
                fakeUserRepo = {
                    createUser: (userDocument) => {
                        return Promise.resolve({
                            _id: userId,
                            userName: userDocument.userName
                        });
                    }
                };
                usersEndpoint = usersEndpointFactory(fakeUserRepo);
                
                app.use(usersEndpoint);
                //mock the '/mypolls' endpoint to prevent 404s on the redirect
                app.get('/mypolls', (req, res) => {
                    res.send('Hi there!');
                });
            });
            
            it('should call the createUser function with the supplied user info', async () => {
                const createUserSpy = sinon.spy(fakeUserRepo, 'createUser');
                
                await chai.request(app).post('/users').send({ username: 'foo' });
                return expect(createUserSpy).to.have.been.calledWith({ userName: 'foo' });
            });
            
            it('should redirect the user to their polls page on success', async () => {
                const response = await chai.request(app).post('/users').send({ username: 'foo' });
                
                expect(response).to.redirect;
                expect(response.redirects[0].endsWith('/mypolls')).to.be.true;
            });
        });
    });
});