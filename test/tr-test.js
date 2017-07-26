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

// test of Translation Request API

// load locals
require('./lib/localsetenv').applyLocal();

//return true;

var Q = require('q');

var minispin = require('./lib/minispin');
var randHex = require('./lib/randhex');
var gaasTest = require('./lib/gp-test');
var GaasHmac = require('../lib/gp-hmac');

if (process.env.NO_TR_TEST) { describe = describe.skip; }
var gaas = require('../index.js'); // required, below
var gaasClient;

var ourReaderKey; // to be filled in - API key.
var ourReaderClient; // to be filled in - separate client that's just a reader.

var expect = require('chai').expect;
var assert = require('assert');

var VERBOSE = process.env.GP_VERBOSE || false;
var NO_DELETE = process.env.NO_DELETE || false;
if (VERBOSE) console.dir(module.filename);

var projectId = process.env.GP_TR_PROJECT || 'MyTRProject' + Math.random();

var DELAY_AVAIL = process.env.DELAY_AVAIL || false;


// MS to loop when waiting for things to happen.
var UNTIL_DELAY = 1024;

var sourceData = {
  "human": "human",
  "being": "being"
};

var sourceDataUpd = {
  "human": "Human",
  "being": "being",
  "editor": "editor"
};

var qruData = {
  "human": "хуман",
  "being": "беинг"
};

var opts = {
  credentials: gaasTest.getCredentials()
};

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
    it('requiring gaas with options', function (done) {
      gaasClient = gaas.getClient(opts);
      //if(VERBOSE) console.log( gaasClient._getUrl() );
      done();
    });
  } else {
    // no creds
    it('should have had credentials', function (done) {
      done('please create local-credentials.json or have GP_URL/GP_USER_ID/GP_PASSWORD/GP_INSTANCE set');
    });
  }
});

// ping
describe('GP-HPE Verifying again that we can reach the server', function () {
  it('Should let us call gaasClient.ping', function (done) {
    if (process.env.BAIL_ON_ERR && !gaasClient.hasOwnProperty('ping')) {
      console.error('Could not reach server');
      process.exit(1);
    }
    gaasClient.ping({}, function (err, data) {

      if (err && process.env.BAIL_ON_ERR) {
        console.error('Could not reach server');
        process.exit(1);
      }

      if (err) { done(err); return; }
      if (VERBOSE) console.dir(data);
      done();
    });
  });
});

var randInstanceName = randHex() + '-' + randHex()
var instanceName = (opts.credentials.instanceId) // given
  || randInstanceName;  // random

describe('GP-HPE.setup instance ' + instanceName, function () {
  if (opts.credentials.isAdmin) it('should let us create our instance', function (done) {
    gaasClient.ready(done, function (err, done, apis) {
      if (err) { done(err); return; }
      apis.admin.createServiceInstance({
        serviceInstanceId: instanceName,
        body: {
          serviceId: 'rand-' + randHex(),
          orgId: 'rand-' + randHex(),
          spaceId: 'rand-' + randHex(),
          planId: 'rand-' + randHex(),
          disabled: false
        }
      }, function onSuccess(o) {
        if (o.obj.status !== 'SUCCESS') {
          done(Error(o.obj.status));
        } else {
          //console.dir(o.obj, {depth: null, color: true});
          done();
        }
      }, function onFailure(o) {
        done(resterr(o));
      });
    });
  });
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

describe('GP-HPE.bundle()', function () {
  it('Should let us create', function (done) {
    var proj = gaasClient.bundle({ id: projectId, serviceInstance: instanceName });
    Q.ninvoke(proj, "create", {
      sourceLanguage: gaasTest.SOURCES[0],
      targetLanguages: [gaasTest.TARGETS[0], gaasTest.CYRILLIC],
      notes: ['Note to self']
    })
      .then(function (resp) {
        done();
      }, done);
  });

  it('GP-HPE Should let us upload some strings ' + projectId, function (done) {
    var proj = gaasClient.bundle({ id: projectId, serviceInstance: instanceName });
    proj.uploadStrings({
      languageId: gaasTest.SOURCES[0],
      strings: sourceData
    }, done);
  });

  // In any event, wait until key2 has SUCCEEDED. if @DELAY@ is used this may take some time, otherwise could already be done.
  it('GP-HPE Should let us wait until human has TRANSLATED', function (done) {
    var proj = gaasClient.bundle({ id: projectId, serviceInstance: instanceName });
    var entry = proj.entry({ languageId: gaasTest.CYRILLIC, resourceKey: 'human' });
    var loopy = function () {
      minispin.step();
      entry.getInfo({},
        function (err, data) {
          if (err) { minispin.clear(); done(err); return; }
          if (VERBOSE) console.dir(data);
          if (data.translationStatus === 'IN_PROGRESS') {
            setTimeout(loopy, 1024);
          } else {
            expect(data.translationStatus).to.equal('TRANSLATED');
            expect(data.value).to.equal(qruData.human);
            minispin.clear();
            done();
          }
        });
    };
    process.nextTick(loopy);
  });

  it('GP-HPE should let us verify the target data(qru)', function (done) {
    var proj = gaasClient.bundle({ id: projectId, serviceInstance: instanceName });
    proj.getStrings({ languageId: gaasTest.CYRILLIC },
      function (err, data) {
        if (err) { done(err); return; }
        //   console.dir(data);
        //   expect(data.language).to.equal(gaasTest.SOURCES[0]);
        expect(data).to.have.a.property('resourceStrings');
        expect(data.resourceStrings).to.deep.equal(qruData);
        done();
      });
  });

  it('GP-HPE Should let me update the review status of a bundle', function (done) {
    var entry = gaasClient
      .bundle({ id: projectId, serviceInstance: instanceName })
      .entry({ languageId: gaasTest.CYRILLIC, resourceKey: 'human' });
    entry.update({
      reviewed: true,
      sequenceNumber: 42,
      notes: ['Take note.', 'note: Take.']
    }, function (err, data) {
      if (err) return done(err);

      entry.getInfo({},
        function (err, entry2) {
          if (err) return done(err);
          expect(entry2.reviewed).to.be.true;
          expect(entry2.sequenceNumber).to.not.be.ok; // seq # ignored here
          entry.update({
            reviewed: false
          }, function (err, data) {
            if (err) return done(err);
            expect(entry2.reviewed).to.be.true; // unchanged
            entry.getInfo({},
              function (err, entry3) {
                if (err) return done(err);
                expect(entry3.reviewed).to.be.false;
                expect(entry3.notes).to.deep.equal(['Take note.', 'note: Take.'])
                done();
              });
          })
        });
    });
  });
});

if (!NO_DELETE && !opts.credentials.isAdmin) {
  describe('GP-HPE Clean-up time for ' + instanceName, function () {
    // it('should let me delete an admin user', function (done) {
    //   expect(myUserInfo.userId).to.be.ok;
    //   gaasClient.user(myUserInfo.userId).delete(done);
    // });
    // it('should let me delete a reader user', function (done) {
    //   expect(readerInfo.credentials.userId).to.be.ok;
    //   gaasClient.user(readerInfo.credentials.userId).delete(done);
    // });
    // it('Should let us call client.users() and verify users gone', function (done) {
    //   gaasClient.users({ serviceInstance: instanceName }, function (err, users) {
    //     if (err) return done(err);
    //     expect(users).to.be.ok;
    //     expect(users).to.not.contain.keys([myUserInfo.userId, readerInfo.credentials.userId])
    //     done();
    //   });
    // });
  });
}

// unless !delete?
if (NO_DELETE) {
  describe('GP-HPE.delete', function () {
    it('(skipped- NO_DELETE)');
  });
} else if (opts.credentials.isAdmin) {
  describe('GP-HPE.delete instance ' + instanceName, function () {
    it('should let us delete our instance', function (done) {
      gaasClient.ready(done, function (err, done, apis) {
        if (err) { done(err); return; }
        apis.admin.deleteServiceInstance({
          serviceInstanceId: instanceName
        }, function onSuccess(o) {
          if (o.obj.status !== 'SUCCESS') {
            done(Error(o.obj.status));
          } else {
            //console.dir(o.obj, {depth: null, color: true});
            done();
          }
        }, function onFailure(o) {
          done(Error('Failed: ' + o));
        });
      });
    });
  });
}
//  END NO_DELETE

// end of tr-test
