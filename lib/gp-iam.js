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
};

GpIAM.prototype.API_KEY = "API-KEY"; // GP SPECIFIC header

GpIAM.prototype.VERBOSE = process.env.GP_VERBOSE || false;
GpIAM.prototype.GP_USE_APIKEY = process.env.GP_USE_APIKEY || true; // if false: use token manager

/**
 * Generate HTTP Authorization header.
 */
GpIAM.prototype.apply = function(obj) {
  if(this.VERBOSE) console.dir(obj, {color: true, depth: null});
  if(obj.url.indexOf("/swagger.json") !== -1) return obj; // skip for swagger.json

  const authHeader = this.API_KEY + ' ' + this.credentials.apikey;
  if(this.VERBOSE) console.log('Authorization: ' + authHeader.replace(this.credentials.apikey, '****'));
  obj.headers.Authorization = authHeader;
  return obj;
};

module.exports = GpIAM;
