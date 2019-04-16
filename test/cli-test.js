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
var minispin = require('./lib/minispin');
var randHex = require('./lib/randhex');
var gpTest = require ('./lib/gp-test');
var GaasHmac = require('../lib/gp-hmac');
const Cli = require('../lib/gpcli');

var GP = require('../lib/main.js'); // required, below
var client;

// var ourReaderKey; // to be filled in - API key.
// var ourReaderClient; // to be filled in - separate client that's just a reader.

const chai = require('chai');
const expect = chai.expect;
const chaiHtml  = require('chai-html');
// const chaiFs = require('chai-fs');
chai.use(chaiHtml);
// chai.use(chaiFs);

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


describe('cli test utility', function() {
  it('should run parseArgs', () => {
    const parsed = Cli.parseArgs('node g11n-pipeline-cli export -b mybundle -l en -F json'.split(' '));
    expect(parsed).to.deep.equal({
      _: [ 'export'],
      bundle: 'mybundle',
      b: 'mybundle',
      languages: 'en',
      l: 'en',
      outputFormat: 'json',
      F: 'json',
      help: false
    });
  });
  it('should format JSON', () => {
    const formatted = new Cli({
      _: [ 'export'],
      outputFormat: 'json'
    })
      .filter({foo: 'bar'});
    expect(formatted).to.deep.equal(JSON.stringify({foo: 'bar'}));
  });
  it('should format none', () => {
    const formatted = new Cli({
      _: [ 'export'],
      outputFormat: 'none'
    })
      .filter({foo: 'bar'});
    expect(formatted).to.not.be.ok;
  });
  it('should format compact', () => {
    const formatted = new Cli({
      _: [ 'export'],
      outputFormat: 'compact'
    })
      .filter({foo: 'bar'});
    expect(formatted).to.deep.equal({foo: 'bar'});
  });
  it('should format line (array)', () => {
    const formatted = new Cli({
      _: [ 'export'],
      outputFormat: 'line'
    })
      .filter(['a','b','c'])
    expect(formatted).to.deep.equal('a\nb\nc'); // no trailing \n
  });
  it('should format line (obj)', () => {
    const formatted = new Cli({
      _: [ 'export'],
      outputFormat: 'line'
    })
      .filter({a:1, b:2, c:3})
    expect(formatted).to.deep.equal('a\nb\nc');
  });
});


describe('Setting up cli test', function() {
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


    it('requiring g11n-pipeline with options', function(done) {
      client = GP.getClient(opts);
      //if(VERBOSE) console.log( client._getUrl() );
      done();
    });
  } else {
    // no creds
    it('should have had credentials',  function(done) {
      done('please create local-credentials.json or have GP_URL/GP_USER_ID/GP_PASSWORD/GP_INSTANCE set');
    });
  }

  if(serviceInstanceId === randInstanceName) {
    it(`should let us create the random instance ${randInstanceName}`, () => GP.getClient(opts).restCall("admin.createServiceInstance",
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
  }
});

// ping
describe('cli: Verifying again that we can reach the server', function() {
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

describe('cli test', () => {
  it('should be able to print out help', async () => {
    const output = await new Cli({
      _: [ 'help' ]
    }).run();
    expect(output).to.be.ok;
    expect(output.about).to.be.ok;
  });
  it('should be able to print out help with no opts', async () => {
    const output = await new Cli({
      _: [ ] // no options
    }).run();
    expect(output).to.be.ok;
    expect(output.about).to.be.ok;
  });
  it('should not be able to ping server without options', async () => {
    const output = await new Cli({
      _: [ 'ping' ]
    }).run()
      .catch((e) => e.message);

    expect(output).to.not.equal(true);
  });
  it('should be able to ping server', async () => {
    const output = await new Cli({
      _: [ 'ping' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint
    }).run();

    expect(output).to.equal(true);
  });
  it('should be able to list bundles', async () => {
    const output = await new Cli({
      _: [ 'list' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint
    }).run();

    expect(output).to.be.ok;
  });
  it('should be able to call info', async () => {
    const output = await new Cli({
      _: [ 'info' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint
    }).run();

    expect(output).to.be.ok;
  });
  it('should be able to call instanceInfo', async () => {
    const output = await new Cli({
      _: [ 'instanceInfo' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint
    }).run();

    expect(output).to.be.ok;
  });
  it('should be able to call create', async () => {
    const output = await new Cli({
      _: [ 'create' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'mybundle',
      languages: 'en,mt,fr'
    }).run();

    expect(output).to.be.ok;
  });
  it('should be able to call show', async () => {
    const output = await new Cli({
      _: [ 'show' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'mybundle'
    }).run();

    expect(output).to.be.ok;
    expect(output.targetLanguages).to.contain('fr');
    expect(output.targetLanguages).to.contain('mt');
    expect(output.id).to.equal('mybundle');
  });
  it('should be able to call update', async () => {
    const output = await new Cli({
      _: [ 'update' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'mybundle',
      languages: 'es,fr,mt' // add some target languages
    }).run();

    expect(output).to.be.ok;
  });
  it('should be able to call import', async () => {
    const output = await new Cli({
      _: [ 'import' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'mybundle',
      languages: 'en',
      file: 'test/data/t1_0_en.json'
    }).run();

    expect(output).to.be.ok;
  });
  it('should be able to call trs', async () => {
    const output = await new Cli({
      _: [ 'trs' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint
    }).run();

    expect(output).to.be.ok;
  });
  it('should be able to call docTrs', async () => {
    const output = await new Cli({
      _: [ 'docTrs' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint
    }).run();

    expect(output).to.be.ok;
  });
  it('should be able to call export', async () => {
    const output = await new Cli({
      _: [ 'export' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'mybundle',
      languages: 'en'
    }).run();
    expect(output).to.deep.equal(require('./data/t1_0_en.json'))
  });
  it('should be able to call export -T no change', async () => {
    const output = await new Cli({
      _: [ 'export' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'mybundle',
      languages: 'en',
      flatten: true
    }).run();
    expect(output).to.deep.equal(require('./data/t1_0_en.json'))
  });
  it('should be able to call import -T with no change', async () => {
    const output = await new Cli({
      _: [ 'import' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'mybundle',
      languages: 'en',
      file: 'test/data/t1_0_en.json',
      flatten: true
    }).run();

    expect(output).to.be.ok;
  });
  it('should be able to call export -T no change', async () => {
    const output = await new Cli({
      _: [ 'export' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'mybundle',
      languages: 'en',
      flatten: true
    }).run();
    expect(output).to.deep.equal(require('./data/t1_0_en.json'))
  });
  it('should be able to call delete', async () => {
    const output = await new Cli({
      _: [ 'instanceInfo' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'mybundle'
    }).run();

    expect(output).to.be.ok;
  });
});

describe('cli flatten/unflatten test', () => {
  it('should be able to call create', async () => {
    const output = await new Cli({
      _: [ 'create' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'flattest',
      languages: 'en'
    }).run();

    expect(output).to.be.ok;
  });
  it('should be able to call import with -T', async () => {
    const output = await new Cli({
      _: [ 'import' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'flattest',
      languages: 'en',
      file: 'test/data/flattest.json',
      flatten: true
    }).run();

    expect(output).to.be.ok;
  });
  it('should be able to call export', async () => {
    const output = await new Cli({
      _: [ 'export' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'flattest',
      languages: 'en'
    }).run();
    expect(output).to.deep.equal(require('./data/flattest-expand.json'))
  });
  it('should be able to call export -T ', async () => {
    const output = await new Cli({
      _: [ 'export' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'flattest',
      languages: 'en',
      flatten: true
    }).run();
    expect(output).to.deep.equal(require('./data/flattest.json'))
  });
  it('should be able to call delete', async () => {
    const output = await new Cli({
      _: [ 'instanceInfo' ],
      serviceUrl: opts.credentials.url,
      instanceId: opts.credentials.instanceId,
      user: opts.credentials.userId,
      password: opts.credentials.password,
      apikey: opts.credentials.apikey,
      iam_endpoint: opts.credentials.iam_endpoint,
      bundle: 'flattest'
    }).run();

    expect(output).to.be.ok;
  });
});

// unless !delete?
if(NO_DELETE) {
  describe('client.delete', function() {
    it('(skipped- NO_DELETE)');
  });
} else if(opts.credentials.isAdmin) {
  describe('client.delete instance ' + serviceInstanceId, function() {
    it('should let us delete our instance', () => client.restCall("admin.deleteServiceInstance", {
      serviceInstanceId: serviceInstanceId
    }));
  });
}
//  END NO_DELETE

// end of client-test
