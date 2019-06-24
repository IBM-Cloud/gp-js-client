/*
 * Copyright IBM Corp. 2015,2018
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

//return true;

const delay = require('delay');
var randHex = require('./lib/randhex');
var gpTest = require ('./lib/gp-test');
var GaasHmac = require('../lib/gp-hmac');
const {mdToHtml} = require('./lib/md-utils');
var GP = require('../lib/main.js'); // required, below
var client;

// var ourReaderKey; // to be filled in - API key.
// var ourReaderClient; // to be filled in - separate client that's just a reader.

const chai = require('chai');
const expect = chai.expect;
const chaiHtml  = require('chai-html');
chai.use(chaiHtml);

var VERBOSE = process.env.GP_VERBOSE || false;
var NO_DELETE = process.env.NO_DELETE || false;
if(VERBOSE) console.dir(module.filename);

var opts = {
  credentials: gpTest.getCredentials()
};

var urlEnv = GP._normalizeUrl(opts.credentials.url); // use GaaS normalize

var randInstanceName = randHex()+'-'+randHex()
// always set the instance id back to the client
var serviceInstanceId = opts.credentials.instanceId =
     (opts.credentials.instanceId) // given
                    || randInstanceName;  // random

describe('Setting up doc test', function() {
  if ( urlEnv ) {
    var urlToPing = urlEnv.replace(/\/rest.*$/,'/');
    if(VERBOSE) console.dir(urlToPing);
    it('should let us directly ping ' + urlToPing, function(done) {
      var timeout;
      var http_or_https = require('./lib/byscheme')(urlEnv);
      var t = 200;
      var loopy = function() {
        if(timeout) {
          clearTimeout(timeout);
          timeout = undefined;
        }
        try {
          http_or_https.get(urlToPing, // trailing slash to avoid 302
            function(d) {
              if(VERBOSE) console.log(urlToPing + '-> ' + d.statusCode); // dontcare
              if(d.statusCode === 200) {
                done();
              } else {
                timeout = setTimeout(loopy, t);
              }
            }).on('error', function(e) {
            if(VERBOSE) console.dir(e, {color: true});
            timeout = setTimeout(loopy, t);
          });
        } catch(e) {
          if(VERBOSE) console.dir(e, {color: true});
          timeout = setTimeout(loopy, t);
        }
      };
      process.nextTick(loopy); // first run
    });


    it('requiring g11n-pipeline with options', async function() {
      client = await GP.connect(opts);
      expect(client).to.be.ok;
      //if(VERBOSE) console.log( client._getUrl() );
    });
  } else {
    // no creds
    it('should have had credentials',  function(done) {
      done('please create local-credentials.json or have GP_URL/GP_USER_ID/GP_PASSWORD/GP_INSTANCE set');
    });
  }
});

// ping
describe('doc: Verifying again that we can reach the server', function() {
  it('Should let us call client.ping', function(done) {
    if(process.env.BAIL_ON_ERR && !client.hasOwnProperty('ping')) {
      console.error('Could not reach server');
      process.exit(1);
    }
    client.ping({}, function(err, data) {

      if(err && process.env.BAIL_ON_ERR) {
        console.error('Could not reach server');
        process.exit(1);
      }

      if(err) { done(err); return; }
      if(VERBOSE) console.dir(data);
      done();
    });
  });
  it('Should let us call client.ping with optional first argument', function(done) {
    if(process.env.BAIL_ON_ERR && !client.hasOwnProperty('ping')) {
      console.error('Could not reach server');
      process.exit(1);
    }
    client.ping(function(err, data) {

      if(err && process.env.BAIL_ON_ERR) {
        console.error('Could not reach server');
        process.exit(1);
      }

      if(err) { done(err); return; }
      if(VERBOSE) console.dir(data);
      done();
    });
  });
});


describe('doc: client.setup instance ' + serviceInstanceId, function() {
  if(opts.credentials.isAdmin) it('should let us create our instance', () => client.restCall("admin.createServiceInstance",
    {
      serviceInstanceId,
      body: {
        serviceId: 'rand-'+randHex(),
        orgId: 'rand-'+randHex(),
        spaceId: 'rand-'+randHex(),
        planId: 'rand-'+randHex(),
        disabled: false
      }
    }));
  describe('doc verify that we can list documents', function() {
    it('should let us list md documents', () => client.getMdDocumentList({serviceInstance: serviceInstanceId}));
    it('should let us list html documents', () => client.getHTMLDocumentList({serviceInstance: serviceInstanceId}));
  });
});

const testmd = 'test.md';
const testhtml = 'test.html';

describe('doc crud markdown', () => {
  it(`should let us delete ${testmd} (errs ignored)`, () => client.MarkdownDocument(testmd)
    .delete()
    .catch((e) => false));
  it(`should let us create ${testmd}`, () => client.MarkdownDocument(testmd)
    .create({
      sourceLanguage: 'en',
      targetLanguages: [ ]
    }));
  it(`should let us getInfo  ${testmd}`, async () => {
    const doc = await (client.MarkdownDocument(testmd)
      .getInfo());
    expect(doc.documentId).to.equal(testmd);
  });
  it(`should let us upload  ${testmd}`, async () => {
    const r = await (client.MarkdownDocument(testmd)
      .upload({
        languageId: 'en',
        body: gpTest.testString(testmd)
      }));
    expect(r).to.be.ok;
  });
  it(`should let us download  ${testmd}`, async () => {
    const r = await (client.MarkdownDocument(testmd)
      .download({
        languageId: 'en'
      }));
    // round trip test via lenient HTML comparison
    expect(await mdToHtml(r)).html.to.equal(await mdToHtml(gpTest.testString(testmd)));
  });
  it(`should let us list md docs`, async () => {
    const list = await client.getMdDocumentList();
    expect(list).to.be.ok;
    expect(list).to.have.property(testmd);
    expect(list[testmd]).to.have.property('updatedAt');
    await list[testmd].upload({
      languageId: 'en',
      body: gpTest.testString('upd', testmd)
    });
  });
  it(`should let us redownload  ${testmd}`, async () => {
    const r = await (client.MarkdownDocument(testmd)
      .download({
        languageId: 'en'
      }));
    // round trip test via lenient HTML comparison
    expect(await mdToHtml(r)).html.to.equal(await mdToHtml(gpTest.testString('upd', testmd)));
  });
  it.skip(`should let us update and verify target langs ${testmd}`, async () => {
    const doc = client.MarkdownDocument(testmd);
    await doc.update({ targetLanguages: ['qru'] });
    const doc2 = await doc.getInfo();
    expect(doc2.targetLanguages).to.deep.equal(['qru']);
  });
  it.skip(`should let us update and verify notes/metadata ${testmd}`, async () => {
    const doc = client.MarkdownDocument(testmd);
    await doc.update({  notes: ['hello'], metadata: { foo: 'bar'} });
    const doc2 = await doc.getInfo();
    expect(doc2.notes).to.deep.equal(['hello2']);
    expect(doc2.metadata).to.deep.equal({foo: 'bar'});
  });
});

describe('doc crud html', () => {
  it(`should let us delete ${testhtml} (errs ignored)`, () => client.HTMLDocument(testhtml)
    .delete()
    .catch((e) => false));
  it(`should let us create ${testhtml}`, () => client.HTMLDocument(testhtml)
    .create({
      sourceLanguage: 'en',
      targetLanguages: [ 'qru' ]
    }));
  it(`should let us getInfo  ${testhtml}`, async () => {
    const doc = await (client.HTMLDocument(testhtml)
      .getInfo());
    expect(doc.documentId).to.equal(testhtml);
  });
  it(`should let us upload  ${testhtml}`, async () => {
    const r = await (client.HTMLDocument(testhtml)
      .upload({
        languageId: 'en',
        body: gpTest.testString(testhtml)
      }));
    expect(r).to.be.ok;
  });
  it(`should let us download  ${testhtml}`, async () => {
    const r = await (client.HTMLDocument(testhtml)
      .download({
        languageId: 'en'
      }));
    expect(r).html.to.equal(gpTest.testString(testhtml));
  });
  it(`should let us list html docs and update`, async () => {
    const list = await client.getHTMLDocumentList();
    expect(list).to.be.ok;
    expect(list).to.have.property(testhtml);
    expect(list[testhtml]).to.have.property('updatedAt');
    await list[testhtml].upload({
      languageId: 'en',
      body: gpTest.testString('upd', testhtml)
    });
  });
  it(`should let us redownload  ${testhtml}`, async () => {
    const r = await (client.HTMLDocument(testhtml)
      .download({
        languageId: 'en'
      }));
    expect(r).html.to.equal(gpTest.testString('upd', testhtml));
  });
});

// unless !delete?
if(NO_DELETE) {
  describe('doc: client.delete', function() {
    it('(skipped- NO_DELETE)');
  });
} else if(opts.credentials.isAdmin) {
  describe('doc: client.delete instance ' + serviceInstanceId, function() {
    it('should let us delete our instance', () => client.restCall("admin.deleteServiceInstance", {
      serviceInstanceId: serviceInstanceId
    }));
  });
}
//  END NO_DELETE

// end of client-test
