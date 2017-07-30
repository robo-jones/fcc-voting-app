'use strict';

const chai = require('chai');
const sinon = require('sinon');
const express = require('express');
const authEndpointFactory = require('../../../../server/endpoints/auth.js');

const expect = chai.expect;

chai.use(require('chai-http'));
chai.use(require('sinon-chai'));

describe('auth endpoint', () => {
    describe('/auth/github', () => {
        describe('GET', () => {
            it('should call passport.authenticate() with the correct parameters', () => {
                const authSpy = sinon.spy();
                const fakePassport = {
                    authenticate: (provider, options) => {
                        authSpy(provider, options);
                        return (req, res, next) => {
                            next();
                        };
                    }
                };
                const authEndpoint = authEndpointFactory(fakePassport);
                const app = express();
                app.use(authEndpoint);
                
                chai.request(app).get('/auth/github');
                return expect(authSpy).to.have.been.calledWith('github', { scope: [ 'user:email' ] });
            });
        });
    });
    
    describe('/auth/github/callback', () => {
        describe('GET', () => {
            it('should call passport.authenticate() with the correct parameters', () => {
                const authSpy = sinon.spy();
                const fakePassport = {
                    authenticate: (provider, options) => {
                        authSpy(provider, options);
                        return (req, res, next) => {
                            next();
                        };
                    }
                };
                const authEndpoint = authEndpointFactory(fakePassport);
                const app = express();
                app.use(authEndpoint);
                
                chai.request(app).get('/auth/github/callback');
                return expect(authSpy).to.have.been.calledWith('github', { failureRedirect: '/login' });
            });
            
            it('should redirect a logged in user to their polls page', async () => {
                const fakePassport = {
                    authenticate: (provider, options) => {
                        return (req, res, next) => {
                            next();
                        };
                    }
                };
                const authEndpoint = authEndpointFactory(fakePassport);
                const app = express();
                app.use(authEndpoint);
                //mock the '/mypolls' endpoint to prevent 404s on the redirect
                app.get('/mypolls', (req, res) => {
                    res.send('Hi there!');
                });
                
                const response = await chai.request(app).get('/auth/github/callback');
                expect(response).to.redirect;
                expect(response.redirects[0].endsWith('/mypolls')).to.be.true;
            });
        });
    });
    
    describe('/auth/logout', () => {
        describe('GET', () => {
            it('should log the user out', async () => {
                const logoutSpy = sinon.spy();
                const app = express();
                //create and mount a middleware to mount our spy function to the req object
                app.use((req, res, next) => {
                    req.logout = logoutSpy;
                    next();
                });
                //mock the '/' endpoint to prevent 404s on the redirect
                app.get('/', (req, res) => {
                    res.send('Hi there!');
                });
                const fakePassport = {
                    authenticate: (provider, options) => {
                        return (req, res, next) => {
                            next();
                        };
                    }
                };
                const authEndpoint = authEndpointFactory(fakePassport);
                app.use(authEndpoint);
                
                await chai.request(app).get('/auth/logout');
                return expect(logoutSpy).to.have.been.called;
            });
            
            it('should redirect the user to the index upon logout', async () => {
                const app = express();
                //create and mount a middleware to mock req.logout()
                app.use((req, res, next) => {
                    req.logout = () => {};
                    next();
                });
                //mock the '/' endpoint to prevent 404s on the redirect
                app.get('/', (req, res) => {
                    res.send('Hi there!');
                });
                const fakePassport = {
                    authenticate: (provider, options) => {
                        return (req, res, next) => {
                            next();
                        };
                    }
                };
                const authEndpoint = authEndpointFactory(fakePassport);
                app.use(authEndpoint);
                
                const response = await chai.request(app).get('/auth/logout');
                expect(response).to.redirect;
                expect(response.redirects[0].endsWith('/')).to.be.true;
            });
        });
    });
});