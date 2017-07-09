'use strict';

const chai = require('chai');
const http = require('http');

const expect = chai.expect;

describe('Server', function(done) {
    let server;
    before(function() {
        server = require('../../../server/server.js');
    });
    
    it('should start a web server', function() {
        expect(server).to.be.an.instanceof(http.Server);
    });
    it('should listen on the correct port', function() {
        expect(server.address().port).to.equal(Number(process.env.PORT));
    });
    
    after(function(done) {
        server.close(done);
    })
});