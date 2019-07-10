/*
 * Copyright IBM Corp. 2015,2017
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

// Low Level test of GAAS API

// load locals
require('./lib/localsetenv').applyLocal();

const {URL} = require('url');
var projectId = process.env.GP_PROJECT  || 'MyLLProject'+Math.random();
var projectId2 = process.env.GP_PROJECT2 || 'MyOtherLLProject'+Math.random();
var CLEANSLATE = false; // CLEANSLATE: assume no other projects
var VERBOSE = process.env.GP_VERBOSE || false;
var d = describe;
const bent = require('bent');
const getJson = bent('json');
const retrier = require('./lib/retrier').getRetrier({
  pause: 1000 * 9, // 9s
  retries: 5, // ~50s + txn time
  verbose: false
});

if(VERBOSE) console.dir(module.filename);
var http = require('http');
var randHex = require('./lib/randhex');
var expect = require('chai').expect;

var assert = require('assert');

var gaas = require('../lib/main.js'); // required, below

var gaasTest = require ('./lib/gp-test');
var opts = {credentials: gaasTest.getCredentials()};
var isAdmin = opts.credentials.isAdmin; // admin creds available?
var basicOpts = {basicAuth: true, credentials: gaasTest.getCredentials()};
let _client;

/**
 * Helper for calling connect once…
 */
async function getClient() {
  if(!_client) _client = await gaas.connect(opts);
  return _client;
}

// url ending in `/translate/`
const translateUrl = new URL(opts.credentials.url.replace(/\/rest.*$/,'/'));

var sourceLoc = "en-US";
var targLoc = "zh-Hans";

var sourceData = {
  "key1": "First string to translate",
  "key2": "Second string to translate"
};

var instanceName = randHex()+'-'+randHex();

let httpUrl;
if ( translateUrl.protocol === 'https:') {
  httpUrl = new URL('http:' + translateUrl.toString().substring(6));
}
const versionUrl = new URL('./version', translateUrl);

describe('Check URL ' + versionUrl, function() {
  it('should let us eventually ping ' + versionUrl, async () => {
    if(VERBOSE) console.dir(versionUrl);
    await retrier(() => getJson(versionUrl));
  });

  // verify security headers on landing page
  gaasTest.verifySecurityHeaders(translateUrl.toString());

  it('Should let me fetch landing page of ' + translateUrl.toString(), () => bent(translateUrl));
  var swaggerUrl = new URL('./rest/swagger.json', translateUrl);
  gaasTest.expectCORSURL(swaggerUrl); // expect CORS here
  var swaggerUIUrl = new URL('./swagger/', translateUrl);
  gaasTest.verifySecurityHeadersSwagger(swaggerUIUrl); // expect CORS here
  gaasTest.expectNonCORSURL(translateUrl); // don't expect CORS here
  it('Should let me fetch version page at ' + versionUrl, async function() {
    const data = await getJson(versionUrl);
    if(VERBOSE) console.dir(data.components[Object.keys(data.components)[0]], {color: true});
    expect (data).to.be.ok;
    expect (data.components).to.be.ok;
  });
});

describe('Check HTTP URL', function() {
  if(!httpUrl) {
    it('was not HTTPS - test skipped');
  } else {
    var urlToPing = httpUrl + '/rest/swagger.json';
    it('Should not let me access ' + urlToPing, () => bent(403, 301, urlToPing)); // not 200
  }
});

describe.skip('BASIC auth [not implemented]', function() { // TODO: not supported
  if(process.env.AUTHENTICATION_SCHEME === 'BASIC') {
    it('is allowed, AUTHENTICATION_SCHEME=BASIC', async function(done) {
      var basicClient = await gaas.connect(basicOpts); // not implemented
      basicClient.ready(null, done);
    });
  } else if(!isAdmin) {
    it('is allowed to be ready, normal user.', async function(done) {
      var basicClient = await gaas.connect(basicOpts); // not implemented
      basicClient.ready(null, done);
    });
    it('is allowed, to ping as normal user.', async function(done) {
      var basicClient = await gaas.connect(basicOpts); // not implemented
      basicClient.ping(null, done);
    });
    it('is NOT allowed, to list bundles as normal user.', async function(done) {
      var basicClient = await gaas.connect(basicOpts); // not implemented
      basicClient.getBundleList({}, function(err, x) {
        if(err) done();
        else {
          done(Error('Expected to fail but worked: ' + x));
        }
      });
    });
  } else it('should NOT become ready', async function(done) {
    var basicClient = await gaas.connect(basicOpts); // not implemented
    basicClient.ready(null, function(err) {
      if(err) {
        done();
      } else {
        done(Error('Expected Basic Authentication to not be allowed.'))
      }
    });
  });
});

// these are internals.
// skip for now
// TODO: re enable
describe('client.apis', function() {
  it('should become ready', async function() {
    const gaasClient = await getClient();
    expect(gaasClient).to.be.ok;
  });
  it('should have APIs', async function() {
    const gaasClient = await getClient();
    const swaggerClient = await gaasClient.swaggerClient;
    // Verify the APIs are as expected.
    if(isAdmin) {
      expect(swaggerClient.apis).to.include.keys('bundle','config','instance','service','user','admin');
    } else {
      expect(swaggerClient.apis).to.include.keys('bundle','config','instance','service','user');
    }
  });

  it('should let me get service info', async function() {
    const gaasClient = await getClient();
    const swaggerClient = await gaasClient.swaggerClient;
    const o = await swaggerClient.apis.service.getServiceInfo({});
    // console.dir(o, {color:true, depth:null});
    expect(o.status).to.equal(200);
    expect(o.obj.status).to.equal('SUCCESS');
    expect(o.obj.supportedTranslation).to.include.keys('en');
  });
});
