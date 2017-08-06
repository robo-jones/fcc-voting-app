'use strict';

const Poll = require('../../../../../server/database/schemas/poll.js');
const chai = require('chai');
const ObjectID = require('mongodb').ObjectID;

const expect = chai.expect;

chai.use(require('chai-as-promised'));

describe('Poll database schema', function() {
    const properPoll = {
        title: 'poll title',
        creator: new ObjectID(),
        options: [
            {
                name: 'option 1',
                votes: 1
            },
            {
                name: 'option 2',
                votes: 2
            }
        ],
        alreadyVoted: ['192.168.0.1'],
    };
    
    describe('Validation', function() {
        it('should allow a proper poll document to be saved', function() {
            const poll = new Poll(properPoll);
            
            return expect(poll.validate()).to.eventually.be.fulfilled;
        });
        
        it('should prevent saving without a title', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.title = undefined;
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving if the poll title is not a string or castable to a string', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.title = { foo: 'This is something that mongoose cant re-cast to a string' };
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving without a creator', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.creator = undefined;
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving if the poll creator is not a valid mongodb ObjectID', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.creator = 'foo';
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving without any options', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.options = undefined;
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving unless there are at least two options', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.options.pop();
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving if an option does not have a name', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.options[0].name = undefined;
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving if an option\'s name is not a string or castable to a string', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.options[0].name = { foo: 'This is something that mongoose cant re-cast to a string' };
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving if an option\'s votes are not a number or castable to a number', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.options[0].votes = 'This is something that mongoose cant re-cast to a number';
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving if an option does not have a votes property', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.options[0].votes = undefined;
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving if an option\'s votes are less than 0', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.options[0].votes = -1;
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving if an option\'s votes are not an integer value', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.options[0].votes = 6.9;
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
        
        it('should prevent saving if an alreadyVoted is not a string or castable to a string', function() {
            const badPoll = JSON.parse(JSON.stringify(properPoll));
            badPoll.alreadyVoted[0] = { foo: 'This is something that mongoose cant re-cast to a string' };
            
            const poll = new Poll(badPoll);
            
            return expect(poll.validate()).to.eventually.be.rejected;
        });
    });
});