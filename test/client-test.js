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

//return true;

var gaas; // required, below
var expect = require('chai').expect;
var assert = require('assert');

var VERBOSE = process.env.GAAS_VERBOSE || false;
if(VERBOSE) console.dir(module.filename);

var projectId = process.env.GAAS_PROJECT  || 'MyHLProject'+Math.random();
var projectId2 = process.env.GAAS_PROJECT2 || 'MyOtherHLProject'+Math.random();

var opts = {
};

describe('Setting up GaaS test', function() {
  var vcapEnv = process.env.VCAP_SERVICES || null;
  var apiKeyEnv = process.env.GAAS_API_KEY || null;
  var urlEnv = process.env.GAAS_API_URL || null;

  if ( vcapEnv ) {
    opts.vcap = vcapEnv;
    it('requiring gaas with VCAP_SERVICES', function(done) {
      gaas = require('../index.js')(opts);
      if(VERBOSE) console.log( gaas._getUrl() );
      done();
    });
  } else if ( apiKeyEnv && urlEnv ) {
    it('requiring gaas with GAAS_API_KEY and GAAS_API_URL', function(done) {
      opts.api = apiKeyEnv;
      opts.url = urlEnv;
      gaas = require('../index.js')(opts);
      if(VERBOSE) console.log( gaas._getUrl() );
      done();
    });
  } else {
    it('should have had either VCAP_SERVICES or GAAS_API_KEY and GAAS_API_URL',  function(done) {
      done('please set either VCAP_SERVICES, or GAAS_API_KEY and GAAS_API_URL');
    });
  }
});

var GT = function gaasTest(method, path, fcn, input, good, bad) {
  it(method+' '+path+' gaas.'+fcn+'()', function(done) {
    if(typeof(bad) === 'undefined') {
      bad = function(){return false;}
    }
    if ( VERBOSE ) {
      console.log('REQUEST');
      console.log('~~~ js');
      console.log(JSON.stringify(input));
      console.log('~~~');
    }
    if(typeof(gaas[fcn]) !== 'function') {
      done(Error('Not a function: gaas.'+fcn));
    } else {
      gaas[fcn](input, function(resp) {
      if ( VERBOSE ) {
        console.log('RESPONSE');
        console.log('~~~ js');
        console.log(JSON.stringify(resp));
        console.log('~~~');
      }
        good(done, resp);
      }, function(err) {
           if(!bad(err, done)) {
             if(typeof(err) === 'string') {
               done(Error(err));
             } else if(typeof(err) === 'object') {
               if(err.message) {
                 done(Error(err.message));
               } else if(err.error) {
                 done(Error(err.error+' '+err.status));
               } else {
                 done(err);
               }
             } else {
               done(err);
             }
           }
         });
    }
  });
};

// getInfo
describe('Verifying that we can reach the server', function() {
  GT('GET','/service', 'rest_getInfo', {}, function(done, resp) {
    expect(resp.status).to.equal('success');
    expect(resp.supportedTranslation).to.include.keys('en');
    expect(resp.supportedTranslation.en).to.include('de');
    done();
  });
});

describe('gaas.supportedTranslations()', function() {
  it('Should let us list translations', function(done) {
    gaas.supportedTranslations({}, function(translations) {
      if(VERBOSE) console.dir(translations);
      expect(translations).to.include.keys('en');
      expect(translations.en).to.include('de');
      done();
    }, done);
  });
});

describe('gaas.project()', function() {
  it('Should let us create a client', function(done) {
    var proj = gaas.project('Something');
    expect(proj.id).to.equal('Something');
    done();
  });
});

// skipping pre-cleanup for now, using random project ids

describe('gaas.listProjects()', function() {
  it('Should let us list projects, not including ' + projectId + ' or ' + projectId2, function(done) {
    gaas.listProjects({}, function(projList) {
      if(VERBOSE) console.dir(projList);
      expect(projList).to.not.include.keys(projectId);
      expect(projList).to.not.include.keys(projectId2);
      // if(CLEANSLATE) expect(projList).to.be.empty()
      done();
    }, done);
  });
});

describe('gaas.project('+projectId+').create()', function() {
  it('Should let us create', function(done) {
    var proj = gaas.project(projectId);
    proj.create({sourceLanguage: 'en', targetLanguages: ['es','qru']}, function good(resp) {
      done();
    }, done);
  });
});



describe('gaas.listProjects()', function() {
  it('Should let us list projects including ' + projectId + ' but not ' + projectId2, function(done) {
    gaas.listProjects({}, function(projList) {
      if(VERBOSE) console.dir(projList);
      expect(projList).to.include.keys(projectId);
      expect(projList).to.not.include.keys(projectId2);
      // if(CLEANSLATE) expect(projList).to.be.empty()
      done();
    }, done);
  });
});

describe('gaas.project('+projectId+').remove()', function() {
  it('Should let us delete', function(done) {
    var proj = gaas.project(projectId);
    proj.remove({}, function good(resp) {
      done();
    }, done);
  });
});


describe('gaas.listProjects()', function() {
  it('Should let us list projects, not including ' + projectId + ' or ' + projectId2, function(done) {
    gaas.listProjects({}, function(projList) {
      if(VERBOSE) console.dir(projList);
      expect(projList).to.not.include.keys(projectId);
      expect(projList).to.not.include.keys(projectId2);
      // if(CLEANSLATE) expect(projList).to.be.empty()
      done();
    }, done);
  });
});
