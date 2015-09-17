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
var url = require('url');
var expect = require('chai').expect;
var byscheme = require('./byscheme');

module.exports.getCredentials = function getCredentials() {
 return {
    // api_key: apiKeyEnv,
    uri: process.env.GAAS_API_URL || null,
    instanceId: process.env.GAAS_INSTANCE_ID || "n/a",
    userId: process.env.GAAS_ADMIN_ID || process.env.GAAS_USER_ID || null,
    password: process.env.GAAS_ADMIN_PASSWORD || process.env.GAAS_USER_PASSWORD || null
  };
};


function expectResCORSHeaders(res) {
  expect(res.headers).to.be.ok;
  expect(res.headers).to.contain.key('access-control-allow-headers');
  expect(res.headers['access-control-allow-headers']).to.equal('x-requested-with, Content-Type, api-key, Authorization');
  expect(res.headers).to.contain.key('access-control-allow-methods');
  expect(res.headers['access-control-allow-methods']).to.equal('GET');
  expect(res.headers).to.contain.key('access-control-allow-origin');
  expect(res.headers['access-control-allow-origin']).to.equal('*');
}

function expectResNonCORSHeaders(res) {
  expect(res.headers).to.be.ok;
  expect(res.headers).to.not.contain.key('access-control-allow-headers');
  expect(res.headers).to.not.contain.key('access-control-allow-methods');
  expect(res.headers).to.not.contain.key('access-control-allow-origin');
}

/**
 * Utility function for a GET where CORS is set
 */
function expectResCORSGET(res, done) {
  expectResCORSHeaders(res);
  done();
}


/**
 * Utility function for a GET where CORS is set
 */
function expectResNonCORSGET(res, done) {
  expectResNonCORSHeaders(res);
  done();
}


/**
 * Set up an 'options' block for the specified method.
 */
function optionsCreate(swaggerUrl, method) {
  var options = url.parse(swaggerUrl);
  options.url = swaggerUrl;
  options.method = method;
  
  return options;
}

function optionsAuth(options, auth) {
  if(auth) auth(options);
  return options;
}

var methods = ['GET', 'OPTIONS'];
/**
 * verify this URL DOES have CORS and other headers set
 * @param swaggerUrl - url to check
 * @param auth - function(options) -  apply auth to options obj. Can set 'options.auth' or headers, etc
 */
module.exports.expectCORSURL = function expectCORSURL(swaggerUrl, auth, str) {
  if(!str) str = '';
  methods.forEach(function (method) {
    var optionsGet = optionsCreate(swaggerUrl, method);
    it('Should let me ' + method + ' ' + swaggerUrl + ' w/ CORS ' + (auth?' (auth) ':' ') + str, function (done) {
      var oreq = byscheme(swaggerUrl).request(optionsAuth(optionsGet, auth),
        function (res) {
          if(method === 'GET') {
            expect(res.statusCode).to.equal(200);
          } else if(method === 'OPTIONS') {
            if(swaggerUrl.indexOf('/swagger.json')=== -1) {
              expect(res.statusCode).to.equal(204);
            } else {
              expect(res.statusCode).to.equal(200);
            }
          }
          expectResCORSGET(res, done);
        })
        .on('error', done);
      oreq.end();
    });
  });
}

/**
 * verify this URL does NOT have CORS, but verify other headers set
 * @param swaggerUrl - url to check
 * @param auth - function(options) -  apply auth to options obj. Can set 'options.auth' or headers, etc
 */
module.exports.expectNonCORSURL = function expectNonCORSURL(swaggerUrl, auth, str) {
  if(!str) str = '';
  methods.forEach(function (method) {
    var optionsGet = optionsCreate(swaggerUrl, method);
    it('Should NOT let me ' + method + ' ' + swaggerUrl + ' w/ CORS' + (auth?' (auth) ':' ') + str, function (done) {
      var oreq = byscheme(swaggerUrl).get(optionsAuth(optionsGet, auth),
        function (res) {
          if(method === 'GET') {
            expect(res.statusCode).to.equal(200);
          } else if(method === 'OPTIONS') {
            expect(res.statusCode).to.equal(200);
          }
          expectResNonCORSGET(res, done);
        })
        .on('error', done);
      oreq.end();
    });
  });
}

