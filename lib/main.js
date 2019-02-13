/*
 * Copyright IBM Corp. 2015-2017
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

const Client = require('./client.js');
const Consts = require('./consts.js');
const utils = require('./utils.js');

/**
 * @private
 */

let didWarnGetClient = false;

/**
 * @author Steven R. Loomis
 */

/**
 * Construct a g11n-pipeline client.
 * params.credentials is required unless params.appEnv is supplied.
 * Required either: (userId & password) or (apikey & iam_endpoint)
 * @param {Object} params - configuration params
 * @param {Object} params.appEnv - pass the result of cfEnv.getAppEnv(). Ignored if params.credentials is supplied.
 * @param {Object.<string,string>} params.credentials - Bound credentials as from the CF service broker (overrides appEnv)
 * @param {string} params.credentials.url - service URL. (should end in '/translate')
 * @param {string} params.credentials.userId - GP auth userid.
 * @param {string} params.credentials.password - GP auth password.
 * @param {string} params.credentials.apikey - IAM apikey
 * @param {string} params.credentials.iam_endpoint - IAM endpoint
 * @param {string} params.credentials.instanceId - instance ID
 * @returns {Client}
 * @function getClient
 * @deprecated use create() which returns a promise
 */
exports.getClient = function getClient(params) {
  const client = new Client(params);
  /* eslint no-console: "off" */
  client.swaggerClient.catch((error) => {
    console.error(`g11n-pipeline: Error connecting to ${params.credentials.url}: ${error.message}`);
    if(!didWarnGetClient) {
      didWarnGetClient = true;
      /* eslint no-irregular-whitespace: "off" */
      console.warn(`g11n-pipeline: Please use “await require('g11n-pipeline').connect(…)” instead of “.getClient()”`);
    }
  });
  return client;
};

/**
 * Create a GP client… returns a promise to the client.
 */
exports.connect = function connect(params) {
  return new Promise((resolve, reject) => {
    const client = new Client(params);
    client.swaggerClient.then(() => resolve(client), (error) => reject(error));
  });
};

// re export these…
exports.serviceRegex = Consts.serviceRegex;
exports.exampleCredentials = Consts.exampleCredentials;
exports.exampleCredentialsString = Consts.exampleCredentialsString;
exports._normalizeUrl = utils._normalizeUrl;
