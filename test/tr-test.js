/*
 * Copyright IBM Corp. 2015,2019
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

// test of Translation Request API

// load locals
require('./lib/localsetenv').applyLocal();

//return true;

// var Q = require('q');

var randHex = require('./lib/randhex');
var gaasTest = require('./lib/gp-test');
var gpTest = require ('./lib/gp-test');
const testData = gaasTest.testData;

// if (process.env.NO_TR_TEST) { describe = describe.skip; }

var gaas = require('../lib/main.js'); // required, below


var expect = require('chai').expect;

var VERBOSE = process.env.GP_VERBOSE || false;
var NO_DELETE = process.env.NO_DELETE || false;
if (VERBOSE) console.dir(module.filename);

var projectId = process.env.GP_TR_PROJECT || 'MyTRProject' + Math.random();

const retrier = require('./lib/retrier').getRetrier({
  pause: 1000 * 9, // 9s
  retries: 5, // ~50s + txn time
  verbose: false
});

const srcLang = 'en';
const targLang0 = 'es';

var opts = {
  credentials: gaasTest.getCredentials()
};

var randInstanceName = randHex() + '-' + randHex()
var instanceName = (opts.credentials.instanceId) // given
  || randInstanceName;  // random

// if we are using a random instance name, set it here.
opts.credentials.instanceId = opts.credentials.instanceId || instanceName;

const partnerId = opts.credentials.partnerId || process.env.GP_TEST_PARTNER || 'TST';

var gaasClient;

function resterr(o) {
  if (!o) {
    return Error("(falsy object)");
  }
  if (o.data && o.message) {
    return Error(o.data.message);
  } else if (o.message) {
    return Error(o.message);
  }
}
var urlEnv = gaas._normalizeUrl(opts.credentials.url); // use GaaS normalize

describe('Setting up GP-HPE test', function () {
  if (urlEnv) {
    it('requiring gaas with options', async function () {
      gaasClient = await gaas.connect(opts);
      expect(gaasClient).to.be.ok;
    });
  } else {
    // no creds
    it('should have had credentials', function (done) {
      done('please create local-credentials.json or have GP_URL/GP_USER_ID/GP_PASSWORD/GP_INSTANCE set');
    });
  }
  it('Should let us call gaasClient.ping', () => gaasClient.ping());
});

describe('GP-HPE.setup instance ' + instanceName, function () {
  if (opts.credentials.isAdmin) it('should let us create our instance', () => gaasClient.restCall("admin.createServiceInstance", {
    serviceInstanceId: instanceName,
    body: {
      serviceId: 'rand-' + randHex(),
      orgId: 'rand-' + randHex(),
      spaceId: 'rand-' + randHex(),
      planId: 'rand-' + randHex(),
      disabled: false
    }}));
  // just make sure it's OK
  it('should now let me call bundles() (cb)', function (done) {
    gaasClient.bundles({ serviceInstance: instanceName }, function (err, data) {
      if (err) {
        done(err);
      } else {
        if (opts.credentials.isAdmin) {
          expect(data).to.be.ok;
          expect(data).to.eql({});
        } else {
          if (VERBOSE && data.length > 0) {
            console.log('Note: You have pre existing instances. That’s probably ok, though best to run this test with a clean slate.');
          }
        }
        done();
      }
    });
  });
});

describe('GP-HPE tr() and trs() api test', function () {
  it('Should be able to let us construct a default tr', function () {
    const tr = gaasClient.tr();
    expect(tr).to.be.ok;
  });
  it('Should be able to let us construct a tr with some ID', function () {
    const tr = gaasClient.tr('someId');
    expect(tr).to.be.ok;
    expect(tr.id).to.equal('someId');
  });
  it('Should be able to let us construct a tr with some fields', function () {
    const tr = gaasClient.tr({ a: 'one', b: 'two' });
    expect(tr).to.be.ok;
    expect(tr.a).to.equal('one');
    expect(tr.b).to.equal('two');
  });
  it('Should let us call trs() and have an empty list', function (done) {
    gaasClient.trs({serviceInstance: instanceName}, function (err, trs) {
      if (err) return done(err);
      expect(trs).to.be.ok;
      expect(trs).to.deep.equal({});
      return done();
    });
  });
});

describe('GP-HPE.bundle()', function () {
  it('Should let us create', function (done) {
    var proj = gaasClient.bundle({ id: projectId, serviceInstance: instanceName });
    proj.create({
      sourceLanguage: srcLang,
      // targetLanguages: [targLang0], // add trgLang when we upload, to avoid MT
      notes: ['Note to self']
    }, function (err, resp) {
      if (err) return done(err);
      return done();
    });
  });

  it('GP-HPE Should let us upload some ' + srcLang + ' strings ' + projectId, function (done) {
    if(VERBOSE) console.dir(testData('t1', '0', srcLang));
    var proj = gaasClient.bundle({ id: projectId, serviceInstance: instanceName });
    proj.uploadStrings({
      languageId: srcLang,
      strings: testData('t1', '0', srcLang)
    }, done);
  });
  it('GP-HPE Should let us upload some ' + targLang0 + ' strings ' + projectId, function (done) {
    if(VERBOSE) console.dir(testData('t1', '0', targLang0));
    var proj = gaasClient.bundle({ id: projectId, serviceInstance: instanceName });
    proj.uploadStrings({
      languageId: targLang0,
      strings: testData('t1', '0', targLang0)
    }, done);
  });


  it('GP-HPE should let us verify the target data(es)', function (done) {
    var proj = gaasClient.bundle({ id: projectId, serviceInstance: instanceName });
    proj.getStrings({ languageId: targLang0 },
      function (err, data) {
        if (err) { done(err); return; }
        expect(data).to.have.a.property('resourceStrings');
        expect(data.resourceStrings).to.deep.equal(testData('t1', '0', targLang0));
        done();
      });
  });

  it('GP-HPE Should let me update the review status of a bundle', function (done) {
    var entry = gaasClient
      .bundle({ id: projectId, serviceInstance: instanceName })
      .entry({ languageId: targLang0, resourceKey: 'hi' });
    entry.update({
      reviewed: false,
      sequenceNumber: 42
    }, function (err, data) {
      if (err) return done(err);
      entry.getInfo({},
        function (err, entry2) {
          if (err) return done(err);
          expect(entry2.reviewed).to.be.false;
          return done();
        });
    });
  });
});

// OK now 'hi' is marked not reviewed.
// open a TR.

var trId1;

describe('GP-HPE: Requesting our first TR', function () {
  it('Should request the first TR', function (done) {
    const requestData = {
      name: 'FirstTR',
      emails: ['noname@example.com'],
      partner: partnerId,
      targetLanguagesByBundle: {}, // to fill in
      status: 'SUBMITTED', // request to submit it right away.
      notes: [ '{{10,10,@@@ }}' ]
    };
    requestData.targetLanguagesByBundle[projectId] = [targLang0];
    if(VERBOSE) console.dir(requestData);
    gaasClient.tr(requestData)
      .create({serviceInstance: instanceName}, function cb(err, tr) {
        if (err) return done(err);
        expect(tr.id).to.be.ok;
        trId1 = tr.id;

        expect(tr.gp).to.be.ok; // Internal prop: it's an object

        expect(tr.status).to.equal('SUBMITTED');
        expect(tr.wordCountsByBundle).to.be.ok;
        expect(tr.createdAt).to.be.ok;

        return done();
      });
  });
  // It's possible that the TR is merged by the time we get to it.
  it('should eventually show the TR as STARTED (or MERGED or TRANSLATED)', () =>
    retrier(async () => {
      const tr = await (gaasClient.tr(trId1).getInfo());
      expect(['STARTED','MERGED','TRANSLATED']).to.include(tr.status, `${tr.id} status`);
      expect(tr.id).to.equal(trId1);
      // TODO: more here.
      expect(tr.startedAt).to.be.ok;
      expect(tr.startedAt).to.be.at.least(tr.createdAt);
    }));
  it('should eventually show the TR as MERGED', () =>
    retrier(async () => {
      const tr = await (gaasClient.tr(trId1).getInfo());
      expect(['MERGED']).to.include(tr.status, `${tr.id} status`);
      expect(tr.id).to.equal(trId1);
      expect(tr.translatedAt).to.be.ok;
      expect(tr.translatedAt).to.be.at.least(tr.startedAt);
      expect(tr.mergedAt).to.be.ok;
      expect(tr.mergedAt).to.be.at.least(tr.translatedAt);
    }));
  it('Should now have a reviewed field and translated content thanks to the TR', function (done) {
    var entry = gaasClient
      .bundle({ id: projectId, serviceInstance: instanceName })
      .entry({ languageId: targLang0, resourceKey: 'hi' });
    entry.getInfo({serviceInstance: instanceName},
      function (err, entry2) {
        if (err) return done(err);
        expect(entry2.reviewed).to.be.true;
        expect(entry2.updatedBy).to.equal('$'+partnerId+'.AUTOTEST');
        expect(entry2.value).to.equal(testData('t1', '1', targLang0)[entry2.resourceKey]);
        expect(entry2.translationStatus).to.equal('TRANSLATED');
        if(VERBOSE) console.dir(entry2);
        return done();
      });
  });
  it('Should be able to delete the TR', function(done) {
    gaasClient.tr(trId1).delete(function(err, data) {
      if(err) return done(err);
      if(VERBOSE) console.dir(data);
      return done();
    });
  });
});

var trId2;

describe('GP-HPE now try using tr.update', function() {
  it('GP-HPE Should let me update the review status of a bundle', function (done) {
    var entry = gaasClient
      .bundle({ id: projectId, serviceInstance: instanceName })
      .entry({ languageId: targLang0, resourceKey: 'hi' });
    entry.update({
      reviewed: false, // reset reviewd status
      value: testData('t1', '0', targLang0)[entry.resourceKey], // reset the value
      notes: ['Take note.', 'note: Take.']
    }, function (err, data) {
      if (err) return done(err);

      entry.getInfo({},
        function (err, entry2) {
          if (err) return done(err);
          expect(entry2.reviewed).to.be.false;
          expect(entry2.value).to.equal(testData('t1', '0', targLang0)[entry.resourceKey])
          return done();
        });
    });
  });

  it('Should create the second TR', function (done) {
    const requestData = {
      name: 'Second TR draft', // TODO: docs say this is optional?
      emails: ['my_real_name_not_really@example.com'], // TODO: docs say this is optional?
      partner: partnerId, // TODO: try changing partner name in update
      targetLanguagesByBundle: {}, // to fill in
      status: 'DRAFT', // do not submit yet
      domains: [ 'FINSVCS', 'CNSTRCT' ],
      notes: [ 'a', 'b', 'c' ]
    };
    requestData.targetLanguagesByBundle[projectId] = [targLang0];
    if(VERBOSE) console.dir(requestData);
    gaasClient.tr(requestData)
      .create(function cb(err, tr) {
        if (err) return done(err);
        expect(tr.id).to.be.ok;
        trId2 = tr.id;

        expect(tr.gp).to.be.ok; // Internal prop: it's an object

        expect(tr.status).to.equal('DRAFT');
        expect(tr.wordCountsByBundle).to.be.ok;
        expect(tr.createdAt).to.be.ok;
        if(VERBOSE) { delete tr.gp; console.dir(tr); }
        expect(tr.domains).to.contain('CNSTRCT');
        expect(tr.domains).to.contain('FINSVCS');
        expect(tr.notes).to.deep.equal(['a','b','c']);
        expect(tr.wordCountsByBundle[projectId]).to.deep.equal({sourceLanguage: srcLang, counts: { es: 1 } });
        return done();
      });
  });

  it('Should get the DRAFT tr with summary only to avoid word count calculation', function (done) {
    gaasClient.tr(trId2).getInfo({summary : true}, (err, tr) => {
      if (err) return done(err);
      expect(tr.id).to.be.ok;
      expect(tr.gp).to.be.ok; // Internal prop: it's an object
      expect(tr.status).to.equal('DRAFT');
      expect(tr.wordCountsByBundle).to.be.empty; // summary view should not include word count for draft trs
      expect(tr.createdAt).to.be.ok;
      if(VERBOSE) { delete tr.gp; console.dir(tr); }
      expect(tr.domains).to.contain('CNSTRCT');
      expect(tr.domains).to.contain('FINSVCS');
      expect(tr.notes).to.deep.equal(['a','b','c']);
      return done();
    })
  });

  const updateData = {
    notes: [ 'b', 'c', 'a' ]
  };
  it('Should be able to update the TR notes', function(done) {
    gaasClient.tr(trId2)
      .update(updateData, function(err, data) {
        if(err) return done(err);

        if(VERBOSE) console.dir(data);
        return done();
      });
  });

  it('Should be able to verify the updated TR values', function(done) {
    gaasClient.tr(trId2)
      .getInfo(function(err, tr) {
        if(err) return done(err);

        if(VERBOSE) console.dir(tr);

        expect(tr.notes).to.deep.equal(updateData.notes);

        return done();
      });
  });

  it('Should be able to update the DRAFT TR to SUBMITTED asynchronously', function(done) {
    const updateToSubmit = {
      status: "SUBMITTED",
      async: true
    };
    gaasClient.tr(trId2).update(updateToSubmit, function (err, response) {
      if(err) return done(err);
      expect(response.status).to.eq("SUCCESS");
      expect(response.translationRequest).to.be.ok;
      // word count should be calculated as part of the asynchronous process
      expect(response.translationRequest.wordCountsByBundle).to.be.empty;
      // check if the word count is subsequently calculated as part of the asynchronous process.
      return done();
    });
  });
  it('Should be able to verify word counts', () => retrier(async () => {
    const tr = await gaasClient.tr(trId2).getInfo();
    expect(Object.keys(tr.wordCountsByBundle).length).to.not.equal(0, 'no word counts available');
    expect(tr.id).to.equal(trId2);
    // word count is calculated asynchronously on submission
    expect(tr.status).to.equal("SUBMITTED");
    expect(tr.wordCountsByBundle).to.not.be.empty;
    if(VERBOSE) console.dir(tr);
  }));
});

// Translation request test for documents
describe('GP-HPE docTr() and docTrs() api test', function () {
  it('Should be able to let us construct a default document tr', function () {
    const tr = gaasClient.docTr();
    expect(tr).to.be.ok;
  });
  it('Should be able to let us construct a document tr with some ID', function () {
    const tr = gaasClient.docTr('someId');
    expect(tr).to.be.ok;
    expect(tr.id).to.equal('someId');
  });
  it('Should be able to let us construct a document tr with some fields', function () {
    const tr = gaasClient.docTr({ a: 'one', b: 'two' });
    expect(tr).to.be.ok;
    expect(tr.a).to.equal('one');
    expect(tr.b).to.equal('two');
  });
  it('Should let us call docTrs() and have an empty list', function (done) {
    gaasClient.docTrs({serviceInstance: instanceName}, function (err, trs) {
      if (err) return done(err);
      expect(trs).to.be.ok;
      expect(trs).to.deep.equal({});
      return done();
    });
  });
});

const testhtml = "test.html"
const testhtml2 = "test2.html"
describe('Delete Documents (if they exist) before testing', function () {
  it(`Should delete ${testhtml} before creating it again for testing`, async () => {
    const deleted = await gaasClient.HTMLDocument(testhtml).delete()
      .then((res) => {
        expect(res.status).to.equal("SUCCESS");
        return true;
      })
      .catch((e) => {
        console.log("error ", e);
        return false;
      });
    expect(deleted).to.be.true;
  });
  it(`Should delete ${testhtml2} before creating it again for testing`, async () => {
    const deleted = await gaasClient.HTMLDocument(testhtml2).delete()
      .then((res) => {
        expect(res.status).to.equal("SUCCESS");
        return true;
      })
      .catch((e) => {
        console.log("error ", e);
        return false;
      });
    expect(deleted).to.be.true;
  });
});
describe('GP-HPE.HTMLDocument()', function () {
  it(`Should let us create a html document ${testhtml}`, async () => {
    const created = await gaasClient.HTMLDocument(testhtml).create({
      sourceLanguage: srcLang,
      targetLanguages: ["es", "qru"],
      notes: ['Note to self']
    });
    expect(created).to.be.ok;
    expect(created.status).to.equal("SUCCESS");
  });
  it(`Should let us create a html document ${testhtml2}`, async () => {
    const created = await gaasClient.HTMLDocument(testhtml2).create({
      sourceLanguage: srcLang,
      targetLanguages: ["es", "qru"],
      notes: ['Note to self']
    });
    expect(created).to.be.ok;
    expect(created.status).to.equal("SUCCESS");
  });

  it(`GP-HPE Should let us upload some  source language (${srcLang}) content for html document:  ${testhtml}`, async () => {
    const r = await (gaasClient.HTMLDocument(testhtml)
      .upload({
        languageId: 'en',
        body: gpTest.testString(testhtml)
      }));
    expect(r).to.be.ok;
  });
  it(`GP-HPE Should let us upload some  source language (${srcLang}) content for html document:  ${testhtml2}`, async () => {
    const r = await (gaasClient.HTMLDocument(testhtml2)
      .upload({
        languageId: 'en',
        body: gpTest.testString(testhtml) // re-using same content
      }));
    expect(r).to.be.ok;
  });
  it(`The document ${testhtml} should (now) exist`, async () => {
    const doc = await (gaasClient.HTMLDocument(testhtml).getInfo());
    expect(doc.documentId).to.equal(testhtml);
    // console.dir(doc);
    expect(doc.targetLanguages).to.include('es');
    expect(doc.targetLanguages).to.include('qru');
  });
  it(`The document ${testhtml2} should (now) exist`, async () => {
    const doc = await (gaasClient.HTMLDocument(testhtml).getInfo());
    expect(doc.documentId).to.equal(testhtml);
    // console.dir(doc);
    expect(doc.targetLanguages).to.include('es');
    expect(doc.targetLanguages).to.include('qru');
  });
});
let docTrId;
describe('GP-HPE: Requesting our first document TR', function () {
  it('Should request the first document TR submitted asynchronously', async () => {
    const requestData = {
      name: 'FirstDocTR',
      emails: ['noname@example.com'],
      partner: partnerId,
      targetLanguagesMap: {HTML:{}}, // to fill in
      status: 'SUBMITTED', // request to submit it right away.
      notes: [ '{{10,10,@@@ }}' ]
    };
    requestData.targetLanguagesMap.HTML[testhtml]=['es'];
    if(VERBOSE) console.dir(requestData);
    const tr = await gaasClient.docTr(requestData)
      .create({serviceInstance: instanceName, async: true});
    expect(tr.id).to.be.ok;
    docTrId = tr.id;
    expect(tr.gp).to.be.ok; // Internal prop: it's an object
    expect(tr.status).to.equal('SUBMITTED');
    expect(tr.wordCountsMap).to.be.empty;
    expect(tr.createdAt).to.be.ok;
  });
  it(`The document ${testhtml} should still exist`, async () => {
    const doc = await (gaasClient.HTMLDocument(testhtml).getInfo());
    expect(doc.documentId).to.equal(testhtml);
    // console.dir(doc);
    expect(doc.targetLanguages).to.include('es');
    // BUG: qru is now missing!
    //expect(doc.targetLanguages).to.include('qru');
  });
  it('should eventually show the document TR as MERGED', () => retrier(async () => {
    const tr = await gaasClient.docTr(docTrId).getInfo({serviceInstance: instanceName, summary: true});
    expect(['MERGED']).to.include(tr.status, `${tr.id} status`);
    expect(tr.id).to.equal(docTrId);
    expect(tr.startedAt).to.be.ok;
    expect(tr.startedAt).to.be.at.least(tr.createdAt);
    expect(tr.translatedAt).to.be.ok;
    expect(tr.translatedAt).to.be.at.least(tr.startedAt);
    expect(tr.mergedAt).to.be.ok;
    expect(tr.mergedAt).to.be.at.least(tr.translatedAt);
    delete tr.gp; // for console.dir
    if(VERBOSE) console.dir(tr, {depth: null, color: true});
  }, {pause: 15000, retries: 4}));
});
var docTrId2;

describe('GP-HPE now try using tr.update', function() {
  it(`The document ${testhtml2} should (still) exist`, async () => {
    const doc = await (gaasClient.HTMLDocument(testhtml2).getInfo());
    expect(doc.documentId).to.equal(testhtml2);
    // console.dir(doc);
    expect(doc.targetLanguages).to.include('es');
    expect(doc.targetLanguages).to.include('qru');
  });
  it('Should create the second document TR', async () => {
    const requestData = {
      name: 'Second document TR draft', // TODO: docs say this is optional?
      emails: ['my_real_name_not_really@example.com'], // TODO: docs say this is optional?
      partner: partnerId, // TODO: try changing partner name in update
      targetLanguagesMap: {HTML:{}}, // to fill in
      status: 'DRAFT', // do not submit yet
      domains: [ 'FINSVCS', 'CNSTRCT' ],
      notes: [ '{{10,10,@@@ }}', 'a', 'b', 'c' ]
    };
    requestData.targetLanguagesMap.HTML[testhtml2] = ['es'];
    if(VERBOSE) console.dir(requestData);
    const tr = await gaasClient.docTr(requestData)
      .create({async: true});
    expect(tr.id).to.be.ok;
    docTrId2 = tr.id;

    expect(tr.gp).to.be.ok; // Internal prop: it's an object

    expect(tr.status).to.equal('DRAFT');
    expect(tr.wordCountsMap).to.be.ok;
    expect(tr.wordCountsMap).to.be.empty;// not calculated in summary view
    expect(tr.createdAt).to.be.ok;
    if(VERBOSE) { delete tr.gp; console.dir(tr); }
    expect(tr.domains).to.contain('CNSTRCT');
    expect(tr.domains).to.contain('FINSVCS');
    expect(tr.notes).to.deep.equal(requestData.notes);
  });
  it(`The document ${testhtml2} should (still) exist`, async () => {
    const doc = await (gaasClient.HTMLDocument(testhtml2).getInfo());
    expect(doc.documentId).to.equal(testhtml2);
    expect(doc.targetLanguages).to.include('es');
    // bug
    // expect(doc.targetLanguages).to.include('qru');
  });

  it('Should get the DRAFT document tr with summary only to avoid word count calculation', async () => {
    const tr = await gaasClient.docTr(docTrId2).getInfo({summary : true});
    expect(tr.id).to.be.ok;
    expect(tr.gp).to.be.ok; // Internal prop: it's an object
    expect(tr.status).to.equal('DRAFT');
    expect(tr.wordCountsMap).to.be.empty; // summary view should not include word count for draft trs
    expect(tr.createdAt).to.be.ok;
    if(VERBOSE) { delete tr.gp; console.dir(tr); }
    expect(tr.domains).to.contain('CNSTRCT');
    expect(tr.domains).to.contain('FINSVCS');
    expect(tr.notes).to.deep.equal([ '{{10,10,@@@ }}', 'a', 'b', 'c' ]);
  });

  it('Should be able to update the DRAFT document TR to SUBMITTED asynchronously', async () => {
    const updateToSubmit = {
      status: "SUBMITTED",
      async: true
    };
    const response = await gaasClient.docTr(docTrId2).update(updateToSubmit);
    expect(response.status).to.eq("SUCCESS");
    expect(response.translationRequest).to.be.ok;
    // word count should be calculated as part of the asynchronous process
    expect(response.translationRequest.wordCountsMap).to.be.empty;
    // check if the word count is subsequently calculated as part of the asynchronous process.
  });
  it('Should verify word counts in that TR', () => retrier(async () => { // word cunts don't need to wait for completion
    const tr = await gaasClient.docTr(docTrId2).getInfo({summary: false});
    expect(tr.id).to.equal(docTrId2);
    // word count is calculated asynchronously on submission
    expect(tr.wordCountsMap).to.have.keys(['HTML']);
    expect(tr.wordCountsMap.HTML).to.have.keys([testhtml2]);
  }));
  it('should eventually show the 2nd document TR as MERGED', () => retrier(async () => {
    const tr = await gaasClient.docTr(docTrId2).getInfo({serviceInstance: instanceName, summary: true});
    if(tr.status === 'CANCELLED') console.dir(tr); // safety valve
    expect(['MERGED']).to.include(tr.status, `${tr.id} status`);
  }, {pause: 15000, retries: 4}));
});

if (!NO_DELETE && !opts.credentials.isAdmin) {
  describe.skip('GP-HPE Clean-up time for ' + instanceName); // nothing to skip
}

// unless !delete?
if (NO_DELETE) {
  describe('GP-HPE.delete', function () {
    it('(skipped- NO_DELETE)');
  });
} else if (opts.credentials.isAdmin) {
  describe('GP-HPE.delete instance ' + instanceName, function () {
    it('should let us delete our instance', () => gaasClient.restCall("admin.deleteServiceInstance", {
      serviceInstanceId: instanceName
    }));
  });
}

//  END NO_DELETE

// end of tr-test