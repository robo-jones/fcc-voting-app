'use strict';

const User = require('../../../../../server/database/schemas/user.js');
const chai = require('chai');
const expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('User datatbase schema', function() {
    const goodUser = {
        userName: 'Bob',
        github: {
            id: '1234',
            username: 'test_user',
            displayName: 'Bob'
        }
    };
    
    describe('Validation', function() {
        it('should allow a proper user document to be saved', function() {
            const user = new User(goodUser);
            
            return expect(user.validate()).to.eventually.be.fulfilled;
        });
        
        it('should prevent saving without a username', function() {
            const user = new User({});
            
           return expect(user.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving if the username is not a string or castable to a string', function() {
            const testName = { foo: 'This is something that mongoose cant re-cast to a string' };
            const user = new User({ userName: testName });
            
            return expect(user.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving GitHub profile information if the id is not a string or castable to a string', function() {
            const badUser = {
                userName: 'Bob',
                github: {
                    id: { foo: 'This is something that mongoose cant re-cast to a string' },
                    username: 'test_user',
                    displayName: 'Bob'
                }
            };
            const user = new User(badUser);
            
            return expect(user.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving GitHub profile information if the username is not a string or castable to a string', function() {
            const badUser = {
                userName: 'Bob',
                github: {
                    id: '1234',
                    username: { foo: 'This is something that mongoose cant re-cast to a string' },
                    displayName: 'Bob'
                }
            };
            const user = new User(badUser);
            
            return expect(user.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving GitHub profile information if the displayName is not a string or castable to a string', function() {
            const badUser = {
                userName: 'Bob',
                github: {
                    id: '1234',
                    username: 'test_user',
                    displayName: { foo: 'This is something that mongoose cant re-cast to a string' }
                }
            };
            const user = new User(badUser);
            
            return expect(user.validate()).to.eventually.be.rejected;
        });
    });
});