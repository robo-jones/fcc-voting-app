'use strict';

const chai = require('chai');
const sinon = require('sinon');
const ObjectID = require('mongodb').ObjectID;
const pollInterfaceFactory = require('../../../../server/repositories/polls.js');

const expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Polls repository', () => {
    const goodPollDocument = {
        title: 'poll title',
        creator: new ObjectID(),
        options: [
            {
                name: 'option 1',
                votes: 0
            },
            {
                name: 'option 2',
                votes: 0
            }
        ],
        alreadyVoted: []
    };
        
    describe('createPoll()', () => {
       let FakePollModel;
       const inputPollDocument = {
           creator: goodPollDocument.creator,
           title: goodPollDocument.title,
           options: [goodPollDocument.options[0].name, goodPollDocument.options[1].name]
       };
        
        beforeEach(() => {
            FakePollModel = function(pollDocument) {
                this.pollDocument = pollDocument;
            };
            FakePollModel.prototype.save = function() {
                const document = this.pollDocument;
                return Promise.resolve(document);
            };
        });
        
        it('should format the input document and create a new poll model object with the formatted data', () => {
            const constructorSpy = sinon.spy(FakePollModel);
            
            pollInterfaceFactory(constructorSpy).createPoll(inputPollDocument);
            expect(constructorSpy).to.have.been.calledWith(goodPollDocument);
        });
        
        it('should save the new poll to the database', () => {
            const saveSpy = sinon.spy(FakePollModel.prototype, 'save');
            
            pollInterfaceFactory(FakePollModel).createPoll(inputPollDocument);
            expect(saveSpy).to.have.been.called;
        });
        
        it('should return a promise that resolves to the saved document', async () => {
            const result = await pollInterfaceFactory(FakePollModel).createPoll(inputPollDocument);
            expect(result).to.deep.equal(goodPollDocument);
        });
        
        it('should return a rejected promise if it encounters an error', () => {
            const saveStub = sinon.stub(FakePollModel.prototype, 'save');
            saveStub.rejects('an error occurred');
            
            const result = pollInterfaceFactory(FakePollModel).createPoll(inputPollDocument);
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
            expect(result).to.deep.equal(goodPollDocument);
        });
        
        it('should reject the promise with \'poll not found\' if the poll does not exist', async () => {
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
            expect(result).to.deep.equal(goodPollDocument);
        });
        
        it('should reject the promise with \'poll not found\' if the poll does not exist', () => {
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
    
    describe('vote()', () => {
        const pollId = '12345';
        const voterId = '12345';
        const option = 1;
        let FakePollModel;
        
        beforeEach(() => {
            FakePollModel = {
                findById: (id, callback) => {
                    const fakeDocument = JSON.parse(JSON.stringify(goodPollDocument));
                    fakeDocument.save = () => {};
                    callback(undefined, fakeDocument);
                }
            };
        });
        
        
        it('should search for the provided poll id', () => {
            const findSpy = sinon.spy(FakePollModel, 'findById');
            
            pollInterfaceFactory(FakePollModel).vote(pollId, option);
            expect(findSpy).to.have.been.calledWith(pollId);
        });
        
        it('should increment the vote count of the provided option, add the voter to alreadyVoted, and update the poll in the database', async () => {
            const fakeDocument = JSON.parse(JSON.stringify(goodPollDocument));
            fakeDocument.save = () => {};
            FakePollModel = {
                findById: (id, callback) => {
                    callback(undefined, fakeDocument);
                }
            };
            const saveSpy = sinon.spy(fakeDocument, 'save');
            
            await pollInterfaceFactory(FakePollModel).vote(pollId, option, voterId);
            expect(fakeDocument.options[option].votes).to.equal(goodPollDocument.options[option].votes + 1);
            expect(fakeDocument.alreadyVoted.indexOf(voterId)).to.not.equal(-1);
            expect(saveSpy).to.have.been.called;
        });
        
        it('should return a promise with the name of the voted for option', () => {
            const results = pollInterfaceFactory(FakePollModel).vote(pollId, option);
            
            return expect(results).to.eventually.equal(goodPollDocument.options[option].name);
        });
        
        it('should reject the promise with \'poll not found\' if the poll does not exist', () => {
            sinon.stub(FakePollModel, 'findById').callsFake((id, callback) => { callback(undefined, undefined) });
            const results = pollInterfaceFactory(FakePollModel).vote(pollId, option);
            
            return expect(results).to.eventually.be.rejectedWith('poll not found');
        });
        
        it('should reject the promise with \'user has already voted\' if the voter has already voted on this poll', () => {
            const fakeDocument = JSON.parse(JSON.stringify(goodPollDocument));
            fakeDocument.save = () => {};
            fakeDocument.alreadyVoted.push(voterId);
            FakePollModel = {
                findById: (id, callback) => {
                    callback(undefined, fakeDocument);
                }
            };
            const results = pollInterfaceFactory(FakePollModel).vote(pollId, option, voterId);
            
            return expect(results).to.eventually.be.rejectedWith('user has already voted');
        });
    });
});