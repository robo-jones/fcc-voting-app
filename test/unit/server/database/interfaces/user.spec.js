'use strict';

const User = require('../../../../../server/database/interfaces/user.js');
const chai = require('chai');
const expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('User datatbase interface', function() {
    const goodUser = { userName: 'Bob' };
    
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
    });
});