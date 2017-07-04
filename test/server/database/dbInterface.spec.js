'use strict';

const chai = require('chai');
const mongoose = require('mongoose');
const dbInterface = require('../../../server/database/dbInterface.js');

const expect = chai.expect;

describe('Database interface', function() {
    it('should open a connection the database', function() {
        expect(mongoose.connection.readyState).to.equal(1);
    });
});
