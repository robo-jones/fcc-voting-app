'use strict';

const chai = require('chai');
const sinon = require('sinon');
const githubAuthFunctionFactory = require('../../../../server/authentication/githubOAuth.js').gitHubAuthFunctionFactory;

const expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('GitHub OAuth Authorization function', () => {
    const testUser = {
        userName: 'Bob',
        github: {
            id: '1234',
            username: 'test_user',
            displayName: 'Bob'
        }
    };
    const testProfile = testUser.github;
    
    it('should search for a user with the provided GitHub profile', async () => {
        const findByGithubSpy = sinon.spy();
        
        const fakeUserRepo = {
            findUserByGithub: findByGithubSpy
        };
        
        await githubAuthFunctionFactory(fakeUserRepo)(undefined, undefined, testProfile, sinon.stub());
        
        expect(findByGithubSpy).to.be.calledWith(testProfile);
    });
    
    it('should pass the user to Passport if they are in the database', (done) => {
        const fakeDone = (e, user) => {
            expect(user).to.deep.equal(testUser);
            done();
        };
        const fakeUserRepo = {
            findUserByGithub: (profile) => {
                return Promise.resolve(testUser);
            }
        };
        
        githubAuthFunctionFactory(fakeUserRepo)(undefined, undefined, testProfile, fakeDone);
    });
    
    it('should create a new user with the GitHub displayName as the userName, if they are not in the database', (done) => {
        const fakeUserRepo = {
            findUserByGithub: (profile) => {
                return Promise.reject('user not found');
            },
            createUser: (document) => {
                expect(document).to.deep.equal(testUser);
                done();
            }
        };
        
        githubAuthFunctionFactory(fakeUserRepo)(undefined, undefined, testProfile, sinon.stub());
    });
    
    it('should create a new user with the GitHub username as the userName, if they do not have a displayName', (done) => {
        const noDisplayNameUser = JSON.parse(JSON.stringify(testUser));
        noDisplayNameUser.github.displayName = undefined;
        noDisplayNameUser.userName = noDisplayNameUser.github.username;
        const fakeUserRepo = {
            findUserByGithub: (profile) => {
                return Promise.reject('user not found');
            },
            createUser: (document) => {
                expect(document).to.deep.equal(noDisplayNameUser);
                done();
            }
        };
        
        githubAuthFunctionFactory(fakeUserRepo)(undefined, undefined, noDisplayNameUser.github, sinon.stub());
    });
    
    it('should pass a newly created user to Passport', (done) => {
        const fakeUserRepo = {
            findUserByGithub: (profile) => {
                return Promise.reject('user not found');
            },
            createUser: (document) => {
                return Promise.resolve(document);
            }
        };
        const fakeDone = (e, user) => {
            expect(user).to.deep.equal(testUser);
            done();
        };
        
        githubAuthFunctionFactory(fakeUserRepo)(undefined, undefined, testProfile, fakeDone);
    });
    
    it('should pass any errors to done()', (done) => {
        const fakeUserRepo = {
            findUserByGithub: (profile) => {
                return Promise.reject('an unspecified error occured');
            }
        };
        const fakeDone = (e, user) => {
            expect(e).to.equal('an unspecified error occured');
            done();
        };
        
        githubAuthFunctionFactory(fakeUserRepo)(undefined, undefined, testProfile, fakeDone);
    });
});