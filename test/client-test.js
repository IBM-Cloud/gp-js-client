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

//return true;

var minispin = require('./lib/minispin');
var randHex = require('./lib/randhex');
var gaasTest = require ('./lib/gaas-test');

if(process.env.NO_CLIENT_TEST) { console.log('skip: ' + module.filename); return; }
var gaas = require('../index.js'); // required, below
var gaasClient;

var ourReaderKey; // to be filled in - API key.
var ourReaderClient; // to be filled in - separate client that's just a reader.

var expect = require('chai').expect;
var assert = require('assert');

var VERBOSE = process.env.GAAS_VERBOSE || false;
var NO_DELETE = process.env.NO_DELETE || false;
if(VERBOSE) console.dir(module.filename);

var projectId = process.env.GAAS_PROJECT  || 'MyHLProject'+Math.random();
var projectId2 = process.env.GAAS_PROJECT2 || 'MyOtherHLProject'+Math.random();
var projectId3 = process.env.GAAS_PROJECT3 || 'MyUserProject'+Math.random();

var sourceData = {
    "key1": "@DELAY@First string to translate",
    "key2": "Second string to translate"
};
var str3 = 'The main pump fixing screws with the correct strength class';
var qruData = {
  key1: "Фирст стринг то транслате",
  key2: "Сецонд стринг то транслате"
};

var opts = {
};

function resterr(o) {
  if(!o) {
    return Error("(falsy object)");
  }
  if(o.data && o.message) {
    return Error(o.data.message);
  } else if(o.message) {
    return Error(o.message);
  }
}

describe('Setting up GaaS test', function() {

  opts.credentials = gaasTest.getCredentials();
  
  var urlEnv = opts.credentials.uri;

  if ( urlEnv ) {
    var urlToPing = urlEnv+'/';
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
          minispin.step();
          try {
            http_or_https.get(urlToPing, // trailing slash to avoid 302
            function(d) {
               if(VERBOSE) console.log(urlToPing + '-> ' + d.statusCode); // dontcare
               if(d.statusCode === 200) {
                 minispin.clear();
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
    
    
    it('requiring gaas with GAAS_API_KEY and GAAS_API_URL', function(done) {
      gaasClient = gaas.getClient(opts);
      //if(VERBOSE) console.log( gaasClient._getUrl() );
      done();
    });
  } else {
    // no creds
    it('should have had GAAS_API_KEY and GAAS_API_URL',  function(done) {
      done('please set GAAS_API_KEY and GAAS_API_URL');
    });
  }
});

// ping
describe('Verifying again that we can reach the server', function() {
  it('Should let us call gaasClient.ping', function(done) {
      if(process.env.BAIL_ON_ERR && !gaasClient.hasOwnProperty('ping')) {
        console.error('Could not reach server');
        process.exit(1);
      }
    gaasClient.ping({}, function(err, data) {
      
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

describe('gaasClient.supportedTranslations()', function() {
  it('Should let us list translations', function(done) {
    gaasClient.supportedTranslations({}, function(err, translations) {
      if(err) { done(err); return; }
      if(VERBOSE) console.dir(translations);
      expect(translations).to.include.keys('en');
      expect(translations.en).to.include('de');
      done();
    });
  });
});

var instanceName = randHex()+'-'+randHex();


describe('gaasClient.setup instance ' + instanceName, function() {
  it('should’t let me query the bundle list yet', function(done) {
    try {
      gaasClient.getBundleList({serviceInstance: instanceName}, function(err, data) {
        if(err) {
          if(VERBOSE) console.dir(err);
          done();
        } else {
          done(Error('Expected failure here.'));
        }
      });
    } catch(e) {
      if(VERBOSE) console.dir(e);
      done(); // expect
    }
  });
  it('should let us create our instance', function(done) {
    gaasClient.ready(done, function(err, done, apis) {
      if(err) { done(err); return; }
      apis.admin.createServiceInstance({
        serviceInstanceId: instanceName,
        body: {
          serviceId: 'rand-'+randHex(),
          orgId: 'rand-'+randHex(),
          spaceId: 'rand-'+randHex(),
          planId: 'rand-'+randHex(),
          disabled: false
        }
      }, function onSuccess(o) {
        if(o.obj.status !== 'SUCCESS') {
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
  it('should now let me query the bundle list (cb)', function(done) {
    gaasClient.getBundleList({serviceInstance: instanceName}, function(err, data) {
      if(err) {
        done(err);
      } else {
        expect(data.length).to.equal(0);
        done();
      }
    });
  });
  it('should now let me query the bundle list (promises!)', function(done) {
    gaasClient.getBundleList({serviceInstance: instanceName})
    .then(function(data) {
        expect(data.length).to.equal(0);
        done();
    },done);
  });
});

describe('gaasClient.bundle()', function() {
  it('Should let us create a bundle accessor', function(done) {
    var proj = gaasClient.bundle({id:'Something', serviceInstance: instanceName});
    expect(proj.id).to.equal('Something');
    done();
  });
  it('Should let us create a bundle accessor again', function(done) {
    var proj = gaasClient.bundle('Something');
    expect(proj.id).to.equal('Something');
    done();
  });
  it('Should let us create', function(done) {
    var proj = gaasClient.bundle({id:projectId, serviceInstance: instanceName});
    proj.create({sourceLanguage: 'en', targetLanguages: ['es','qru']})
    .then(function(resp) {
      done();
    }, done);
  });
  it('should now let me query the bundle list (promises!)', function(done) {
    gaasClient.getBundleList({serviceInstance: instanceName})
    .then(function(data) {
        expect(data).to.contain(projectId);
        done();
    },done);
  });

  var myUserInfo = undefined;  
  it('should let me create a user', function(done) {
    gaasClient.createUser({serviceInstance: instanceName,
                           type:'ADMINISTRATOR',
                           bundles: ['*'],
                           displayName: 'Somebody'})
    .then(function(data) {
      expect(data).to.be.ok;
      expect(data.user).to.be.ok;
      expect(data.id).to.be.ok;
      expect(data.user).to.be.ok;
      expect(data.user.id).to.be.ok;
      expect(data.user.password).to.be.ok;
      expect(data.user.displayName).to.equal('Somebody');
      if(VERBOSE || NO_DELETE) console.dir(data,{color:true});
      myUserInfo = {
        instanceId: instanceName,
        userId: data.user.id,
        password: data.user.password,
        uri: opts.credentials.uri
      };
      done();
    },done);
  });
  it('should let me create a reader user', function(done) {
    gaasClient.createUser({serviceInstance: instanceName,
                           type:'READER',
                           bundles: [projectId3],
                           displayName: 'Reador'})
    .then(function(data) {
      expect(data).to.be.ok;
      expect(data.user).to.be.ok;
      expect(data.id).to.be.ok;
      expect(data.user).to.be.ok;
      expect(data.user.id).to.be.ok;
      expect(data.user.password).to.be.ok;
      expect(data.user.displayName).to.equal('Reador');
      // Dump sample config data.
      if(VERBOSE || NO_DELETE) console.dir({
        sampleconfig: {
          credentials: {
            instanceId: instanceName,
            userId: data.user.id,
            password: data.user.password,
            uri: opts.credentials.uri
          },
          bundleId: projectId3
        }
      },{color:true});
      done();
    },done);
  });
  //   it('Should let us verify the project info', function(done) {
//     var proj = gaasClient.project(projectId);
//     proj.getInfo({}, function(err, proj2) {
//       if(err) { done(err); return; }
//       expect(proj2.readerKey).to.be.a('string');
//       expect(proj2.id).to.equal(projectId);
//       expect(proj2.sourceLanguage).to.equal('en');
//       expect(proj2.targetLanguages).to.include('es');
//       expect(proj2.targetLanguages).to.include('qru');
//       expect(proj2.targetLanguages).to.not.include('zxx');
//       done();
//     });
//   });
//   it('Should NOT let us verify nonexistent ' + projectId2, function(done) {
//     var proj = gaasClient.project(projectId2);
//     proj.getInfo({}, function(err, proj2) {
//       if(err) { done(); return; }
// console.dir(proj2);
//       done(Error('expected this to fail.'));
//     });
//   });
  it('Should let us delete', function(done) {
    var proj = gaasClient.bundle({id:projectId, serviceInstance: instanceName});
    proj.delete()
    .then(function(resp) {
      done();
    }, done);
  });
  it('should now let me query the bundle list again (promises!)', function(done) {
    gaasClient.getBundleList({serviceInstance: instanceName})
    .then(function(data) {
        expect(data).to.not.contain(projectId);
        done();
    },done);
  });
  var subGaasClient;
  it('test gaasClient(myuser).ping', function(done) {
    expect(myUserInfo).to.be.ok; // otherwise, user creation failed
    
    subGaasClient = gaas.getClient({credentials: myUserInfo});
    subGaasClient.ping({}, done);
  });
  it('test gaasClient(myuser).createBundle('+projectId3+')', function(done) {
    expect(myUserInfo).to.be.ok; // otherwise, user creation failed
    
    subGaasClient = gaas.getClient({credentials: myUserInfo});
    var proj = subGaasClient.bundle({id:projectId3});
    
    proj.create({sourceLanguage: 'en', targetLanguages: ['es','qru']})
    .then(function(resp) {
      // I promise to fix this.
      proj.uploadResourceStrings({languageId: 'en', strings: {
        hello: 'Hello, World!'
      }})
      .then(function(resp){ done(); }, done);
    }, done);
  });
/*
    var proj = gaasClient.bundle({id:projectId, serviceInstance: instanceName});
    proj.create({sourceLanguage: 'en', targetLanguages: ['es','qru']})
    .then(function(resp) {
      done();
    }, done);*/
});

// unless !delete?
if(NO_DELETE) {
  describe('gaasClient.delete', function() {
    it('(skipped- NO_DELETE)');
  });
} else describe('gaasClient.delete instance ' + instanceName, function() {
  it('should let us delete our instance', function(done) {
    gaasClient.ready(done, function(err, done, apis) {
      if(err) { done(err); return; }
      apis.admin.deleteServiceInstance({
        serviceInstanceId: instanceName
      }, function onSuccess(o) {
        if(o.obj.status !== 'SUCCESS') {
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
//  END DELETE +++++


return; // @@@@@@@

describe('gaasClient.project('+projectId+')', function() {
  it('should let us update some data(en)', function(done) {
    var proj = gaasClient.project(projectId);
    proj.updateResourceData({ languageID: 'en',
                              body: { replace: false, retry: false, data: sourceData}},done);
  });
  // at this point, the qru data will not have finished.
  it('should show qru as in progress', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceEntry({ languageID: 'qru', resKey: 'key1'},
    function(err, entry) {
      if(err) {done(err); return; }
      expect(entry.language).to.equal('qru');
      expect(entry.key).to.equal('key1');
      expect(entry.translationStatus).to.equal("inProgress");
      done();
    });
  });
  // wait for qru to finish
  it('should let qru finish', function(done) {
    var proj = gaasClient.project(projectId);
    var loopy = function() {
      minispin.step();
      proj.getResourceEntry({ languageID: 'qru', resKey: 'key1'},
      function(err, entry) {
        if(err) {done(err); return; }
        expect(entry.language).to.equal('qru');
        expect(entry.key).to.equal('key1');
        if(VERBOSE) process.stderr.write(entry.translationStatus);
        if(entry.translationStatus === "inProgress") {
          setTimeout(loopy, 500); // try again
        } else {
          expect(entry.translationStatus).to.equal("completed"); // if not in progress, better be done.
          minispin.clear();
          done(); // get out.
        }
      });
    };
    process.nextTick(loopy); // first run
  });
  // qru should be done now.
  it('should NOT us update the wrong language(tlh)', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.updateResourceData({ languageID: 'tlh',
                              body: { replace: false, retry: false, data: sourceData}},
    function(err){if(err){done(); return;} done(Error('should have failed')); });
  });
  it('should let us verify the source data(en)', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceData({ languageID: 'en'},
    function(err, data) {
      if(err) {done(err); return; }
      expect(data.language).to.equal('en');
      expect(data).to.have.a.property('data');
      expect(JSON.stringify(data.data)).to.equal(JSON.stringify(sourceData));
      done();
    });
  });
  it('should let us verify one key (en/key1)', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceEntry({ languageID: 'en', resKey: 'key1'},
    function(err, entry) {
      if(err) {done(err); return; }
      expect(entry.language).to.equal('en');
      expect(entry.key).to.equal('key1');
      expect(entry.value).to.equal(sourceData.key1);
      done();
    });
  });
  it('should let us verify the target data(qru)', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceData({ languageID: 'qru'},
    function(err, data) {
      if(err) {done(err); return; }
      expect(data.language).to.equal('qru');
      expect(data).to.have.a.property('data');
      expect(JSON.stringify(data.data)).to.equal(JSON.stringify(qruData));
      done();
    });
  });
  it('should let us verify one key (qru/key1)', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceEntry({ languageID: 'qru', resKey: 'key1'},
    function(err, entry) {
      if(err) {done(err); return; }
      expect(entry.language).to.equal('qru');
      expect(entry.key).to.equal('key1');
      expect(entry.value).to.equal(qruData.key1);
      done();
    });
  });
  it('should let us add language zxx', function(done) {
    var proj = gaasClient.project(projectId);
    proj.addTargetLanguages({newTargetLanguages:['zxx']}, done);
  });
  it('Should let us verify the project info', function(done) {
    var proj = gaasClient.project(projectId);
    proj.getInfo({}, function(err, proj2) {
      if(err) { done(err); return; }
      expect(proj2.readerKey).to.be.a('string');
      expect(proj2.readerKey).to.not.equal(opts.credentials.api_key);
      ourReaderKey = proj2.readerKey; // set this
      expect(proj2.id).to.equal(projectId);
      expect(proj2.sourceLanguage).to.equal('en');
      expect(proj2.targetLanguages).to.include('es');
      expect(proj2.targetLanguages).to.include('qru');
      expect(proj2.targetLanguages).to.include('zxx');
      done();
    });
  });
  it('Should let us use the reader key', function(done) {
    ourReaderClient = gaas.getClient({
      credentials: {
        uri: opts.credentials.uri,
        api_key: ourReaderKey
      }
    });
    var ourReaderProject = ourReaderClient.project(projectId);
    ourReaderProject.getResourceEntry({ languageID: 'qru', resKey: 'key1'},
    function(err, entry) {
      if(err) {done(err); return; }
      expect(entry.language).to.equal('qru');
      expect(entry.key).to.equal('key1');
      expect(entry.value).to.equal(qruData.key1);
      done();
    });
  });

  it('should let us verify failed target data(zxx)', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceData({ languageID: 'zxx'},
    function(err, data) {
      if(err) {done(err); return; }
      expect(data.language).to.equal('zxx');
      expect(data).to.have.a.property('data');
      expect(JSON.stringify(data.data)).to.equal(JSON.stringify({})); //‽
      expect(data.failed).to.include('key1');
      expect(data.failed).to.include('key2');
      done();
    });
  });
  it('Should let us modify one entry(qru)', function(done) {
    var proj = gaasClient.project(projectId);
    proj.updateResourceData({ languageID: 'qru',
                              body: { replace: false, retry: false, data: {key1:str3} } },
                            done);
  });
  it('should let us verify one key (qru/key1) again', function(done) {
    var proj = gaasClient.project(projectId);    
    proj.getResourceEntry({ languageID: 'qru', resKey: 'key1'},
    function(err, entry) {
      if(err) {done(err); return; }
      expect(entry.language).to.equal('qru');
      expect(entry.key).to.equal('key1');
      expect(entry.value).to.equal(str3);
      done();
    });
  });
  it('should let us delete language qru', function(done) {
    var proj = gaasClient.project(projectId);
    proj.deleteLanguage({languageID: 'qru'}, done);
  });    
  it('Should let us verify the project info', function(done) {
    var proj = gaasClient.project(projectId);
    proj.getInfo({}, function(err, proj2) {
      if(err) { done(err); return; }
      expect(proj2.readerKey).to.be.a('string');
      expect(proj2.id).to.equal(projectId);
      expect(proj2.sourceLanguage).to.equal('en');
      expect(proj2.targetLanguages).to.include('es');
      expect(proj2.targetLanguages).to.not.include('qru');
      expect(proj2.targetLanguages).to.include('zxx');
      done();
    });
  });
}); 

describe('gaasClient.listProjects()', function() {
  it('Should let us list projects including ' + projectId + ' but not ' + projectId2, function(done) {
    gaasClient.listProjects({}, function(err, projList) {
      if(err) { done(err); return; }
      if(VERBOSE) console.dir(projList);
      expect(projList).to.include.keys(projectId);
      expect(projList).to.not.include.keys(projectId2);
      // if(CLEANSLATE) expect(projList).to.be.empty()
      done();
    }, done);
  });
});



describe('gaasClient.project('+projectId+').remove()', function() {
  it('Should let us delete', function(done) {
    var proj = gaasClient.project(projectId);
    proj.remove({}, function cb(err, resp) {
      if(err) { done(err); return; }
      done();
    }, done);
  });
});


describe('gaasClient.listProjects()', function() {
  it('Should let us list projects, not including ' + projectId + ' or ' + projectId2, function(done) {
    gaasClient.listProjects({}, function(err, projList) {
      if(err) { done(err); return; }
      if(VERBOSE) console.dir(projList);
      expect(projList).to.not.include.keys(projectId);
      expect(projList).to.not.include.keys(projectId2);
      // if(CLEANSLATE) expect(projList).to.be.empty()
      done();
    }, done);
  });
});
