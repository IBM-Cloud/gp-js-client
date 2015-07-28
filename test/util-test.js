/*	
 * Copyright IBM Corp. 2015
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var expect = require('chai').expect;

var assert = require('assert');

// test of various utilities

describe('test/lib/byscheme', function() {
	var byscheme = require('./lib/byscheme.js');
	it('Should verify that http works and is ≠ https', function() {
		var http = byscheme('http://ibm.com');
		expect(http).to.be.ok;
		expect(http).to.equal(require('http'));
		expect(http).to.not.equal(require('https'));
	});
	it('Should verify that https works and is ≠ http', function() {
		var https = byscheme('https://ibm.com');
		expect(https).to.be.ok;
		expect(https).to.equal(require('https'));
		expect(https).to.not.equal(require('http'));
	});
});

describe('test/lib/minispin', function() {
	var minispin = require('./lib/minispin.js');
	it('Should verify that the spinner works', function() {
		for(var i=0;i<8;i++) {
			minispin.step();
		}
		minispin.clear();
	});
});

describe('test/lib/randhex', function() {
	var randhex = require('./lib/randhex.js');
	it('Should verify that the random hex works', function() {
		var x = randhex();
		var y = randhex();
		expect(x).to.not.equal(y);
		expect(x.length).to.not.equal(0);
		expect(parseInt(x,16)).to.not.equal(parseInt(y,16));
	});
});


describe('lib/shimcb', function() {
	var shimcb = require('../lib/shimcb.js');
	/**
	 * Add two numbers. Error if the sum = 0.
	 * @param {Number} x - addend
	 * @param {Number} y - addend
	 * @param {Function} cb - optional, if not present, promise is returned
	 * @return {Promise} - if cb is falsy
	 */
	function myFunc(x, y, cb) {
		var deferred = shimcb.wrap(cb);
		process.nextTick(function() {
			var z = (x + y);
			if(z == 0) {
				deferred.reject(Error('Result was zero'));
			} else {
				deferred.resolve(z);
			}
		});
		return shimcb.return(deferred);
	}
	
	it('Should verify that the shimcb works with a cb function', function(done) {
		expect(myFunc(2,4, function(err, z) {
			expect(err).to.be.null;
			expect(z).to.equal(6);
			done();
		})).to.be.true;
	});
	it('Should verify that the shimcb works with a promise', function(done) {
		myFunc(2,4)
		.then(function(z){
			expect(z).to.equal(6);
			done();
		}, done);
	});
	it('Should verify that the shimcb can fail with a cb function', function(done) {
		expect(myFunc(0, 0, function(err, z) {
			expect(err).to.not.be.null;
			done();
		})).to.be.true;
	});
	it('Should verify that the shimcb can fail with a promise', function(done) {
		myFunc(0, 0)
		.then(function(z){
			done(Error('Should have failed (reject)'));
		}, function(e) {
			done();
		});
	});
});

describe('lib/utils', function() {
	var utils = require('../lib/utils.js');
	
	describe('Fields', function() {
		var f;
		it('Should let us create a Fields object', function() {
			f = new utils.Fields("soccer baseball rugby");
			expect(f).to.be.ok;
		});
		it('Should let us access the Fields list', function() {
			expect(f.fields).to.be.an('array');
			expect(f.fields).to.contain('rugby');
			expect(f.fields).to.contain('soccer');
			expect(f.fields).to.contain('baseball');
			expect(f.fields).to.not.contain('backgammon');
		});
		it('Should let us use a comma separated fields list', function() {
			var o = f.processFields({
				fields: "soccer,rugby"
			});
			expect(o).to.be.ok;
			expect(o).to.equal("soccer,rugby"); // in order of the original array
		});
		it('Should let us use specified field parameters', function() {
			var o = f.processFields({
				baseball: true,
				carroms: true,
				soccer: false
			});
			expect(o).to.be.ok;
			expect(o).to.equal("baseball"); // in order of the original array
		});
		it('Should let us use no field parameters', function() {
			var o = f.processFields({});
			expect(o).to.not.be.ok;
		});
		it('Should let us use null field parameters', function() {
			var o = f.processFields({ fields: null});
			expect(o).to.not.be.ok;
		});
		it('Should let us use false field parameters', function() {
			var o = f.processFields({ baseball: false, soccer: false, rugby: false, hockey: false});
			expect(o).to.not.be.ok;
		});
		it('Should let us use no options', function() {
			var o = f.processFields();
			expect(o).to.not.be.ok;
		});
		it('Should let us use a mixture of parameters and options', function() {
			var o = f.processFields({
				fields: "rugby,baseball",
//				baseball: false,  // Fields only add. 
				soccer: true
			});
			expect(o).to.be.ok;
			expect(o).to.equal("rugby,baseball,soccer");
		});
	});
});
