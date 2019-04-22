/*
 * Copyright IBM Corp. 2015-2019
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

/* eslint no-console: "off" */
const { URL } = require('url');
const bent = require('bent');
const querystring = require('querystring');
const grant_type = 'urn:ibm:params:oauth:grant-type:apikey';
const tokenExpiryThreshold= process.env.IAM_TOKEN_EXPIRY_THRESHOLD_PROP_KEY || 0.85;
const fetchToken = bent('json', // JSON response
  'POST', // POST method
  {
    // headers
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json'
  },
  200); // expect 200

/**
 * Manage use of IAM API Keys and Tokens
 * Docs: https://cloud.ibm.com/docs/iam?topic=iam-iamtoken_from_apikey&locale=en#iamtoken_from_apikey
 *
 * @author Steven R. Loomis
 * @ignore
 */

const GpIAM = function GpIAM(credentials) {
  this.credentials = credentials;
  if(!this.credentials || !this.credentials.apikey || !this.credentials.iam_endpoint) {
    throw new Error('GpIAM: params need to be "apikey, iam_endpoint"');
  }
  this.tokenUrl = new URL('/identity/token', this.credentials.iam_endpoint);

  if(!this.GP_USE_APIKEY) {
    const now = new Date();
    this.ourCacheKey = `${this.credentials.iam_endpoint}#${this.credentials.apikey}`;

    this.updateToken = (async function updateToken(x) {
      const apikey = this.credentials.apikey;
      const cacheEntry = GpIAM.prototype.tokenCache[this.ourCacheKey] =
       GpIAM.prototype.tokenCache[this.ourCacheKey] || {/* initialized to empty */};
      // if(this.VERBOSE) {
      //   const tokenn = token.n = (token.n || 0) + 1;
      //   console.log(`Token count: ${tokenn} ${this.ourCacheKey}`);
      // }

      if (!cacheEntry.validUntil ||        // no token
          (now > cacheEntry.validUntil)) { // or expired

        delete this.access_token; // in case we run into a failure.
        const tokenResponse = await fetchToken(this.tokenUrl, Buffer.from(querystring.stringify({
          grant_type,
          apikey
        })));

        // save the entire response
        cacheEntry.tokenResponse = tokenResponse;

        // get the response time
        const { expires_in } = tokenResponse;

        cacheEntry.validUntil = new Date(now.getTime() + (1000 * expires_in * tokenExpiryThreshold));
        if(this.VERBOSE) {
          console.log('Fetched access token ');
        }
      }
      if(this.VERBOSE) {
        console.log(`Token valid until ${cacheEntry.validUntil}`);
      }

      // save off the access token
      this.access_token = cacheEntry.tokenResponse.access_token;

      return x;
    }).bind(this);
  }
};

GpIAM.prototype.tokenCache = {};

GpIAM.prototype.API_KEY = "API-KEY"; // GP SPECIFIC header

GpIAM.prototype.VERBOSE = process.env.GP_VERBOSE || false;
GpIAM.prototype.GP_USE_APIKEY = process.env.GP_USE_APIKEY || false; // if false: use token manager

/**
 * Generate HTTP Authorization header.
 */
GpIAM.prototype.apply = function(obj) {
  if(this.VERBOSE) console.dir(obj, {color: true, depth: null});
  if(obj.url.indexOf("/swagger.json") !== -1) return obj; // skip for swagger.json

  if(this.access_token) {
    const authHeader = 'Bearer ' + this.access_token;
    if(this.VERBOSE) console.log('Authorization: ' + authHeader.replace(this.access_token, '****'));
    obj.headers.Authorization = authHeader;
  } else {
    const authHeader = this.API_KEY + ' ' + this.credentials.apikey;
    if(this.VERBOSE) console.log('Authorization: ' + authHeader.replace(this.credentials.apikey, '****'));
    obj.headers.Authorization = authHeader;
  }
  return obj;
};

module.exports = GpIAM;
