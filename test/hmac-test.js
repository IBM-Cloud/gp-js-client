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

// High Level test of GAAS API

// load locals
require('./lib/localsetenv').applyLocal();

var expect = require('chai').expect;

var assert = require('assert');

var GaasHmac = require('../lib/gaas-hmac.js');

// test of various utilities

describe('lib/gaas-hmac', function() {
	it('Should verify that the name and secret is set properly', function() {
		var myHmac = new GaasHmac('MyAuth', 'MyUser', 'MySecret');
		
		expect(myHmac).to.be.ok;
		expect(myHmac.name).to.be.ok;
		expect(myHmac.name).to.equal('MyAuth');
		expect(myHmac.user).to.be.ok;
		expect(myHmac.user).to.equal('MyUser');
		expect(myHmac.secret).to.be.ok;
		expect(myHmac.secret).to.equal('MySecret');
	});
	it('Should verify that we can apply', function() {
		var myHmac = new GaasHmac('MyAuth', 'MyUser', 'MySecret');
		
		expect(myHmac).to.be.ok;
		expect(myHmac.name).to.be.ok;
		expect(myHmac.name).to.equal('MyAuth');
		
		var obj = {
			method: 'https',
			url: 'http://example.com/gaas',
			headers: {
				Authorization: undefined
			},
			body: { param: 'value' }
		};
		
		// we must force the Date so that we have a consistent test.
		myHmac.forceDateString = "Mon, 30 Jun 2014 00:00:00 -0000"; // Bluemix launch date
		expect(myHmac.apply(obj)).to.be.true;
		expect(obj.headers.Authorization).to.be.ok;
		expect(obj.headers.Authorization).to.equal(
			'GaaS-HMAC MyUser:v4ORQ81ddv7/sGJz3C/nLiGBmu0=');
	});
	it('Should verify that we can apply with undefined body', function() {
		var myHmac = new GaasHmac('MyAuth', 'MyUser', 'MySecret');
		
		expect(myHmac).to.be.ok;
		expect(myHmac.name).to.be.ok;
		expect(myHmac.name).to.equal('MyAuth');
		
		var obj = {
			method: 'https',
			url: 'http://example.com/gaas',
			headers: {
				Authorization: undefined
			},
			body: undefined
		};
		
		// we must force the Date so that we have a consistent test.
		myHmac.forceDateString = "Mon, 30 Jun 2014 00:00:00 -0000"; // Bluemix launch date
		expect(myHmac.apply(obj)).to.be.true;
		expect(obj.headers.Authorization).to.be.ok;
		expect(obj.headers.Authorization).to.equal(
			'GaaS-HMAC MyUser:3XqbcIALzsjdtGRdlxKv0jk9R0Q=');
	});
});