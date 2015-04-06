//* IBM Globalization
//* IBM Confidential / Copyright (C) IBM Corp. 2015
// High Level test of GAAS API

var gaas; // required, below
var expect = require('chai').expect;
var assert = require('assert');

var VERBOSE = process.env.GAAS_VERBOSE || false;

var opts = {
  project: process.env.GAAS_TEST_PROJECTID || ('GaasTestProject'+Math.random())
};

describe('Setting up GaaS test, using GAAS_TEST_PROJECTID=' + opts.project, function() {
  var vcapEnv = process.env.VCAP_SERVICES || null;
  var apiKeyEnv = process.env.GAAS_API_KEY || null;
  var urlEnv = process.env.GAAS_API_URL || null;

  if ( vcapEnv ) {
    opts.vcap = vcapEnv;
    it('requiring gaas with VCAP_SERVICES', function(done) {
      gaas = require('../index.js')(opts);
      console.log( gaas._getUrl() );
      done();
    });
  } else if ( apiKeyEnv && urlEnv ) {
    it('requiring gaas with GAAS_API_KEY and GAAS_API_URL', function(done) {
      opts.api = apiKeyEnv;
      opts.url = urlEnv;
      gaas = require('../index.js')(opts);
      console.log( gaas._getUrl() );
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
    if ( VERBOSE ) {
      console.log('REQUEST');
      console.log('~~~ js');
      console.log(JSON.stringify(input));
      console.log('~~~');
    }
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
           done(err);
         }
    });
  });
};

// getInfo
describe('Verifying that we can reach the server', function() {
  GT('GET','/service', 'getInfo', {}, function(done, resp) {
    expect(resp.status).to.equal('success');
    it('should contain English', function(done) {
      expect(resp.supportedTranslation).to.include.keys('en');
      done();
    });
    it('should translate to German', function(done) {
      expect(resp.supportedTranslation.en).to.include('de');
      done();
    });
    done();
  });
});