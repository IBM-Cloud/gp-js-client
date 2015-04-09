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

var gaas = require('../index.js'); // required, below
var gaasClient;
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
      gaasClient = gaas.getClient(opts);
      if(VERBOSE) console.log( gaasClient._getUrl() );
      done();
    });
  } else if ( apiKeyEnv && urlEnv ) {
    it('requiring gaas with GAAS_API_KEY and GAAS_API_URL', function(done) {
      opts.api = apiKeyEnv;
      opts.url = urlEnv;
      gaasClient = gaas.getClient(opts);
      if(VERBOSE) console.log( gaasClient._getUrl() );
      done();
    });
  } else {
    it('should have had either VCAP_SERVICES or GAAS_API_KEY and GAAS_API_URL',  function(done) {
      done('please set either VCAP_SERVICES, or GAAS_API_KEY and GAAS_API_URL');
    });
  }
});

// ping
describe('Verifying that we can reach the server', function() {
  it('Should let us call gaasClient.ping', function(done) {
    gaasClient.ping({}, function(err, data) {
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

describe('gaasClient.project()', function() {
  it('Should let us create a client', function(done) {
    var proj = gaasClient.project('Something');
    expect(proj.id).to.equal('Something');
    done();
  });
});
// skipping pre-cleanup for now, using random project ids

describe('gaasClient.listProjects()', function() {
  it('Should let us list projects, not including ' + projectId + ' or ' + projectId2, function(done) {
    gaasClient.listProjects({}, function(err, projList) {
      if(err) { done(err); return; }
      if(VERBOSE) console.dir(projList);
      expect(projList).to.not.include.keys(projectId);
      expect(projList).to.not.include.keys(projectId2);
      // if(CLEANSLATE) expect(projList).to.be.empty()
      done();
    });
  });
});

describe('gaasClient.project('+projectId+').create()', function() {
  it('Should let us create', function(done) {
    var proj = gaasClient.project(projectId);
    proj.create({sourceLanguage: 'en', targetLanguages: ['es','qru']}, function(err, resp) {
      if(err) { done(err); return; }
      // TODO: verify
      done();
    }, done);
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
