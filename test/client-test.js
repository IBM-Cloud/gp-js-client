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

var Q = require('q');

var minispin = require('./lib/minispin');
var randHex = require('./lib/randhex');
var gaasTest = require ('./lib/gp-test');
var GaasHmac = require('../lib/gp-hmac');

if(process.env.NO_CLIENT_TEST) { console.log('skip: ' + module.filename); return; }
var gaas = require('../index.js'); // required, below
var gaasClient;

var ourReaderKey; // to be filled in - API key.
var ourReaderClient; // to be filled in - separate client that's just a reader.

var expect = require('chai').expect;
var assert = require('assert');

var VERBOSE = process.env.GP_VERBOSE || false;
var NO_DELETE = process.env.NO_DELETE || false;
if(VERBOSE) console.dir(module.filename);

var projectId = process.env.GP_PROJECT  || 'MyHLProject'+Math.random();
var projectId2 = process.env.GP_PROJECT2 || 'MyOtherHLProject'+Math.random();
var projectId3 = process.env.GP_PROJECT3 || 'MyUserProject'+Math.random();

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
  credentials: gaasTest.getCredentials()
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
var urlEnv = gaas._normalizeUrl(opts.credentials.url); // use GaaS normalize
  
describe('Setting up GaaS test', function() {
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
    
    
    it('requiring gaas with options', function(done) {
      gaasClient = gaas.getClient(opts);
      //if(VERBOSE) console.log( gaasClient._getUrl() );
      done();
    });
  } else {
    // no creds
    it('should have had credentials',  function(done) {
      done('please create local-credentials.json or have GP_URL/GP_USER_ID/GP_PASSWORD/GP_INSTANCE set');
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

var randInstanceName = randHex()+'-'+randHex()
var instanceName = (opts.credentials.instanceId) // given
                    || randInstanceName;  // random


describe('gaasClient.setup instance ' + instanceName, function() {
  it('should’t let me query the bundle list yet for ' + randInstanceName, function(done) {
    // ADMIN:  instance should not exist.
    try {
      gaasClient.getBundleList({serviceInstance: randInstanceName}, function(err, data) {
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
  if(opts.credentials.isAdmin) it('should let us create our instance', function(done) {
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
        if(opts.credentials.isAdmin) {
          expect(data.length).to.equal(0);
        } else {
          if(VERBOSE && data.length >0) {
            console.log('Note: You have pre existing instances. That’s probably ok, though best to run this test with a clean slate.');
          }
        }
        done();
      }
    });
  });
  // it('should now let me query the bundle list (promises!)', function(done) {
  //   gaasClient.getBundleList({serviceInstance: instanceName})
  //   .then(function(data) {
  //       expect(data.length).to.equal(0);
  //       done();
  //   },done);
  // });
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
    Q.ninvoke(proj, "create", {sourceLanguage: 'en', targetLanguages: ['es','qru']})
    .then(function(resp) {
      done();
    }, done);
  });
  it('should now let me query the bundle list (promises!)', function(done) {
    Q.ninvoke(gaasClient, "getBundleList", {serviceInstance: instanceName})
    .then(function(data) {
        expect(data).to.contain(projectId);
        done();
    },done);
  });

  var myUserInfo = undefined;  
  var readerInfo = undefined;
  it('should let me create an admin user', function(done) {
    Q.ninvoke(gaasClient, "createUser", {serviceInstance: instanceName,
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
        url: opts.credentials.url
      };
      done();
    },done);
  });
  it('should let me create a reader user', function(done) {
    Q.ninvoke(gaasClient, "createUser", {serviceInstance: instanceName,
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
      readerInfo = {
          credentials: {
            instanceId: instanceName,
            userId: data.user.id,
            password: data.user.password,
            url: opts.credentials.url
          },
          bundleId: projectId3
        };
      if(VERBOSE || NO_DELETE) console.dir({
        sampleconfig: readerInfo
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
    Q.ninvoke(proj, "delete", {})
    .then(function(resp) {
      done();
    }, done);
  });
  it('should now let me query the bundle list again (promises!)', function(done) {
    Q.ninvoke(gaasClient, "getBundleList", {serviceInstance: instanceName})
    .then(function(data) {
        expect(data).to.not.contain(projectId);
        done();
    },done);
  });
  if(!opts.credentials.isAdmin)  
     it('should now let me query the bundle list again without an instance id (promises!)', function(done) {
    Q.ninvoke(gaasClient, "getBundleList", {})
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
  it('test gaasClient(myuser).bundle('+projectId3+').create(...)', function(done) {
    expect(subGaasClient).to.be.ok; // from previous test
    expect(myUserInfo).to.be.ok; // otherwise, user creation failed
    
    var proj = subGaasClient.bundle({id:projectId3});
    
    Q.ninvoke(proj, "create", {sourceLanguage: 'en', targetLanguages: ['es','qru']})
    .then(function(resp) {
      Q.ninvoke(proj, "uploadResourceStrings", {languageId: 'en', strings: {
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
/*
readerInfo{
          credentials: {
            instanceId: instanceName,
            userId: data.user.id,
            password: data.user.password,
            uri: opts.credentials.uri
          },
          bundleId: projectId3
        }
         */
        
  // check READER
  var myAuth = function(opts){opts.auth = (readerInfo.credentials.userId+':'+readerInfo.credentials.password); };

  // if(opts.credentials.isAdmin) {
  
    gaasTest.expectCORSURL(urlEnv + '/rest/swagger.json',
                        myAuth, ' reader');
  
    // hardcoded URL here..
    gaasTest.expectCORSURL(urlEnv + '/rest/' + instanceName + '/v2/bundles/'+projectId3+'/qru',
                        myAuth, ' reader');
  
    // // this should authenticate but NOT be CORS
  
  
    // check ADMINISTRATOR
    var myAdminAuth = function(opts) {
      if(!opts.headers) opts.headers = {};
      // this is a callback because the user info isn't defined until AFTER the inner 'it()' is called. 
      var myHmac = new GaasHmac('gaashmac',myUserInfo.userId,
                myUserInfo.password);
      myHmac.apply(opts);
    };
  
    gaasTest.expectCORSURL(urlEnv + '/rest/swagger.json',
                        myAdminAuth, ' admin');
  
    // hardcoded URL here..
    gaasTest.expectCORSURL(urlEnv + '/rest/' + instanceName + '/v2/bundles/'+projectId3+'/qru',
                        myAdminAuth, ' admin');
    // if(isAdmin) {
    //   gaasTest.expectNonCORSURL(urlEnv + '/rest/' + instanceName + '/v2/bundles',
    //                       myAdminAuth, ' admin');    
    // }
  
  if(!NO_DELETE && !opts.credentials.isAdmin) {
    describe('Clean-up time for ' + instanceName, function() {
      it('should let me delete an admin user', function(done) {
        gaasClient.deleteUser({userId: myUserInfo.userId}, done)
      });
      it('should let me delete a reader user', function(done) {
        gaasClient.deleteUser({userId: readerInfo.credentials.userId}, done)
      });
    });
  }
});

// unless !delete?
if(NO_DELETE) {
  describe('gaasClient.delete', function() {
    it('(skipped- NO_DELETE)');
  });
} else if(opts.credentials.isAdmin) {
    describe('gaasClient.delete instance ' + instanceName, function() {
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
}
//  END NO_DELETE

// end of client-test