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

// High Level test of GAAS API

// load locals
require('./lib/localsetenv').applyLocal();

//return true;

var gaasTest = require ('./lib/gp-test');
var randHex = require('./lib/randhex');
var randInstanceName = randHex()+'-'+randHex()
const opts = { credentials: gaasTest.getCredentials() };
var instanceName = (opts.credentials.instanceId) // given
                    || randInstanceName;  // random


var gaas = require('../lib/main.js'); // required, below
var gaasClient = gaas.getClient(opts);
let readerClient;

const chai = require('chai');
const expect = chai.expect;


describe('Partner: setup', () => {
  if(opts.credentials.isAdmin) it('should let us create our instance', () => gaasClient.restCall("admin.createServiceInstance", 
    {
      serviceInstanceId: instanceName,
      body: {
        serviceId: 'rand-'+randHex(),
        orgId: 'rand-'+randHex(),
        spaceId: 'rand-'+randHex(),
        planId: 'rand-'+randHex(),
        disabled: false
      }
    }));
  // We are creating a READER user.
  // This is a way of intentionally dropping privileges.
  // This way we will test that all of the partner APIs
  // return failure.
  it('Should be able to create a reader user on ' + instanceName, () =>
    gaasClient.createUser({
      serviceInstance: instanceName,
      type: 'READER',
      bundles: [],
      displayName: 'Not Usable Reader'
    })
      .then((data) => {
        readerClient = gaas.getClient({
          credentials: {
            partnerId: 'TST',
            instanceId: instanceName,
            userId: data.user.id,
            password: data.user.password,
            url: opts.credentials.url
          }
        });
      }));
});

describe('Partner: test APIs with reader (expected access denied)', () => {
  it('Should be able to verify the TST id', () => {
    expect(readerClient.partner()).to.be.ok;
    expect(readerClient.partner().partnerId).to.equal('TST');
  });

  it('updatePartnerTranslationRequest', (done) => {
    readerClient
      .partner()
      .updatePartnerTranslationRequest({
        serviceInstanceId: instanceName,
        requestId: randHex(),
        body: {
          status: 'STARTED'
        }
      }, (err, data) => {
        expect(err).to.be.ok;
        // console.dir(err);
        return done();
      });
  });

  it('deletePartnerTranslationRequest', (done) => {
    readerClient
      .partner()
      .deletePartnerTranslationRequest({
        serviceInstanceId: instanceName,
        requestId: randHex()
        // body: {
        //   status: 'STARTED'
        // }
      }, (err, data) => {
        expect(err).to.be.ok;
        // console.dir(err);
        return done();
      });
  });

  it('updatePartnerTRWithXliff', (done) => {
    readerClient
      .partner()
      .updatePartnerTRWithXliff({
        serviceInstanceId: instanceName,
        requestId: randHex()
        // body: {
        //   status: 'STARTED'
        // }
      }, (err, data) => {
        expect(err).to.be.ok;
        // console.dir(err);
        return done();
      });
  });

  it('getPartnerXliffFromTR', (done) => {
    readerClient
      .partner()
      .getPartnerXliffFromTR({
        serviceInstanceId: instanceName,
        requestId: randHex()
        // body: {
        //   status: 'STARTED'
        // }
      }, (err, data) => {
        expect(err).to.be.ok;
        // console.dir(err);
        return done();
      });
  });

  it('createPartner', (done) => {
    readerClient
      .partner()
      .createPartner({}, (err, data) => {
        expect(err).to.be.ok;
        // console.dir(err);
        return done();
      });
  });

  it('deletePartner', (done) => {
    readerClient
      .partner()
      .createPartner({}, (err, data) => {
        expect(err).to.be.ok;
        // console.dir(err);
        return done();
      });
  });

  if(opts.credentials.isAdmin) {
    describe('partner delete instance ' + instanceName, function() {
      it('should let us delete our instance', () => gaasClient.restCall("admin.deleteServiceInstance", {
        serviceInstanceId: instanceName
      }));
    });
  }
});
