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
	it('Should verify that both http and https are reachable');
});

describe('test/lib/minispin', function() {
	var minispin = require('./lib/minispin.js');
	it('Should verify that the spinner works');
});

describe('test/lib/randhex', function() {
	var randhex = require('./lib/randhex.js');
	it('Should verify that the random hex works');
});


describe('lib/shimcb', function() {
	var shimcb = require('../lib/shimcb.js');
	it('Should verify that the shimcb works with a cb function');
	it('Should verify that the shimcb works with a promise');
});

describe('lib/utils', function() {
	var utils = require('../lib/utils.js');
	it('Should let us create a Fields object');
	it('Should let us access the Fields list');
	it('Should let us use a comma separated fields list');
	it('Should let us use specified field parameters');
	it('Should let us use no field parameters');
	it('Should let us use no options');
	it('Should let us use a mixture of parameters and options');
});
