'use strict';

const chai = require('chai');
const sinon = require('sinon');

const UserInterfaceFactory = require('../../../../../server/database/interfaces/user.js');

const expect = chai.expect;

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));

describe('Users database interface', function() {
    describe('createUser()', function() {
        const testUser = { userName: 'foo' };
        
        it('should create a new user model object with the provided data', function() {
            const FakeModel = function(userDocument) {};
            FakeModel.prototype.save = function() {
                return Promise.resolve();
            };
            
            const constructorSpy = sinon.spy(FakeModel);
            UserInterfaceFactory(constructorSpy).createUser(testUser);
            
            expect(constructorSpy).to.have.been.calledWith(testUser);
        });
        
        it('should save the new user to the database', function() {
            const FakeModel = function(userDocument) {};
            const saveSpy = sinon.spy();
            FakeModel.prototype.save = function() {
                saveSpy();
                return Promise.resolve();
            };
            
            UserInterfaceFactory(FakeModel).createUser(testUser);
            
            expect(saveSpy).to.have.been.called;
        });
        
        it('should return a promise that resolves to the user document that was saved', function() {
            const FakeModel = function(userDocument) {
                this.userDocument = userDocument;
                
                this.save = function() {
                    const result = this.userDocument;
                    return new Promise(function(resolve, reject) {
                        resolve(result);
                    });
                };
            };
            
            return expect(UserInterfaceFactory(FakeModel).createUser(testUser)).to.eventually.deep.equal(testUser);
        });
        
        it('should return a rejected promise if it encounters an error', function() {
            const FakeModel = function(userDocument) {};
            const rejectsStub = sinon.stub();
            rejectsStub.rejects({ message: 'test error' });
            FakeModel.prototype.save = function() {
                return rejectsStub();
            };
            
            return expect(UserInterfaceFactory(FakeModel).createUser(testUser)).to.eventually.be.rejectedWith('test error'); 
        });
    });
    
    describe('findUser()', function() {
        const testUser = { userName: 'foo' };
        
        it('should search for a user with the provided id', function() {
            const findSpy = sinon.spy();
            const FakeModel = {
                findOne: findSpy
            };
            
            UserInterfaceFactory(FakeModel).findUser('1234');
            
            expect(findSpy).to.have.been.calledWith({ _id: '1234' });
        });
        
        it('should return a promise that resolves to the user document, if the user exists', function() {
            const FakeModel = {
                findOne: function(selector, callback) {
                    if (selector._id === '1234') {
                        callback(undefined, testUser);
                    } else {
                        callback('test error', undefined);
                    }
                }
            };
            
            return expect(UserInterfaceFactory(FakeModel).findUser('1234')).to.eventually.deep.equal(testUser);
        });
        
        it('should return a rejected promise if the user does not exist', function() {
            const FakeModel = {
                findOne: function(selector, callback) {
                    if (selector._id === '1234') {
                        callback(undefined, testUser);
                    } else {
                        callback('test error', undefined);
                    }
                }
            };
            
            return expect(UserInterfaceFactory(FakeModel).findUser('6969')).to.eventually.be.rejectedWith('test error');
        });
    });
});