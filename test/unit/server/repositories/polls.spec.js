'use strict';

const chai = require('chai');
const sinon = require('sinon');
const ObjectID = require('mongodb').ObjectID;
const pollInterfaceFactory = require('../../../../server/repositories/polls.js');

const expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Polls database interface', () => {
    const goodPollDocument = {
            _id: new ObjectID(),
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
            ]
        };
        
    describe('createPoll()', () => {
       let FakePollModel;
        
        beforeEach(() => {
            FakePollModel = function(pollDocument) {
                this.pollDocument = pollDocument;
            };
            FakePollModel.prototype.save = function() {
                const document = this.pollDocument;
                return Promise.resolve(document);
            };
        });
        
        it('should create a new poll model object with the provided data', () => {
            const constructorSpy = sinon.spy(FakePollModel);
            
            pollInterfaceFactory(constructorSpy).createPoll(goodPollDocument);
            expect(constructorSpy).to.have.been.calledWith(goodPollDocument);
        });
        
        it('should save the new poll to the database', () => {
            const saveSpy = sinon.spy(FakePollModel.prototype, 'save');
            
            pollInterfaceFactory(FakePollModel).createPoll(goodPollDocument);
            expect(saveSpy).to.have.been.called;
        });
        
        it('should return a promise that resolves to the saved document', async () => {
            const result = await pollInterfaceFactory(FakePollModel).createPoll(goodPollDocument);
            expect(result).to.equal(goodPollDocument);
        });
        
        it('should return a rejected promise if it encounters an error', () => {
            const saveStub = sinon.stub(FakePollModel.prototype, 'save');
            saveStub.rejects('an error occurred');
            
            const result = pollInterfaceFactory(FakePollModel).createPoll(goodPollDocument);
            return expect(result).to.eventually.be.rejected;
        });
    });
    
    describe('findPoll()', () => {
        let FakePollModel;
        
        beforeEach(() => {
            FakePollModel = {
                findById: function(id, callback) {
                    if (id === '1234') {
                        callback(undefined, goodPollDocument);
                    } else {
                        callback('poll not found', undefined);
                    }
                }
            };
        });
        
        it('should search for a poll with the provided id', () => {
            const findSpy = sinon.spy(FakePollModel, 'findById');
            
            pollInterfaceFactory(FakePollModel).findPoll('1234');
            expect(findSpy).to.have.been.calledWith('1234');
        });
        
        it('should return a promise that resolves to the poll document, if it exists', async () => {
            const result = await pollInterfaceFactory(FakePollModel).findPoll('1234');
            expect(result).to.equal(goodPollDocument);
        });
        
        it('should return a rejected promise if the poll does not exist', async () => {
            const result = pollInterfaceFactory(FakePollModel).findPoll('6969');
            return expect(result).to.eventually.be.rejectedWith('poll not found');
        });
    });
    
    describe('deletePoll()', () => {
        let FakePollModel;
        
        beforeEach(() => {
            FakePollModel = {
                findByIdAndRemove: function(id, callback) {
                    if (id === '1234') {
                        callback(undefined, goodPollDocument);
                    } else {
                        callback('poll not found', undefined);
                    }
                }
            };
        });
        
        it('should search for a poll with the provided id and delete it', () => {
            const deleteSpy = sinon.spy(FakePollModel, 'findByIdAndRemove');
            
            pollInterfaceFactory(FakePollModel).deletePoll('1234');
            return expect(deleteSpy).to.have.been.calledWith('1234');
        });
        
        it('should return a promise that resolves to the deleted poll upon succedd', async () => {
            const result = await pollInterfaceFactory(FakePollModel).deletePoll('1234');
            expect(result).to.equal(goodPollDocument);
        });
        
        it('should return a rejected promise if the poll does not exist', () => {
            const result = pollInterfaceFactory(FakePollModel).deletePoll('6969');
            return expect(result).to.eventually.be.rejectedWith('poll not found');
        });
    });
    
    describe('findPollsByUser()', () => {
        
        it('should search for polls with the provided user id', () => {
            const querySpy = sinon.spy();
            const FakePollModel = {
                find: querySpy
            };
            
            pollInterfaceFactory(FakePollModel).findPollsByUser('1234');
            return expect(querySpy).to.have.been.calledWith({ creator: '1234' });
        });
        
        it('should return a promise that resolves to all the polls by the provided user id', async () => {
            const testPolls = ['poll 1', 'poll 2'];
            const FakePollModel = {
                find: function(query, callback) {
                    callback(undefined, testPolls);
                }
            };
            
            const results = await pollInterfaceFactory(FakePollModel).findPollsByUser('1234');
            
            expect(results).to.deep.equal(testPolls);
        });
        
        it('should reject the promise with \'no polls found\' if there are no polls by the provided user id', () => {
            const FakePollModel = {
                find: function(query, callback) {
                    callback(undefined, []);
                }
            };
            
            const results = pollInterfaceFactory(FakePollModel).findPollsByUser('1234');
            
            return expect(results).to.eventually.be.rejectedWith('no polls found');
        });
        
        it('should return a rejected promise if an error occurs', () => {
            const FakePollModel = {
                find: function(query, callback) {
                    callback('an error occured', undefined);
                }
            };
            
            const results = pollInterfaceFactory(FakePollModel).findPollsByUser('1234');
            
            return expect(results).to.eventually.be.rejected;
        });
    });
});